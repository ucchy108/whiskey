import { prisma } from ".";
import { hash } from "bcrypt";

async function main() {
  // ユーザー作成
  const user = await prisma.user.create({
    data: {
      name: "Test User",
      age: 30,
      weight: 70,
      height: 175,
    },
  });

  const password = await hash("password", 12);
  const auth = await prisma.auth.create({
    data: {
      email: "test@example.com",
      password: password,
      userId: user.id,
    },
  });

  // Exercise（運動種目）のシードデータ作成
  const exercises = await Promise.all([
    prisma.exercise.create({
      data: {
        name: "ベンチプレス",
        description: "胸筋を鍛える基本的なウェイトトレーニング",
      },
    }),
    prisma.exercise.create({
      data: {
        name: "スクワット",
        description: "下半身全体を鍛える基本的なトレーニング",
      },
    }),
    prisma.exercise.create({
      data: {
        name: "デッドリフト",
        description: "全身を鍛える基本的なウェイトトレーニング",
      },
    }),
    prisma.exercise.create({
      data: {
        name: "腕立て伏せ",
        description: "自重で胸筋と腕を鍛えるトレーニング",
      },
    }),
    prisma.exercise.create({
      data: {
        name: "懸垂",
        description: "背中と腕を鍛える自重トレーニング",
      },
    }),
    prisma.exercise.create({
      data: {
        name: "ランニング",
        description: "有酸素運動の基本",
      },
    }),
  ]);

  // Workout（ワークアウトセッション）のシードデータ作成
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const twoDaysAgo = new Date(today);
  twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);

  // 今日のワークアウト
  const todayWorkout = await prisma.workout.create({
    data: {
      userId: user.id,
      date: today,
      dialy: "今日は胸と腕のトレーニング。調子良し！",
    },
  });

  // 今日のワークアウト詳細
  await Promise.all([
    prisma.workoutDetail.create({
      data: {
        workoutId: todayWorkout.id,
        exerciseId: exercises[0].id, // ベンチプレス
        sets: 3,
        reps: 10,
        weight: 60,
        notes: "フォーム重視",
      },
    }),
    prisma.workoutDetail.create({
      data: {
        workoutId: todayWorkout.id,
        exerciseId: exercises[3].id, // 腕立て伏せ
        sets: 3,
        reps: 15,
        notes: "最後のセットはギリギリ",
      },
    }),
  ]);

  // 昨日のワークアウト
  const yesterdayWorkout = await prisma.workout.create({
    data: {
      userId: user.id,
      date: yesterday,
      dialy: "下半身強化の日",
    },
  });

  // 昨日のワークアウト詳細
  await Promise.all([
    prisma.workoutDetail.create({
      data: {
        workoutId: yesterdayWorkout.id,
        exerciseId: exercises[1].id, // スクワット
        sets: 4,
        reps: 12,
        weight: 80,
        notes: "深くしゃがむことを意識",
      },
    }),
    prisma.workoutDetail.create({
      data: {
        workoutId: yesterdayWorkout.id,
        exerciseId: exercises[2].id, // デッドリフト
        sets: 3,
        reps: 8,
        weight: 100,
        notes: "背中をまっすぐ保つ",
      },
    }),
  ]);

  // 2日前のワークアウト
  const twoDaysAgoWorkout = await prisma.workout.create({
    data: {
      userId: user.id,
      date: twoDaysAgo,
      dialy: "有酸素と自重トレーニング",
    },
  });

  // 2日前のワークアウト詳細
  await Promise.all([
    prisma.workoutDetail.create({
      data: {
        workoutId: twoDaysAgoWorkout.id,
        exerciseId: exercises[5].id, // ランニング
        sets: 1,
        reps: 1,
        duration: 1800, // 30分（秒）
        notes: "ペースは6分/km",
      },
    }),
    prisma.workoutDetail.create({
      data: {
        workoutId: twoDaysAgoWorkout.id,
        exerciseId: exercises[4].id, // 懸垂
        sets: 3,
        reps: 8,
        notes: "チンアップグリップ",
      },
    }),
  ]);

  console.log("シードデータの作成が完了しました");
  console.log("ユーザー:", user);
  console.log("認証情報:", auth);
  console.log("Exercise数:", exercises.length);
  console.log("Workout数:", 3);
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
