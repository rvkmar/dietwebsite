/* Modal system shared by about-diet-chennai and coursedeled (both pages
   used to define an identical copy of this inline, in their own
   extraScript block). Extracted so it loads as an external file instead:
   the production Content Security Policy's script-src has no
   'unsafe-inline', so an inline <script> block -- and the inline
   onclick="..." attributes that used to call these functions -- were
   both silently blocked. The buttons rendered but did nothing. */

function openModal(type) {
    document.getElementById(type + "Modal").style.display = "block";
}

function closeModal(type) {
    document.getElementById(type + "Modal").style.display = "none";
}

function showConfirmModal() {
    document.getElementById("confirmModal").style.display = "block";
}

function closeConfirmModal() {
    document.getElementById("confirmModal").style.display = "none";
}

function forceCloseApply() {
    closeConfirmModal();
    closeModal('apply');
}

// Only Instructions modal closes on outside click
window.onclick = function (event) {
    const instructionsModal = document.getElementById("instructionsModal");
    const confirmModal = document.getElementById("confirmModal");
    if (event.target === instructionsModal) {
        closeModal("instructions");
    }
    if (event.target === confirmModal) {
        closeConfirmModal();
    }
};

// Disable Esc key for Apply and Confirm modals
window.addEventListener("keydown", function (event) {
    if (event.key === "Escape") {
        const applyModal = document.getElementById("applyModal");
        const confirmModal = document.getElementById("confirmModal");
        const instructionsModal = document.getElementById("instructionsModal");

        if (confirmModal.style.display === "block" || applyModal.style.display === "block") {
            event.preventDefault();
        } else if (instructionsModal.style.display === "block") {
            closeModal("instructions");
        }
    }
});

/* Delegated click handler replacing the pages' former inline
   onclick="openModal('instructions')" / onclick="closeModal('apply')" /
   onclick="showConfirmModal()" / onclick="closeConfirmModal()" /
   onclick="forceCloseApply()" attributes. (The apply modal's backdrop
   also used to carry onclick="ignoreOutsideClick(event, 'apply')" --
   that function's entire body was "do nothing", so it's not
   reproduced here; dropping it changes no behavior.) */
document.addEventListener("click", function (event) {
    var openTrigger = event.target.closest("[data-modal-open]");
    if (openTrigger) {
        openModal(openTrigger.getAttribute("data-modal-open"));
        return;
    }
    var closeTrigger = event.target.closest("[data-modal-close]");
    if (closeTrigger) {
        closeModal(closeTrigger.getAttribute("data-modal-close"));
        return;
    }
    var actionTrigger = event.target.closest("[data-modal-action]");
    if (actionTrigger) {
        var action = actionTrigger.getAttribute("data-modal-action");
        if (action === "show-confirm") {
            showConfirmModal();
        } else if (action === "close-confirm") {
            closeConfirmModal();
        } else if (action === "force-close-apply") {
            forceCloseApply();
        }
    }
});
