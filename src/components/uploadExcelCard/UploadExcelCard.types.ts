type ExcelUploadCardProps = {
  title: string;
  description: string;
  onUpload?: (file: File) => Promise<void> | void;
  accept?: string;
};

export type { ExcelUploadCardProps };
