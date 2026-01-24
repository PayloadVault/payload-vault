import { useCallback, useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import { useAuth } from "../../context/AuthContext";

export function useAvailableYears() {
    const { user } = useAuth();
    const [availableYears, setAvailableYears] = useState<number[]>(() => [
        new Date().getFullYear(),
    ]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchYears = useCallback(async () => {
        if (!user) {
            setAvailableYears([new Date().getFullYear()]);
            setIsLoading(false);
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            const { data, error: rpcError } = await supabase.rpc(
                "get_user_report_years",
            );

            if (rpcError) {
                throw rpcError;
            }

            const currentYear = new Date().getFullYear();
            const fetchedYears: number[] = data?.map((row) => row.year) ?? [];

            const mergedYears = [...new Set([currentYear, ...fetchedYears])];

            mergedYears.sort((a, b) => b - a);

            setAvailableYears(mergedYears);
        } catch (err) {
            console.error("Failed to fetch available years:", err);
            setError(
                err instanceof Error ? err.message : "Failed to fetch years",
            );
            setAvailableYears([new Date().getFullYear()]);
        } finally {
            setIsLoading(false);
        }
    }, [user]);

    useEffect(() => {
        fetchYears();
    }, [fetchYears]);

    return {
        availableYears,
        isLoading,
        error,
        refetch: fetchYears,
    };
}
