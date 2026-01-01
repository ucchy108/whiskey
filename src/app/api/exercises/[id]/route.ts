import { auth } from "@/lib/auth/auth";
import { ExerciseRepository } from "@/repositories/exerciseRepository";
import { ExerciseService } from "@/services/ExerciseService";
import { NextRequest, NextResponse } from "next/server";

/**
 * GET /api/exercises/[id]
 * 特定の運動種目を取得
 */
export async function GET(
  _: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: exerciseId } = await params;

    const repository = new ExerciseRepository(session.user.id);
    const service = new ExerciseService(repository);
    const exercise = await service.getExerciseById(exerciseId, session.user.id);

    return NextResponse.json(
      { message: "Success", exercise },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching exercise:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/exercises/[id]
 * 運動種目を更新
 */
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: exerciseId } = await params;
    const body = await req.json();

    const repository = new ExerciseRepository(session.user.id);
    const service = new ExerciseService(repository);
    const updatedExercise = await service.updateExercise(
      exerciseId,
      session.user.id,
      body
    );

    return NextResponse.json(
      { message: "Exercise updated successfully", exercise: updatedExercise },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error updating exercise:", error);
    if (error instanceof Error && error.message.includes("not found")) {
      return NextResponse.json(
        { error: "Exercise not found" },
        { status: 404 }
      );
    }
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/exercises/[id]
 * 運動種目を削除
 */
export async function DELETE(
  _: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: exerciseId } = await params;

    const repository = new ExerciseRepository(session.user.id);
    const service = new ExerciseService(repository);
    await service.deleteExercise(exerciseId, session.user.id);

    return NextResponse.json(
      { message: "Exercise deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting exercise:", error);
    if (error instanceof Error && error.message.includes("not found")) {
      return NextResponse.json(
        { error: "Exercise not found" },
        { status: 404 }
      );
    }
    // WorkoutDetailとの関連エラーをキャッチ
    if (
      error instanceof Error &&
      error.message.includes("Foreign key constraint")
    ) {
      return NextResponse.json(
        { error: "このエクササイズは使用中のため削除できません" },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
