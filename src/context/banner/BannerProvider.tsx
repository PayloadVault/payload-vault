import {
  type ReactNode,
  useState,
  useCallback,
  useRef,
  useEffect,
} from "react";
import { Banner } from "../../components/banner/Banner";
import type { BannerType } from "../../components/banner/Banner.types";
import { BannerContext, type BannerState } from "./BannerContext";

export const BannerProvider = ({ children }: { children: ReactNode }) => {
  const [banner, setBanner] = useState<BannerState | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showBanner = useCallback(
    (title: string, description: string, bannerType: BannerType) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      setBanner({ title, description, bannerType });

      timeoutRef.current = setTimeout(() => {
        setBanner(null);
        timeoutRef.current = null;
      }, 5000);
    },
    []
  );

  const closeBanner = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    setBanner(null);
  }, []);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return (
    <BannerContext.Provider value={{ banner, showBanner, closeBanner }}>
      {children}
      {banner && (
        <div className="fixed bottom-4 right-1 z-100">
          <Banner
            title={banner.title}
            description={banner.description}
            bannerType={banner.bannerType}
            onCloseBanner={closeBanner}
          />
        </div>
      )}
    </BannerContext.Provider>
  );
};
