import { useEffect, useState, useRef } from "react";
import "../../styles/GlobalModalAlert.css";
import { registerDialogHandler, unregisterDialogHandler } from "../../utils/dialog";

export default function GlobalModalAlert() {
  const [dialog, setDialog] = useState(null);
  const resolveRef = useRef(null);

  useEffect(() => {
    const handleShowDialog = (config) => {
      return new Promise((resolve) => {
        resolveRef.current = resolve;
        setDialog(config);
      });
    };

    registerDialogHandler(handleShowDialog);

    const handleCustomEvent = (e) => {
      const detail = e.detail;
      if (!detail) return;
      resolveRef.current = detail.resolve;
      setDialog({
        title: detail.title,
        message: detail.message,
        type: detail.type,
        buttonText: detail.buttonText,
        confirmText: detail.confirmText,
        cancelText: detail.cancelText,
        isConfirm: detail.isConfirm,
      });
    };

    window.addEventListener("vocaseek-show-dialog", handleCustomEvent);

    return () => {
      unregisterDialogHandler();
      window.removeEventListener("vocaseek-show-dialog", handleCustomEvent);
    };
  }, []);

  useEffect(() => {
    if (!dialog) return;

    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        handleClose(false);
      } else if (e.key === "Enter" && !dialog.isConfirm) {
        handleClose(true);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [dialog]);

  const handleClose = (result = false) => {
    if (resolveRef.current) {
      resolveRef.current(result);
      resolveRef.current = null;
    }
    setDialog(null);
  };

  if (!dialog) return null;

  const renderIcon = () => {
    switch (dialog.type) {
      case "success":
        return (
          <div className="gma-icon-wrap gma-icon-success">
            <svg className="gma-icon-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
            </svg>
          </div>
        );
      case "error":
        return (
          <div className="gma-icon-wrap gma-icon-error">
            <svg className="gma-icon-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
        );
      case "info":
        return (
          <div className="gma-icon-wrap gma-icon-info">
            <svg className="gma-icon-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
            </svg>
          </div>
        );
      case "warning":
      default:
        return (
          <div className="gma-icon-wrap gma-icon-warning">
            <svg className="gma-icon-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
            </svg>
          </div>
        );
    }
  };

  return (
    <div className="gma-overlay" onClick={() => handleClose(false)}>
      <div className="gma-card" onClick={(e) => e.stopPropagation()} role="alertdialog" aria-modal="true">
        <button
          type="button"
          className="gma-close-btn"
          onClick={() => handleClose(false)}
          aria-label="Tutup"
        >
          ×
        </button>

        {renderIcon()}

        <h3 className="gma-title">{dialog.title}</h3>
        <p className="gma-message">{dialog.message}</p>

        <div className="gma-actions">
          {dialog.isConfirm && (
            <button
              type="button"
              className="gma-btn-cancel"
              onClick={() => handleClose(false)}
            >
              {dialog.cancelText || "Batal"}
            </button>
          )}

          <button
            type="button"
            className="gma-btn-primary"
            onClick={() => handleClose(true)}
            autoFocus
          >
            {dialog.isConfirm ? dialog.confirmText || "Ya, Lanjutkan" : dialog.buttonText || "Mengerti"}
          </button>
        </div>
      </div>
    </div>
  );
}
