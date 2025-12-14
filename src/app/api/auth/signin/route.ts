import { NextRequest, NextResponse } from "next/server";
import { signInFormSchema } from "@/app/(auth)/signin/components/SignInForm/formSchema";
import { authService } from "@/services/AuthService";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsedCredentials = signInFormSchema.safeParse(body);

    if (!parsedCredentials.success) {
      console.error("Validation error:", parsedCredentials.error.message);
      return NextResponse.json({ error: "Invalid SignIn" }, { status: 400 });
    }

    const { email, password } = parsedCredentials.data;

    // サービス層を使用してビジネスロジックを実行
    const auth = await authService.signIn(email, password);

    return NextResponse.json(
      { message: "Success", user: auth.user },
      { status: 200 }
    );
  } catch (error) {
    if (error instanceof Error && error.message === "Invalid credentials") {
      return NextResponse.json({ error: "Invalid SignIn" }, { status: 401 });
    }

    console.error("SignIn error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
