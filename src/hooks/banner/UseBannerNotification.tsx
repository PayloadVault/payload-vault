import { useState, useCallback, useRef } from "react";
import type { BannerType } from "../../components/banner/Banner.types";

interface BannerState {
  title: string;
  description: string;
  bannerType: BannerType;
}

export function useBannerNotification() {
  const [banner, setBanner] = useState<BannerState | null>(null);
  const timeoutRef = useRef<number | null>(null);

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

  return {
    banner,
    showBanner,
    closeBanner,
  };
}
