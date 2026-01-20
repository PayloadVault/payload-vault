type UploadCardProps = {
  title: string;
  description: string;
  onUpload?: (files: File[]) => Promise<void> | void;
  accept?: string;
};

export type { UploadCardProps };
