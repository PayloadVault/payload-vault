import { useState } from "react";
import { cardIcon } from "./ContentCard.const";
import type { CombinedContentCardProps } from "./ContentCard.types";
import { useNavigate } from "react-router-dom";
import { TitleSide } from "./TitleSide";
import { normalizeProfit } from "./ContentCard.utils";
import { ArrowIcon, DeleteIcon, DownloadIcon, OpenIcon } from "../icons";
import { useModal } from "../../context/modal/ModalContext";
import { DeleteConfirmationForm } from "../modal/DeleteConfirmationForm";

export const ContentCard = (props: CombinedContentCardProps) => {
  const navigate = useNavigate();
  const { openModal, closeModal } = useModal();
  const [isExpanded, setIsExpanded] = useState(false);

  const {
    variant,
    title,
    subtitle,
    link,
    date,
    profit,
    downloadLink,
    openLink,
    searchQuery,
    id,
    onDelete,
    products,
    vendorName,
  } = props;

  const Icon = cardIcon[props.variant];
  const hasProducts = products && products.length > 0;
  const isExpandable = variant === "document" && hasProducts;

  const handleNavigate = () => {
    if (link && variant !== "document") {
      navigate(link);
    }
  };

  const handleCardClick = () => {
    if (isExpandable) {
      setIsExpanded((prev) => !prev);
    } else {
      handleNavigate();
    }
  };

  const handleDownloadClick = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!downloadLink) return;
    try {
      const response = await fetch(downloadLink);
      const blob = await response.blob();

      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = title || "document.pdf";

      document.body.appendChild(link);
      link.click();

      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Download failed:", error);
      window.open(downloadLink, "_blank", "noopener,noreferrer");
    }
  };

  const handleOpenClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!openLink) return;
    window.open(openLink, "_blank", "noopener,noreferrer");
  };

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!id || !onDelete) return;

    openModal({
      title: "Dokument löschen",
      children: (
        <DeleteConfirmationForm
          fileName={title}
          onConfirm={async () => {
            onDelete(id);
            closeModal();
          }}
          onCancel={closeModal}
        />
      ),
    });
  };

  return (
    <div
      className={`w-full bg-color-bg-card border border-color-border-light
        rounded-radius-md shadow-shadow-medium
        transition-all duration-200 ease-in-out
        ${
          variant !== "document" || isExpandable
            ? "cursor-pointer hover:border-color-primary hover:-translate-y-0.5 hover:shadow-shadow-strong active:scale-[0.99]"
            : ""
        }`}
      onClick={handleCardClick}
    >
      <div className="p-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <TitleSide
            title={title}
            subtitle={subtitle}
            date={date}
            Icon={Icon}
            searchQuery={searchQuery || ""}
          />

          <div className="flex w-full items-center justify-end gap-3 sm:w-auto sm:justify-end sm:gap-5">
            {(profit || profit === 0) && (
              <h4 className="font-bold text-color-primary whitespace-nowrap">
                {normalizeProfit(profit)} €
              </h4>
            )}

            {variant === "document" ? (
              <div className="flex items-center gap-2 sm:gap-5">
                <button
                  type="button"
                  className="cursor-pointer p-2 sm:p-1 items-center justify-center flex
                    hover:text-color-primary rounded-radius-sm hover:bg-color-primary/10
                    transition-all duration-200 ease-in-out active:scale-90"
                  onClick={handleDownloadClick}
                  aria-label="Herunterladen"
                >
                  <DownloadIcon className="w-6 h-6 text-color-icon shrink-0" />
                </button>

                <button
                  type="button"
                  className="cursor-pointer p-2 sm:p-1 items-center justify-center flex
                    hover:text-color-primary rounded-radius-sm hover:bg-color-primary/10
                    transition-all duration-200 ease-in-out active:scale-90"
                  onClick={handleOpenClick}
                  aria-label="Öffnen"
                >
                  <OpenIcon className="w-6 h-6 text-color-icon shrink-0" />
                </button>

                <button
                  type="button"
                  className="cursor-pointer p-2 sm:p-1 items-center justify-center flex
                    hover:text-color-error-text rounded-radius-sm hover:bg-color-error/20
                    transition-all duration-200 ease-in-out active:scale-90"
                  onClick={handleDeleteClick}
                  aria-label="Löschen"
                >
                  <DeleteIcon className="w-6 h-6 text-color-icon shrink-0" />
                </button>

                {isExpandable && (
                  <ArrowIcon
                    className={`w-4 h-4 text-color-icon shrink-0 transition-transform duration-200 ${
                      isExpanded ? "rotate-90" : "rotate-180"
                    }`}
                  />
                )}
              </div>
            ) : (
              <ArrowIcon className="w-4 h-4 text-color-icon shrink-0 rotate-180" />
            )}
          </div>
        </div>
      </div>

      {/* Expanded products section */}
      {isExpandable && isExpanded && (
        <div className="border-t border-color-border-light px-4 pb-4 pt-3">
          {vendorName && (
            <p className="text-sm text-color-text-secondary mb-3">
              Anbieter: <span className="font-medium text-color-text-main">{vendorName}</span>
            </p>
          )}
          <div className="flex flex-col gap-2">
            {products.map((product, index) => (
              <div
                key={index}
                className="flex items-center justify-between rounded-md bg-color-bg-dark px-3 py-2"
              >
                <div className="flex flex-col gap-0.5 min-w-0 flex-1">
                  <span className="text-sm font-medium text-color-text-main truncate">
                    {product.product_name}
                  </span>
                  <span className="text-xs text-color-text-secondary">
                    {product.category}
                  </span>
                </div>
                <span className="text-sm font-semibold text-color-primary whitespace-nowrap ml-4">
                  {normalizeProfit(product.amount)} €
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
