import type { Dispatch, SetStateAction } from "react";

type UploadCardProps = {
  title: string;
  description: string;
  onUpload?: (files: File[]) => Promise<void> | void;
  accept?: string;
  files: File[];
  setFiles: Dispatch<SetStateAction<File[]>>;
};

export type { UploadCardProps };
