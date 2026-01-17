import { ContentCard } from "../../components/contentCard/ContentCard";
import { HeaderHome } from "../../components/header/HeaderHome";

export const HomePage = () => {
  return (
    <div>
      <HeaderHome />
      <div className="flex flex-col w-screen p-10 gap-10">
        <ContentCard
          variant="allPdf"
          title="All pdfs"
          subtitle="number of documents: 32"
          link="/all-pdfs"
        />
        <ContentCard
          variant="category"
          title="Strom & Gas"
          subtitle="number of documents: 12"
          profit={1200}
          link="/category/strom-gas"
        />
        <ContentCard
          variant="document"
          title="Electricity Bill January 2024"
          date="01.01.2024"
          profit={145200}
          downloadLink="/downloads/electricity-bill-january-2024.pdf"
          openLink="/documents/electricity-bill-january-2024"
        />
      </div>
    </div>
  );
};
