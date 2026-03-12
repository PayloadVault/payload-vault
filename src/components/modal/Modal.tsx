import { type ReactNode, useEffect } from "react";
import { CloseIcon } from "../icons";
import type { ModalSize } from "../../context/modal/types";

interface ModalProps {
  title: string;
  onClose: () => void;
  children?: ReactNode;
  disableClose?: boolean;
  size?: ModalSize;
}

const sizeClasses: Record<ModalSize, string> = {
  default: "max-w-md",
  large: "max-w-2xl",
};

export const Modal = ({
  title,
  onClose,
  children,
  disableClose,
  size = "default",
}: ModalProps) => {
  useEffect(() => {
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div
        className={`flex max-h-[90vh] w-full ${sizeClasses[size]} flex-col gap-4 overflow-y-auto rounded-lg bg-color-bg-card p-4 sm:p-6`}
      >
        <div className="flex w-full items-start justify-between gap-4">
          <h6 className="text-[20px] font-bold">{title}</h6>
          <button
            onClick={onClose}
            disabled={disableClose}
            className={`shrink-0 rounded-radius-md p-2 ${
              disableClose
                ? "cursor-not-allowed opacity-50"
                : "cursor-pointer hover:bg-color-primary/20"
            }`}
          >
            <CloseIcon />
          </button>
        </div>

        <div className="flex w-full flex-col">
          <div>{children}</div>
        </div>
      </div>
    </div>
  );
};
