import { useState, type ReactNode } from "react";
import { type ModalState, type ModalData } from "./types";
import { ModalContext } from "./ModalContext";
import { Modal } from "../../components/modal/Modal";

export const ModalProvider = ({ children }: { children: ReactNode }) => {
  const [modalState, setModalState] = useState<ModalState>({ isOpen: false });

  const openModal = (data: ModalData) =>
    setModalState({ isOpen: true, ...data });
  const closeModal = () => setModalState({ isOpen: false });

  return (
    <ModalContext.Provider value={{ modalState, openModal, closeModal }}>
      {children}

      {modalState.isOpen && (
        <Modal title={modalState.title} onClose={closeModal}>
          {modalState.children}
        </Modal>
      )}
    </ModalContext.Provider>
  );
};
