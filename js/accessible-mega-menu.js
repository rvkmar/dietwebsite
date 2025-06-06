if (jQuery) {
  (function ($) {
    "use strict";
    $(document).ready(function () {
      // initialize the megamenu
      $(".megamenu").accessibleMegaMenu();
    });
  })(jQuery);
}

/*global jQuery */
(function ($, window, document) {
  "use strict";
  var pluginName = "accessibleMegaMenu",
    defaults = {
      uuidPrefix: "menu", // unique ID's are required to indicate aria-owns, aria-controls and aria-labelledby
      menuClass: "menu", // default CSS class used to define the megamenu styling
      topNavItemClass: "menu-top-nav-item", // default CSS class for a top-level navigation item in the megamenu
      panelClass: "menu-panel", // default CSS class for a megamenu panel
      panelGroupClass: "menu-panel-group", // default CSS class for a group of items within a megamenu panel
      hoverClass: "hover", // default CSS class for the hover state
      focusClass: "focus", // default CSS class for the focus state
      openClass: "open", // default CSS class for the open state
    },
    Keyboard = {
      BACKSPACE: 8,
      COMMA: 188,
      DELETE: 46,
      DOWN: 40,
      END: 35,
      ENTER: 13,
      ESCAPE: 27,
      HOME: 36,
      LEFT: 37,
      PAGE_DOWN: 34,
      PAGE_UP: 33,
      PERIOD: 190,
      RIGHT: 39,
      SPACE: 32,
      TAB: 9,
      UP: 38,
      keyMap: {
        48: "0",
        49: "1",
        50: "2",
        51: "3",
        52: "4",
        53: "5",
        54: "6",
        55: "7",
        56: "8",
        57: "9",
        59: ";",
        65: "a",
        66: "b",
        67: "c",
        68: "d",
        69: "e",
        70: "f",
        71: "g",
        72: "h",
        73: "i",
        74: "j",
        75: "k",
        76: "l",
        77: "m",
        78: "n",
        79: "o",
        80: "p",
        81: "q",
        82: "r",
        83: "s",
        84: "t",
        85: "u",
        86: "v",
        87: "w",
        88: "x",
        89: "y",
        90: "z",
        96: "0",
        97: "1",
        98: "2",
        99: "3",
        100: "4",
        101: "5",
        102: "6",
        103: "7",
        104: "8",
        105: "9",
        190: ".",
      },
    };

  function AccessibleMegaMenu(element, options) {
    this.element = element;

    // merge optional settings and defaults into settings
    this.settings = $.extend({}, defaults, options);

    this._defaults = defaults;
    this._name = pluginName;

    this.mouseTimeoutID = null;
    this.focusTimeoutID = null;
    this.mouseFocused = false;
    this.justFocused = false;

    this.init();
  }

  AccessibleMegaMenu.prototype = (function () {
    /* private attributes and methods ------------------------ */
    var uuid = 0,
      keydownTimeoutDuration = 1000,
      keydownSearchString = "",
      isTouch =
        typeof window.hasOwnProperty === "function" &&
        !!window.hasOwnProperty("ontouchstart"),
      _getPlugin,
      _addUniqueId,
      _togglePanel,
      _clickHandler,
      _clickOutsideHandler,
      _DOMAttrModifiedHandler,
      _focusInHandler,
      _focusOutHandler,
      _keyDownHandler,
      _mouseDownHandler,
      _mouseOverHandler,
      _mouseOutHandler,
      _toggleExpandedEventHandlers;

    /**
     * @name jQuery.fn.accessibleMegaMenu~_getPlugin
     * @desc Returns the parent accessibleMegaMenu instance for a given element
     * @param {jQuery} element
     * @memberof jQuery.fn.accessibleMegaMenu
     * @inner
     * @private
     */
    _getPlugin = function (element) {
      return $(element)
        .closest(":data(plugin_" + pluginName + ")")
        .data("plugin_" + pluginName);
    };

    /**
     * @name jQuery.fn.accessibleMegaMenu~_addUniqueId
     * @desc Adds a unique id and element.
     * The id string starts with the
     * string defined in settings.uuidPrefix.
     * @param {jQuery} element
     * @memberof jQuery.fn.accessibleMegaMenu
     * @inner
     * @private
     */
    _addUniqueId = function (element) {
      element = $(element);
      var settings = this.settings;
      if (!element.attr("id")) {
        element.attr(
          "id",
          settings.uuidPrefix + "-" + new Date().getTime() + "-" + ++uuid
        );
      }
    };

    /**
     * @name jQuery.fn.accessibleMegaMenu~_togglePanel
     * @desc Toggle the display of mega menu panels in response to an event.
     * The optional boolean value 'hide' forces all panels to hide.
     * @param {event} event
     * @param {Boolean} [hide] Hide all mega menu panels when true
     * @memberof jQuery.fn.accessibleMegaMenu
     * @inner
     * @private
     */
    _togglePanel = function (event, hide) {
      var target = $(event.target),
        that = this,
        settings = this.settings,
        menu = this.menu,
        topli = target.closest("." + settings.topNavItemClass),
        panel = target.hasClass(settings.panelClass)
          ? target
          : target.closest("." + settings.panelClass),
        newfocus;

      _toggleExpandedEventHandlers.call(this, true);

      if (hide) {
        topli = menu
          .find(
            "." +
              settings.topNavItemClass +
              " ." +
              settings.openClass +
              ":first"
          )
          .closest("." + settings.topNavItemClass);
        if (
          !(
            topli.is(event.relatedTarget) ||
            topli.has(event.relatedTarget).length > 0
          )
        ) {
          if (
            (event.type === "mouseout" || event.type === "focusout") &&
            topli.has(document.activeElement).length > 0
          ) {
            return;
          }
          topli
            .find("[aria-expanded]")
            .attr("aria-expanded", "false")
            .removeClass(settings.openClass)
            .filter("." + settings.panelClass)
            .attr("aria-hidden", "true");
          if (
            (event.type === "keydown" && event.keyCode === Keyboard.ESCAPE) ||
            event.type === "DOMAttrModified"
          ) {
            newfocus = topli.find(":tabbable:first");
            setTimeout(function () {
              menu
                .find("[aria-expanded]." + that.settings.panelClass)
                .off("DOMAttrModified.menu");
              newfocus.focus();
              that.justFocused = false;
            }, 99);
          }
        } else if (topli.length === 0) {
          menu
            .find("[aria-expanded=true]")
            .attr("aria-expanded", "false")
            .removeClass(settings.openClass)
            .filter("." + settings.panelClass)
            .attr("aria-hidden", "true");
        }
      } else {
        clearTimeout(that.focusTimeoutID);
        topli
          .siblings()
          .find("[aria-expanded]")
          .attr("aria-expanded", "false")
          .removeClass(settings.openClass)
          .filter("." + settings.panelClass)
          .attr("aria-hidden", "true");
        topli
          .find("[aria-expanded]")
          .attr("aria-expanded", "true")
          .addClass(settings.openClass)
          .filter("." + settings.panelClass)
          .attr("aria-hidden", "false");
        if (
          event.type === "mouseover" &&
          target.is(":tabbable") &&
          topli.length === 1 &&
          panel.length === 0 &&
          menu.has(document.activeElement).length > 0
        ) {
          target.focus();
          that.justFocused = false;
        }

        _toggleExpandedEventHandlers.call(that);
      }
    };

    /**
     * @name jQuery.fn.accessibleMegaMenu~_clickHandler
     * @desc Handle click event on mega menu item
     * @param {event} Event object
     * @memberof jQuery.fn.accessibleMegaMenu
     * @inner
     * @private
     */
    _clickHandler = function (event) {
      var target = $(event.currentTarget),
        topli = target.closest("." + this.settings.topNavItemClass),
        panel = target.closest("." + this.settings.panelClass);
      if (
        topli.length === 1 &&
        panel.length === 0 &&
        topli.find("." + this.settings.panelClass).length === 1
      ) {
        if (!target.hasClass(this.settings.openClass)) {
          event.preventDefault();
          event.stopPropagation();
          _togglePanel.call(this, event);
          this.justFocused = false;
        } else {
          if (this.justFocused) {
            event.preventDefault();
            event.stopPropagation();
            this.justFocused = false;
          } else if (isTouch) {
            event.preventDefault();
            event.stopPropagation();
            _togglePanel.call(
              this,
              event,
              target.hasClass(this.settings.openClass)
            );
          }
        }
      }
    };

    /**
     * @name jQuery.fn.accessibleMegaMenu~_clickOutsideHandler
     * @desc Handle click event outside of a the megamenu
     * @param {event} Event object
     * @memberof jQuery.fn.accessibleMegaMenu
     * @inner
     * @private
     */
    _clickOutsideHandler = function (event) {
      if ($(event.target).closest(this.menu).length === 0) {
        event.preventDefault();
        event.stopPropagation();
        _togglePanel.call(this, event, true);
      }
    };

    /**
     * @name jQuery.fn.accessibleMegaMenu~_DOMAttrModifiedHandler
     * @desc Handle DOMAttrModified event on panel to respond to Windows 8 Narrator ExpandCollapse pattern
     * @param {event} Event object
     * @memberof jQuery.fn.accessibleMegaMenu
     * @inner
     * @private
     */
    _DOMAttrModifiedHandler = function (event) {
      if (
        event.originalEvent.attrName === "aria-expanded" &&
        event.originalEvent.newValue === "false" &&
        $(event.target).hasClass(this.settings.openClass)
      ) {
        event.preventDefault();
        event.stopPropagation();
        _togglePanel.call(this, event, true);
      }
    };

    /**
     * @name jQuery.fn.accessibleMegaMenu~_focusInHandler
     * @desc Handle focusin event on mega menu item.
     * @param {event} Event object
     * @memberof jQuery.fn.accessibleMegaMenu
     * @inner
     * @private
     */
    _focusInHandler = function (event) {
      clearTimeout(this.focusTimeoutID);
      var target = $(event.target),
        panel = target.closest("." + this.settings.panelClass);
      target
        .addClass(this.settings.focusClass)
        .on("click.menu", $.proxy(_clickHandler, this));
      this.justFocused = !this.mouseFocused;
      this.mouseFocused = false;
      if (this.panels.not(panel).filter("." + this.settings.openClass).length) {
        _togglePanel.call(this, event);
      }
    };

    /**
     * @name jQuery.fn.accessibleMegaMenu~_focusOutHandler
     * @desc Handle focusout event on mega menu item.
     * @param {event} Event object
     * @memberof jQuery.fn.accessibleMegaMenu
     * @inner
     * @private
     */
    _focusOutHandler = function (event) {
      this.justFocused = false;
      var that = this,
        target = $(event.target),
        topli = target.closest("." + this.settings.topNavItemClass),
        keepOpen = false;
      target.removeClass(this.settings.focusClass).off("click.menu");

      if (window.cvox) {
        // If ChromeVox is running...
        that.focusTimeoutID = setTimeout(function () {
          window.cvox.Api.getCurrentNode(function (node) {
            if (topli.has(node).length) {
              // and the current node being voiced is in
              // the mega menu, clearTimeout,
              // so the panel stays open.
              clearTimeout(that.focusTimeoutID);
            } else {
              that.focusTimeoutID = setTimeout(
                function (scope, event, hide) {
                  _togglePanel.call(scope, event, hide);
                },
                275,
                that,
                event,
                true
              );
            }
          });
        }, 25);
      } else {
        that.focusTimeoutID = setTimeout(function () {
          _togglePanel.call(that, event, true);
        }, 300);
      }
    };

    /**
     * @name jQuery.fn.accessibleMegaMenu~_keyDownHandler
     * @desc Handle keydown event on mega menu.
     * @param {event} Event object
     * @memberof jQuery.fn.accessibleMegaMenu
     * @inner
     * @private
     */
    _keyDownHandler = function (event) {
      var that =
          this.constructor === AccessibleMegaMenu ? this : _getPlugin(this), // determine the AccessibleMegaMenu plugin instance
        settings = that.settings,
        target = $(
          $(this).is("." + settings.hoverClass + ":tabbable")
            ? this
            : event.target
        ), // if the element is hovered the target is this, otherwise, its the focused element
        menu = that.menu,
        topnavitems = that.topnavitems,
        topli = target.closest("." + settings.topNavItemClass),
        tabbables = menu.find(":tabbable"),
        panel = target.hasClass(settings.panelClass)
          ? target
          : target.closest("." + settings.panelClass),
        panelGroups = panel.find("." + settings.panelGroupClass),
        currentPanelGroup = target.closest("." + settings.panelGroupClass),
        next,
        keycode = event.keyCode || event.which,
        start,
        i,
        o,
        label,
        found = false,
        newString = Keyboard.keyMap[event.keyCode] || "",
        regex,
        isTopNavItem = topli.length === 1 && panel.length === 0;

      if (
        target.is("input:focus, select:focus, textarea:focus, button:focus")
      ) {
        // if the event target is a form element we should handle keydown normally
        return;
      }

      if (target.is("." + settings.hoverClass + ":tabbable")) {
        $("html").off("keydown.menu");
      }

      switch (keycode) {
        case Keyboard.ESCAPE:
          _togglePanel.call(that, event, true);
          break;
        case Keyboard.DOWN:
          event.preventDefault();
          if (isTopNavItem) {
            _togglePanel.call(that, event);
            found =
              topli.find("." + settings.panelClass + " :tabbable:first").focus()
                .length === 1;
          } else {
            found =
              tabbables
                .filter(":gt(" + tabbables.index(target) + "):first")
                .focus().length === 1;
          }

          if (
            !found &&
            window.opera &&
            opera.toString() === "[object Opera]" &&
            (event.ctrlKey || event.metaKey)
          ) {
            tabbables = $(":tabbable");
            i = tabbables.index(target);
            found =
              $(
                ":tabbable:gt(" + $(":tabbable").index(target) + "):first"
              ).focus().length === 1;
          }
          break;
        case Keyboard.UP:
          event.preventDefault();
          if (isTopNavItem && target.hasClass(settings.openClass)) {
            _togglePanel.call(that, event, true);
            next = topnavitems.filter(
              ":lt(" + topnavitems.index(topli) + "):last"
            );
            if (next.children("." + settings.panelClass).length) {
              found =
                next
                  .children()
                  .attr("aria-expanded", "true")
                  .addClass(settings.openClass)
                  .filter("." + settings.panelClass)
                  .attr("aria-hidden", "false")
                  .find(":tabbable:last")
                  .focus() === 1;
            }
          } else if (!isTopNavItem) {
            found =
              tabbables
                .filter(":lt(" + tabbables.index(target) + "):last")
                .focus().length === 1;
          }

          if (
            !found &&
            window.opera &&
            opera.toString() === "[object Opera]" &&
            (event.ctrlKey || event.metaKey)
          ) {
            tabbables = $(":tabbable");
            i = tabbables.index(target);
            found =
              $(
                ":tabbable:lt(" + $(":tabbable").index(target) + "):first"
              ).focus().length === 1;
          }
          break;
        case Keyboard.RIGHT:
          event.preventDefault();
          if (isTopNavItem) {
            found =
              topnavitems
                .filter(":gt(" + topnavitems.index(topli) + "):first")
                .find(":tabbable:first")
                .focus().length === 1;
          } else {
            if (panelGroups.length && currentPanelGroup.length) {
              // if the current panel contains panel groups, and we are able to focus the first tabbable element of the next panel group
              found =
                panelGroups
                  .filter(
                    ":gt(" + panelGroups.index(currentPanelGroup) + "):first"
                  )
                  .find(":tabbable:first")
                  .focus().length === 1;
            }

            if (!found) {
              found = topli.find(":tabbable:first").focus().length === 1;
            }
          }
          break;
        case Keyboard.LEFT:
          event.preventDefault();
          if (isTopNavItem) {
            found =
              topnavitems
                .filter(":lt(" + topnavitems.index(topli) + "):last")
                .find(":tabbable:first")
                .focus().length === 1;
          } else {
            if (panelGroups.length && currentPanelGroup.length) {
              // if the current panel contains panel groups, and we are able to focus the first tabbable element of the previous panel group
              found =
                panelGroups
                  .filter(
                    ":lt(" + panelGroups.index(currentPanelGroup) + "):last"
                  )
                  .find(":tabbable:first")
                  .focus().length === 1;
            }

            if (!found) {
              found = topli.find(":tabbable:first").focus().length === 1;
            }
          }
          break;
        case Keyboard.TAB:
          i = tabbables.index(target);
          if (
            event.shiftKey &&
            isTopNavItem &&
            target.hasClass(settings.openClass)
          ) {
            _togglePanel.call(that, event, true);
            next = topnavitems.filter(
              ":lt(" + topnavitems.index(topli) + "):last"
            );
            if (next.children("." + settings.panelClass).length) {
              found = next
                .children()
                .attr("aria-expanded", "true")
                .addClass(settings.openClass)
                .filter("." + settings.panelClass)
                .attr("aria-hidden", "false")
                .find(":tabbable:last")
                .focus();
            }
          } else if (event.shiftKey && i > 0) {
            found =
              tabbables.filter(":lt(" + i + "):last").focus().length === 1;
          } else if (!event.shiftKey && i < tabbables.length - 1) {
            found =
              tabbables.filter(":gt(" + i + "):first").focus().length === 1;
          } else if (window.opera && opera.toString() === "[object Opera]") {
            tabbables = $(":tabbable");
            i = tabbables.index(target);
            if (event.shiftKey) {
              found =
                $(
                  ":tabbable:lt(" + $(":tabbable").index(target) + "):last"
                ).focus().length === 1;
            } else {
              found =
                $(
                  ":tabbable:gt(" + $(":tabbable").index(target) + "):first"
                ).focus().length === 1;
            }
          }

          if (found) {
            event.preventDefault();
          }
          break;
        case Keyboard.SPACE:
          if (isTopNavItem) {
            event.preventDefault();
            _clickHandler.call(that, event);
          } else {
            return true;
          }
          break;
        case Keyboard.ENTER:
          return true;
          break;
        default:
          // alphanumeric filter
          clearTimeout(this.keydownTimeoutID);

          keydownSearchString +=
            newString !== keydownSearchString ? newString : "";

          if (keydownSearchString.length === 0) {
            return;
          }

          this.keydownTimeoutID = setTimeout(function () {
            keydownSearchString = "";
          }, keydownTimeoutDuration);

          if (isTopNavItem && !target.hasClass(settings.openClass)) {
            tabbables = tabbables.filter(
              ":not(." + settings.panelClass + " :tabbable)"
            );
          } else {
            tabbables = topli.find(":tabbable");
          }

          if (event.shiftKey) {
            tabbables = $(tabbables.get().reverse());
          }

          for (i = 0; i < tabbables.length; i++) {
            o = tabbables.eq(i);
            if (o.is(target)) {
              start = keydownSearchString.length === 1 ? i + 1 : i;
              break;
            }
          }

          regex = new RegExp(
            "^" +
              keydownSearchString.replace(
                /[\-\[\]{}()*+?.,\\\^$|#\s]/g,
                "\\$&"
              ),
            "i"
          );

          for (i = start; i < tabbables.length; i++) {
            o = tabbables.eq(i);
            label = $.trim(o.text());
            if (regex.test(label)) {
              found = true;
              o.focus();
              break;
            }
          }
          if (!found) {
            for (i = 0; i < start; i++) {
              o = tabbables.eq(i);
              label = $.trim(o.text());
              if (regex.test(label)) {
                o.focus();
                break;
              }
            }
          }
          break;
      }
      that.justFocused = false;
    };

    /**
     * @name jQuery.fn.accessibleMegaMenu~_mouseDownHandler
     * @desc Handle mousedown event on mega menu.
     * @param {event} Event object
     * @memberof accessibleMegaMenu
     * @inner
     * @private
     */
    _mouseDownHandler = function (event) {
      if (
        $(event.target).is(this.settings.panelClass) ||
        $(event.target).closest(":focusable").length
      ) {
        this.mouseFocused = true;
      }
      this.mouseTimeoutID = setTimeout(function () {
        clearTimeout(this.focusTimeoutID);
      }, 1);
    };

    /**
     * @name jQuery.fn.accessibleMegaMenu~_mouseOverHandler
     * @desc Handle mouseover event on mega menu.
     * @param {event} Event object
     * @memberof jQuery.fn.accessibleMegaMenu
     * @inner
     * @private
     */
    _mouseOverHandler = function (event) {
      clearTimeout(this.mouseTimeoutID);
      $(event.target).addClass(this.settings.hoverClass);
      _togglePanel.call(this, event);
      if ($(event.target).is(":tabbable")) {
        $("html").on("keydown.menu", $.proxy(_keyDownHandler, event.target));
      }
    };

    /**
     * @name jQuery.fn.accessibleMegaMenu~_mouseOutHandler
     * @desc Handle mouseout event on mega menu.
     * @param {event} Event object
     * @memberof jQuery.fn.accessibleMegaMenu
     * @inner
     * @private
     */
    _mouseOutHandler = function (event) {
      var that = this;
      $(event.target).removeClass(that.settings.hoverClass);

      that.mouseTimeoutID = setTimeout(function () {
        _togglePanel.call(that, event, true);
      }, 250);
      if ($(event.target).is(":tabbable")) {
        $("html").off("keydown.menu");
      }
    };

    _toggleExpandedEventHandlers = function (hide) {
      var menu = this.menu;
      if (hide) {
        $("html").off(
          "mouseup.outside-menu, touchend.outside-menu, mspointerup.outside-menu,  pointerup.outside-menu"
        );

        menu
          .find("[aria-expanded]." + this.settings.panelClass)
          .off("DOMAttrModified.menu");
      } else {
        $("html").on(
          "mouseup.outside-menu, touchend.outside-menu, mspointerup.outside-menu,  pointerup.outside-menu",
          $.proxy(_clickOutsideHandler, this)
        );

        /* Narrator in Windows 8 automatically toggles the aria-expanded property on double tap or click.
           To respond to the change to collapse the panel, we must add a listener for a DOMAttrModified event. */
        menu
          .find("[aria-expanded=true]." + this.settings.panelClass)
          .on("DOMAttrModified.menu", $.proxy(_DOMAttrModifiedHandler, this));
      }
    };

    /* public attributes and methods ------------------------- */
    return {
      constructor: AccessibleMegaMenu,

      /**
       * @lends jQuery.fn.accessibleMegaMenu
       * @desc Initializes an instance of the accessibleMegaMenu plugins
       * @memberof jQuery.fn.accessibleMegaMenu
       * @instance
       */
      init: function () {
        var settings = this.settings,
          nav = $(this.element),
          menu = nav.children().first(),
          topnavitems = menu.children();
        this.start(settings, nav, menu, topnavitems);
      },

      start: function (settings, nav, menu, topnavitems) {
        var that = this;
        this.settings = settings;
        this.menu = menu;
        this.topnavitems = topnavitems;

        nav.attr("role", "navigation");
        menu.addClass(settings.menuClass);
        topnavitems.each(function (i, topnavitem) {
          var topnavitemlink, topnavitempanel;
          topnavitem = $(topnavitem);
          topnavitem.addClass(settings.topNavItemClass);
          topnavitemlink = topnavitem.find(":tabbable:first");
          topnavitempanel = topnavitem.children(":not(:tabbable):last");
          _addUniqueId.call(that, topnavitemlink);
          if (topnavitempanel.length) {
            _addUniqueId.call(that, topnavitempanel);
            topnavitemlink.attr({
              "aria-haspopup": true,
              "aria-controls": topnavitempanel.attr("id"),
              "aria-expanded": false,
            });

            topnavitempanel
              .attr({
                role: "group",
                "aria-expanded": false,
                "aria-hidden": true,
              })
              .addClass(settings.panelClass)
              .not("[aria-labelledby]")
              .attr("aria-labelledby", topnavitemlink.attr("id"));
          }
        });

        this.panels = menu.find("." + settings.panelClass);

        menu
          .on(
            "focusin.menu",
            ":focusable, ." + settings.panelClass,
            $.proxy(_focusInHandler, this)
          )
          .on(
            "focusout.menu",
            ":focusable, ." + settings.panelClass,
            $.proxy(_focusOutHandler, this)
          )
          .on("keydown.menu", $.proxy(_keyDownHandler, this))
          .on("mouseover.menu", $.proxy(_mouseOverHandler, this))
          .on("mouseout.menu", $.proxy(_mouseOutHandler, this))
          .on("mousedown.menu", $.proxy(_mouseDownHandler, this));

        if (isTouch) {
          menu.on("touchstart.menu", $.proxy(_clickHandler, this));
        }

        menu.find("hr").attr("role", "separator");

        if ($(document.activeElement).closest(menu).length) {
          $(document.activeElement).trigger("focusin.menu");
        }
      },

      /**
       * @desc Get default values
       * @example $(selector).accessibleMegaMenu('getDefaults');
       * @return {object}
       * @memberof jQuery.fn.accessibleMegaMenu
       * @instance
       */
      getDefaults: function () {
        return this._defaults;
      },

      /**
       * @desc Get any option set to plugin using its name (as string)
       * @example $(selector).accessibleMegaMenu('getOption', some_option);
       * @param {string} opt
       * @return {string}
       * @memberof jQuery.fn.accessibleMegaMenu
       * @instance
       */
      getOption: function (opt) {
        return this.settings[opt];
      },

      /**
       * @desc Get all options
       * @example $(selector).accessibleMegaMenu('getAllOptions');
       * @return {object}
       * @memberof jQuery.fn.accessibleMegaMenu
       * @instance
       */
      getAllOptions: function () {
        return this.settings;
      },

      /**
       * @desc Set option
       * @example $(selector).accessibleMegaMenu('setOption', 'option_name',  'option_value',  reinitialize);
       * @param {string} opt - Option name
       * @param {string} val - Option value
       * @param {boolean} [reinitialize] - boolean to re-initialize the menu.
       * @memberof jQuery.fn.accessibleMegaMenu
       * @instance
       */
      setOption: function (opt, value, reinitialize) {
        this.settings[opt] = value;
        if (reinitialize) {
          this.init();
        }
      },
    };
  })();

  $.fn[pluginName] = function (options) {
    return this.each(function () {
      if (!$.data(this, "plugin_" + pluginName)) {
        $.data(
          this,
          "plugin_" + pluginName,
          new $.fn[pluginName].AccessibleMegaMenu(this, options)
        );
      }
    });
  };

  $.fn[pluginName].AccessibleMegaMenu = AccessibleMegaMenu;

  /* :focusable and :tabbable selectors from
     https://raw.github.com/jquery/jquery-ui/master/ui/jquery.ui.core.js */

  /**
   * @private
   */
  function visible(element) {
    return (
      $.expr.filters.visible(element) &&
      !$(element)
        .parents()
        .addBack()
        .filter(function () {
          return $.css(this, "visibility") === "hidden";
        }).length
    );
  }

  /**
   * @private
   */
  function focusable(element, isTabIndexNotNaN) {
    var map,
      mapName,
      img,
      nodeName = element.nodeName.toLowerCase();
    if ("area" === nodeName) {
      map = element.parentNode;
      mapName = map.name;
      if (!element.href || !mapName || map.nodeName.toLowerCase() !== "map") {
        return false;
      }
      img = $("img[usemap=#" + mapName + "]")[0];
      return !!img && visible(img);
    }
    return (
      (/input|select|textarea|button|object/.test(nodeName)
        ? !element.disabled
        : "a" === nodeName
        ? element.href || isTabIndexNotNaN
        : isTabIndexNotNaN) &&
      // the element and all of its ancestors must be visible
      visible(element)
    );
  }

  $.extend($.expr[":"], {
    data: $.expr.createPseudo
      ? $.expr.createPseudo(function (dataName) {
          return function (elem) {
            return !!$.data(elem, dataName);
          };
        }) // support: jQuery <1.8
      : function (elem, i, match) {
          return !!$.data(elem, match[3]);
        },

    focusable: function (element) {
      return focusable(element, !isNaN($.attr(element, "tabindex")));
    },

    tabbable: function (element) {
      var tabIndex = $.attr(element, "tabindex"),
        isTabIndexNaN = isNaN(tabIndex);
      return (
        (isTabIndexNaN || tabIndex >= 0) && focusable(element, !isTabIndexNaN)
      );
    },
  });
})(jQuery, window, document);

// custom error handlers
window.onerror = function(message, source, lineno, colno, error) {
  console.error("Global JS Error:", { message, source, lineno, colno, error });
};

window.onunhandledrejection = function(event) {
  console.error("Unhandled Promise Rejection:", event.reason);
};

$(document).ajaxError(function(event, jqxhr, settings, thrownError) {
  console.error("AJAX Error:", {
    url: settings.url,
    method: settings.type,
    status: jqxhr.status,
    response: jqxhr.responseText,
    error: thrownError
  });
});

(function($) {
  var originalOn = $.fn.on;
  $.fn.on = function(...args) {
    const events = args[0];
    const selector = typeof args[1] === 'string' ? args[1] : null;
    const handler = args[selector ? 2 : 1];

    const wrappedHandler = function(...handlerArgs) {
      try {
        return handler.apply(this, handlerArgs);
      } catch (err) {
        console.error("jQuery event handler error:", err);
      }
    };

    if (selector) {
      args[2] = wrappedHandler;
    } else {
      args[1] = wrappedHandler;
    }

    return originalOn.apply(this, args);
  };
})(jQuery);
