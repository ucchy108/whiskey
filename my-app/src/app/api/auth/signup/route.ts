import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // TODO: サインアップ処理を実装
    // 1. リクエストボディのバリデーション
    // 2. メールアドレス重複チェック
    // 3. パスワードハッシュ化
    // 4. ユーザー作成
    // 5. プロフィール初期化

    console.log("Received sign-up request:", body);

    return NextResponse.json(
      { message: "サインアップ処理を実装してください" },
      { status: 501 }
    );
  } catch {
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
