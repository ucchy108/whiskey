import { NextResponse } from "next/server";
import { auth } from "@/lib/auth/auth";
import { ExerciseRepository } from "@/repositories/exerciseRepository";
import { ExerciseService } from "@/services/ExerciseService";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 全ての運動種目を取得
    const repository = new ExerciseRepository(session.user.id);
    const service = new ExerciseService(repository);
    const exercises = await service.getAllExercises();

    return NextResponse.json(
      { message: "Success", exercises: exercises },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching exercises:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
