import { useOutletContext } from "react-router-dom";

export const AllPdfsPage = () => {
  const { setTitle, setSubtitle } = useOutletContext<{
    setTitle: (title: string) => void;
    setSubtitle: (subtitle: string) => void;
  }>();

  setTitle("All PDFs");
  setSubtitle("year");

  return <div className="flex flex-col gap-10 w-100">All PDFs Page</div>;
};
