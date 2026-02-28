import React, { useEffect } from "react";
import { X } from "lucide-react"; // Assuming you have lucide-react installed

interface ModalProps {
  // isOpen: boolean;
  // onClose: () => void;
  title?: string;
  footer?: React.ReactNode;
  children: React.ReactNode;
}

export default function ModalView({
  // isOpen,
  // onClose,
  title,
  footer,
  children,
}: ModalProps) {
  // Close on Escape key press
  // useEffect(() => {
  //   const handleEsc = (e: KeyboardEvent) => {
  //     if (e.key === "Escape") onClose();
  //   };
  //   if (isOpen) {
  //     window.addEventListener("keydown", handleEsc);
  //     // Prevent background scrolling
  //     document.body.style.overflow = "hidden";
  //   }
  //   return () => {
  //     window.removeEventListener("keydown", handleEsc);
  //     document.body.style.overflow = "unset";
  //   };
  // }, [isOpen, onClose]);

  // if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300"
        // onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal Content */}
      <div
        className="relative w-full sm:max-w-3xl bg-white rounded-t-2xl sm:rounded-2xl shadow-2xl 
                   transform transition-all duration-300 ease-out 
                   animate-in slide-in-from-bottom-10 fade-in zoom-in-95
                   sm:slide-in-from-top-10
                   max-h-[90vh] flex flex-col overflow-hidden"
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        {title && (
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gray-50/50">
            <h2 className="text-lg font-bold text-gray-900">{title}</h2>
            <button
              // onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
              aria-label="Fermer"
            >
              <X size={20} />
            </button>
          </div>
        )}

        {/* Body (Scrollable) */}
        <div className="flex-1 overflow-y-auto p-6">{children}</div>

        {/* Footer (Optional, sticky at bottom) */}
        {footer && (
          <div className="px-6 py-4 border-t border-gray-100 bg-gray-50/50 flex justify-end gap-3 shrink-0">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
