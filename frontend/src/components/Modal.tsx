"use client";

import { useEffect } from "react";

type ModalProps = {
  title: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  onClose: () => void;
};

export function Modal({ title, children, footer, onClose }: ModalProps) {
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  return (
    <div
      className="fixed inset-0 z-[100] flex items-end justify-center sm:items-center sm:p-4"
      role="presentation"
    >
      <button
        type="button"
        aria-label="Close dialog"
        className="absolute inset-0 bg-ink/55 backdrop-blur-[3px] animate-fade-in"
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        className="relative z-10 flex max-h-[min(92dvh,880px)] w-full max-w-lg flex-col overflow-hidden rounded-t-3xl border border-slate-200/90 bg-white shadow-2xl animate-sheet-in sm:rounded-3xl sm:animate-slide-up"
      >
        <div className="mx-auto mt-2 h-1 w-10 shrink-0 rounded-full bg-slate-200 sm:hidden" />
        <div className="flex items-start justify-between gap-3 border-b border-slate-100 px-4 pb-3 pt-2 sm:px-6 sm:pt-5 sm:pb-4">
          <h2 id="modal-title" className="text-lg font-semibold tracking-tight text-ink pr-2">
            {title}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="btn-ghost -mr-1 shrink-0 rounded-xl text-lg leading-none text-ink-muted"
            aria-label="Close"
          >
            ×
          </button>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 py-4 sm:px-6 sm:py-5">
          {children}
        </div>
        {footer ? (
          <div className="flex flex-col gap-2 border-t border-slate-100 bg-slate-50/90 px-4 py-4 sm:flex-row sm:justify-end sm:px-6">
            {footer}
          </div>
        ) : null}
      </div>
    </div>
  );
}
