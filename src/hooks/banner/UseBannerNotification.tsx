import { useState, useCallback } from "react";
import type { BannerType } from "../../components/banner/Banner.types";

interface BannerState {
  title: string;
  description: string;
  bannerType: BannerType;
}

export function useBannerNotification() {
  const [banner, setBanner] = useState<BannerState | null>(null);

  const showBanner = useCallback(
    (title: string, description: string, bannerType: BannerType) => {
      setBanner({ title, description, bannerType });

      setTimeout(() => {
        setBanner(null);
      }, 5000);
    },
    []
  );

  const closeBanner = useCallback(() => {
    setBanner(null);
  }, []);

  return {
    banner,
    showBanner,
    closeBanner,
  };
}
