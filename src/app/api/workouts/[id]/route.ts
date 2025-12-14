import { auth } from "@/lib/auth/auth";
import { NextResponse } from "next/server";
import { workoutService } from "@/services/WorkoutService";

type RequestParams = {
  params: { id: string };
};

export async function GET(_request: Request, { params }: RequestParams) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // サービス層を使用してビジネスロジックを実行
    const workout = await workoutService.getWorkoutById(
      params.id,
      session.user.id
    );

    return NextResponse.json(workout, { status: 200 });
  } catch (error) {
    if (error instanceof Error && error.message === "Workout not found") {
      return NextResponse.json({ error: "Workout not found" }, { status: 404 });
    }

    console.error("Error fetching workout:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
