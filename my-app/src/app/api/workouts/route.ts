export async function GET() {
  // ローカルストレージからワークアウトデータを取得
  const workouts = [
    {
      id: "1",
      name: "ランニング",
      date: "2023-10-01",
      weight: 0,
      reps: 0,
      sets: 0,
      memo: "",
    },
    {
      id: "2",
      name: "ウェイトトレーニング",
      date: "2023-10-02",
      weight: 70,
      reps: 10,
      sets: 3,
      memo: "背中の日",
    },
    {
      id: "3",
      name: "ヨガ",
      date: "2023-10-03",
      weight: 0,
      reps: 0,
      sets: 0,
      memo: "リラックス",
    },
  ];

  if (workouts) {
    return new Response(JSON.stringify(workouts), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } else {
    return new Response("No workouts found", { status: 404 });
  }
}

export async function POST(request: Request) {
  const { name, type, duration, date } = await request.json();

  // 新しいワークアウトを作成
  const newWorkout = {
    id: Date.now().toString(),
    name,
    type,
    duration,
    date,
  };

  // TODO: 保存処理を実装する
  console.log("New workout created:", newWorkout);

  return new Response(JSON.stringify(newWorkout), {
    status: 201,
    headers: { "Content-Type": "application/json" },
  });
}
