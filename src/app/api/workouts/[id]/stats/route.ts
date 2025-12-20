import { auth } from "@/lib/auth/auth";
import { statsService } from "@/services/workouts/statsService";
import { NextResponse } from "next/server";

export async function GET(
  _request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const stats = await statsService.getWorkoutStats(
      params.id,
      session.user.id
    );

    return NextResponse.json(stats, { status: 200 });
  } catch (error) {
    if (error instanceof Error && error.message === "workout not found") {
      return NextResponse.json({ error: "Workout not found" }, { status: 404 });
    }

    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
