import { useOutletContext } from "react-router-dom";
import { useLayoutEffect } from "react";

export const AllPdfsPage = () => {
  const { setTitle, setSubtitle } = useOutletContext<{
    setTitle: (title: string) => void;
    setSubtitle: (subtitle: string) => void;
  }>();

  useLayoutEffect(() => {
    setTitle("All PDFs");
    setSubtitle("year");
  }, [setTitle, setSubtitle]);

  return <div className="flex flex-col gap-10 w-100">All PDFs Page</div>;
};
