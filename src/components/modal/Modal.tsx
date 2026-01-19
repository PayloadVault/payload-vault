import type { ReactNode } from "react";
import { CloseIcon } from "../icons";

interface ModalProps {
  title: string;
  onClose: () => void;
  children?: ReactNode;
}

export const Modal = ({ title, onClose, children }: ModalProps) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="flex flex-col gap-6 rounded-lg bg-color-bg-alt p-6">
        <div className="relative flex w-full items-center justify-center">
          <button
            onClick={onClose}
            className="absolute top-3 right-3 cursor-pointer hover:bg-color-primary/20 rounded-radius-md p-2"
          >
            <CloseIcon />
          </button>
        </div>

        <div className="flex w-full flex-col gap-10">
          <div className="flex flex-col items-start gap-2">
            <h6 className="text-[20px] font-bold">{title}</h6>
          </div>
          <div>{children}</div>
        </div>
      </div>
    </div>
  );
};
