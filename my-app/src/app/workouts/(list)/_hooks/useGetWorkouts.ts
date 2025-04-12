export function useGetWorkouts() {
  const workouts = [
    {
      id: "1",
      name: "Workout 1",
      type: "ランニング",
      duration: 30,
      date: new Date().toISOString().split("T")[0],
    },
    {
      id: "2",
      name: "Workout 2",
      type: "ウォーキング",
      duration: 30,
      date: new Date().toISOString().split("T")[0],
    },
    {
      id: "3",
      name: "Workout 3",
      type: "ウェイトトレーニング",
      duration: 30,
      date: new Date().toISOString().split("T")[0],
    },
    {
      id: "4",
      name: "Workout 4",
      type: "水泳",
      duration: 30,
      date: new Date().toISOString().split("T")[0],
    },
    {
      id: "5",
      name: "Workout 5",
      type: "その他",
      duration: 30,
      date: new Date().toISOString().split("T")[0],
    },
  ];

  return {
    workouts: workouts,
  };
}
