import { NextResponse } from "next/server";
import { auth } from "@/lib/auth/auth";
import { statsService } from "@/services/StatsService";

/**
 * ダッシュボード統計APIエンドポイント
 * GET /api/dashboard/stats
 */
export async function GET() {
  try {
    // 認証チェック
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "認証が必要です" }, { status: 401 });
    }

    const userId = session.user.id;
    if (!userId) {
      return NextResponse.json(
        { error: "ユーザーIDが見つかりません" },
        { status: 401 }
      );
    }

    // サービス層で統計データを取得
    const stats = await statsService.getDashboardStats(userId);

    return NextResponse.json(stats);
  } catch (error) {
    console.error("Dashboard stats API error:", error);
    return NextResponse.json(
      { error: "統計データの取得に失敗しました" },
      { status: 500 }
    );
  }
}
