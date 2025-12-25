import { useState, useEffect } from "react";
import type { DashboardStatsWithCharts } from "@/repositories/statsRepository";

interface UseDashboardStatsReturn {
  stats: DashboardStatsWithCharts | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

/**
 * ダッシュボード統計データを取得するカスタムフック
 * @returns 統計データ、ローディング状態、エラー状態、リフェッチ関数
 */
export function useDashboardStats(): UseDashboardStatsReturn {
  const [stats, setStats] = useState<DashboardStatsWithCharts | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch("/api/dashboard/stats", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`統計データの取得に失敗しました: ${response.status}`);
      }

      const data: DashboardStatsWithCharts = await response.json();
      setStats(data);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "不明なエラーが発生しました";
      setError(errorMessage);
      console.error("Dashboard stats fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  const refetch = async () => {
    await fetchStats();
  };

  useEffect(() => {
    fetchStats();
  }, []);

  return {
    stats,
    loading,
    error,
    refetch,
  };
}
