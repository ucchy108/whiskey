import { auth } from "@/lib/auth/auth";
import { NextRequest, NextResponse } from "next/server";
import { workoutService } from "@/services/WorkoutService";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // サービス層を使用してビジネスロジックを実行
    const workouts = await workoutService.getWorkoutsByUserId(session.user.id);

    return NextResponse.json(
      { message: "Success", workouts: workouts },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching workouts:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { date, note, details} = await request.json();

    // バリデーション
    if (!date) {
      return NextResponse.json({ error: "Date is required" }, { status: 400 });
    }

    // 詳細がある場合とない場合で処理を分岐
    const workout =
      details && details.length > 0
        ? await workoutService.createWorkoutWithDetails(session.user.id, {
            date: new Date(date),
            note,
            details,
          })
        : await workoutService.createWorkout(session.user.id, {
            date: new Date(date),
            note,
          });

    return NextResponse.json(
      { message: "Workout created", workout },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating workout:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
