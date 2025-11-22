import { auth } from "@/lib/auth/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // ワークアウト詳細を取得（セキュリティのため自分のワークアウトのみ）
    const workout = await prisma.workout.findFirst({
      where: {
        id: params.id,
        userId: session.user.id,
      },
      include: {
        Detail: {
          include: {
            Exercise: true,
          },
        },
      },
    });

    if (!workout) {
      return NextResponse.json({ error: "Workout not found" }, { status: 404 });
    }

    // 統計情報を計算
    const stats = {
      totalSets: workout.Detail.reduce((sum, detail) => sum + detail.sets, 0),
      totalReps: workout.Detail.reduce((sum, detail) => sum + detail.reps, 0),
      totalWeight: workout.Detail.reduce((sum, detail) => {
        const weight = detail.weight || 0;
        return sum + weight * detail.sets;
      }, 0),
      totalDuration: workout.Detail.reduce(
        (sum, detail) => sum + (detail.duration || 0),
        0
      ),
      exerciseCount: workout.Detail.length,
    };

    // 強度レベルを計算（1-5）
    const intensityLevel = Math.min(5, Math.ceil(workout.Detail.length / 2));
    const intensityColor =
      intensityLevel <= 2
        ? "#4caf50"
        : intensityLevel <= 3
        ? "#ff9800"
        : "#f44336";
    const intensityText =
      intensityLevel <= 2 ? "軽め" : intensityLevel <= 3 ? "普通" : "高強度";

    // ワークアウトタイプを判定
    const hasCardio = workout.Detail.some(
      (detail) => detail.duration && detail.duration > 0
    );
    const hasWeights = workout.Detail.some(
      (detail) => detail.weight && detail.weight > 0
    );

    let workoutType;
    if (hasCardio && hasWeights) {
      workoutType = { type: "ミックス", color: "#9c27b0" };
    } else if (hasCardio) {
      workoutType = { type: "有酸素", color: "#2196f3" };
    } else if (hasWeights) {
      workoutType = { type: "筋トレ", color: "#ff5722" };
    } else {
      workoutType = { type: "体重", color: "#607d8b" };
    }

    return NextResponse.json({
      message: "Success",
      stats: {
        ...stats,
        intensity: {
          level: intensityLevel,
          color: intensityColor,
          text: intensityText,
        },
        workoutType,
      },
    });
  } catch (error) {
    console.error("Error fetching workout stats:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
