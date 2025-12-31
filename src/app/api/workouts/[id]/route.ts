import { auth } from "@/lib/auth/auth";
import { workoutService } from "@/services/WorkoutService";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  _: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: workoutId } = await params;

    const result = await workoutService.getWorkoutById(
      workoutId,
      session.user.id
    );

    return NextResponse.json(
      { message: "Success", workout: result },
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

// NOTE: ワークアウトを更新するAPI
// フロントエンドではPATCHメソッドを使用。受け取ったパラメータを更新する。
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: workoutId } = await params;
    const body = await req.json();

    // dateが文字列の場合、Date型に変換
    const updateData = {
      ...body,
      date: body.date ? new Date(body.date) : undefined,
    };

    console.log("Updating workout with data:", updateData);
    await workoutService.updateWorkout(workoutId, session.user.id, updateData);

    return NextResponse.json(
      { message: "Workout updated successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error updating workout:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
