/**
 * Global Custom Dialog System for Vocaseek
 * Replaces browser native alert/confirm with beautiful customizable popup modals.
 */

let dialogHandler = null;

export function registerDialogHandler(handler) {
  dialogHandler = handler;
}

export function unregisterDialogHandler() {
  dialogHandler = null;
}

/**
 * Show a custom alert dialog popup
 * @param {string} message - The main alert text
 * @param {object} [options] - Additional options: title, type ('warning'|'error'|'info'|'success'), buttonText
 * @returns {Promise<void>}
 */
export function showAppAlert(message, options = {}) {
  const normalizedMessage = typeof message === "string" ? message : String(message || "");
  const type = options.type || (/gagal|error|salah|melebihi|tidak boleh|harus/i.test(normalizedMessage) ? "warning" : "info");
  const title = options.title || (type === "warning" || type === "error" ? "Pemberitahuan" : type === "success" ? "Berhasil" : "Informasi");
  const buttonText = options.buttonText || "Mengerti";

  if (typeof dialogHandler === "function") {
    return dialogHandler({
      title,
      message: normalizedMessage,
      type,
      buttonText,
      isConfirm: false,
    });
  }

  // Fallback if component is not mounted yet
  return new Promise((resolve) => {
    const event = new CustomEvent("vocaseek-show-dialog", {
      detail: {
        title,
        message: normalizedMessage,
        type,
        buttonText,
        isConfirm: false,
        resolve,
      },
    });
    window.dispatchEvent(event);
  });
}

/**
 * Show a custom confirmation dialog popup
 * @param {string} message - The confirmation question
 * @param {object} [options] - Additional options: title, confirmText, cancelText, type
 * @returns {Promise<boolean>}
 */
export function showAppConfirm(message, options = {}) {
  const normalizedMessage = typeof message === "string" ? message : String(message || "");
  const type = options.type || "warning";
  const title = options.title || "Konfirmasi";
  const confirmText = options.confirmText || "Ya, Lanjutkan";
  const cancelText = options.cancelText || "Batal";

  if (typeof dialogHandler === "function") {
    return dialogHandler({
      title,
      message: normalizedMessage,
      type,
      confirmText,
      cancelText,
      isConfirm: true,
    });
  }

  return new Promise((resolve) => {
    const event = new CustomEvent("vocaseek-show-dialog", {
      detail: {
        title,
        message: normalizedMessage,
        type,
        confirmText,
        cancelText,
        isConfirm: true,
        resolve,
      },
    });
    window.dispatchEvent(event);
  });
}

// Global window.alert override so that ANY native alert automatically uses this custom popup
if (typeof window !== "undefined") {
  window.alert = function (message) {
    showAppAlert(message);
  };
}

export const showAlert = showAppAlert;
export const showConfirm = showAppConfirm;
