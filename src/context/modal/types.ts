import type { ReactNode } from "react";

export type ModalData = {
  title: string;
  children?: ReactNode;
};

export type ModalState = { isOpen: false } | ({ isOpen: true } & ModalData);

export type ModalContextValue = {
  modalState: ModalState;
  openModal: (data: ModalData) => void;
  closeModal: () => void;
};
