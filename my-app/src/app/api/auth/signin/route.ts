import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // TODO: サインイン処理を実装
    // 1. リクエストボディのバリデーション
    // 2. ユーザー認証
    // 3. セッション作成

    console.log("Received sign-in request:", body);

    return NextResponse.json(
      { message: "サインイン処理を実装してください" },
      { status: 501 }
    );
  } catch {
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
