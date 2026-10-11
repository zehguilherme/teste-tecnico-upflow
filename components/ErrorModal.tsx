"use client";

import { useEffect, useRef } from "react";
import { CloseIcon } from "@/components/icons/CloseIcon";

type ErrorModalProps = {
  message: string;
};

export function ErrorModal({ message }: ErrorModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (dialog && !dialog.open) dialog.showModal();
  }, [message]);

  function closeDialog() {
    dialogRef.current?.close();
  }

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby="error-modal-title"
      aria-describedby="error-modal-message"
      className="m-auto max-h-[calc(100dvh-2rem)] w-[calc(100%-2rem)] max-w-md overflow-y-auto rounded-xl border border-border bg-surface p-6 text-foreground shadow-2xl backdrop:bg-background/80 sm:p-8"
    >
      <button
        type="button"
        onClick={closeDialog}
        aria-label="Fechar modal"
        className="absolute right-3 top-3 grid size-11 cursor-pointer place-items-center rounded-full text-muted transition-colors hover:bg-placeholder hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
      >
        <CloseIcon />
      </button>
      <h2 id="error-modal-title" className="pr-10 text-xl font-semibold">
        Ocorreu um erro
      </h2>
      <p
        id="error-modal-message"
        className="mt-4 max-h-[50dvh] overflow-y-auto break-words text-sm leading-6 text-muted"
      >
        {message}
      </p>
      <button
        type="button"
        autoFocus
        onClick={closeDialog}
        className="mt-6 min-h-11 w-full cursor-pointer rounded-lg bg-primary px-5 py-2.5 font-semibold text-background transition-opacity hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
      >
        Entendi
      </button>
    </dialog>
  );
}
