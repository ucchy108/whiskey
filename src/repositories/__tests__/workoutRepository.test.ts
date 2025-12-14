import { workoutRepository } from "../workoutRepository";
import { prisma } from "@/lib/prisma";

// Prismaをモック化
jest.mock("@/lib/prisma", () => ({
  prisma: {
    workout: {
      findMany: jest.fn(),
      findFirst: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  },
}));

const mockedPrisma = prisma as jest.Mocked<typeof prisma>;

describe("workoutRepository", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const mockUserId = "user-1";
  const mockWorkoutId = "workout-1";

  const mockWorkout = {
    id: mockWorkoutId,
    userId: mockUserId,
    date: new Date("2024-01-15"),
    dialy: "Good workout!",
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockWorkoutWithDetails = {
    ...mockWorkout,
    Detail: [
      {
        id: "detail-1",
        workoutId: mockWorkoutId,
        exerciseId: "exercise-1",
        sets: 3,
        reps: 10,
        weight: 50,
        duration: null,
        notes: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        Exercise: {
          id: "exercise-1",
          name: "Bench Press",
          description: "Chest exercise",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      },
    ],
  };

  describe("findAllByUserId", () => {
    it("ユーザーIDで全てのワークアウトを取得できる", async () => {
      const mockWorkouts = [mockWorkoutWithDetails];
      mockedPrisma.workout.findMany.mockResolvedValue(mockWorkouts as any);

      const result = await workoutRepository.findAllByUserId(mockUserId);

      expect(result).toEqual(mockWorkouts);
      expect(mockedPrisma.workout.findMany).toHaveBeenCalledWith({
        where: { userId: mockUserId },
        include: {
          Detail: {
            include: {
              Exercise: true,
            },
          },
        },
        orderBy: {
          date: "desc",
        },
      });
    });

    it("ワークアウトが存在しない場合は空配列を返す", async () => {
      mockedPrisma.workout.findMany.mockResolvedValue([]);

      const result = await workoutRepository.findAllByUserId("no-workouts-user");

      expect(result).toEqual([]);
    });

    it("日付の降順でソートされる", async () => {
      mockedPrisma.workout.findMany.mockResolvedValue([]);

      await workoutRepository.findAllByUserId(mockUserId);

      expect(mockedPrisma.workout.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          orderBy: { date: "desc" },
        })
      );
    });
  });

  describe("findByIdAndUserId", () => {
    it("IDとユーザーIDでワークアウトを取得できる", async () => {
      mockedPrisma.workout.findFirst.mockResolvedValue(
        mockWorkoutWithDetails as any
      );

      const result = await workoutRepository.findByIdAndUserId(
        mockWorkoutId,
        mockUserId
      );

      expect(result).toEqual(mockWorkoutWithDetails);
      expect(mockedPrisma.workout.findFirst).toHaveBeenCalledWith({
        where: {
          id: mockWorkoutId,
          userId: mockUserId,
        },
        include: {
          Detail: {
            include: {
              Exercise: true,
            },
          },
        },
      });
    });

    it("存在しないワークアウトの場合はnullを返す", async () => {
      mockedPrisma.workout.findFirst.mockResolvedValue(null);

      const result = await workoutRepository.findByIdAndUserId(
        "not-found",
        mockUserId
      );

      expect(result).toBeNull();
    });

    it("他のユーザーのワークアウトはnullを返す", async () => {
      mockedPrisma.workout.findFirst.mockResolvedValue(null);

      const result = await workoutRepository.findByIdAndUserId(
        mockWorkoutId,
        "other-user"
      );

      expect(result).toBeNull();
      expect(mockedPrisma.workout.findFirst).toHaveBeenCalledWith({
        where: {
          id: mockWorkoutId,
          userId: "other-user",
        },
        include: expect.any(Object),
      });
    });
  });

  describe("create", () => {
    const createData = {
      userId: mockUserId,
      date: new Date("2024-01-20"),
      memo: "New workout",
    };

    it("ワークアウトを作成できる", async () => {
      const createdWorkout = {
        id: "workout-2",
        ...createData,
        dialy: createData.memo,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      mockedPrisma.workout.create.mockResolvedValue(createdWorkout as any);

      const result = await workoutRepository.create(createData);

      expect(result).toEqual(createdWorkout);
      expect(mockedPrisma.workout.create).toHaveBeenCalledWith({
        data: createData,
      });
    });

    it("メモなしでワークアウトを作成できる", async () => {
      const dataWithoutMemo = {
        userId: mockUserId,
        date: new Date("2024-01-20"),
      };
      const createdWorkout = {
        id: "workout-3",
        ...dataWithoutMemo,
        dialy: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      mockedPrisma.workout.create.mockResolvedValue(createdWorkout as any);

      const result = await workoutRepository.create(dataWithoutMemo);

      expect(result).toEqual(createdWorkout);
      expect(mockedPrisma.workout.create).toHaveBeenCalledWith({
        data: dataWithoutMemo,
      });
    });
  });

  describe("update", () => {
    const updateData = {
      date: new Date("2024-01-21"),
      memo: "Updated workout",
    };

    it("ワークアウトを更新できる", async () => {
      const updatedWorkout = {
        ...mockWorkout,
        date: updateData.date,
        dialy: updateData.memo,
      };
      mockedPrisma.workout.update.mockResolvedValue(updatedWorkout as any);

      const result = await workoutRepository.update(mockWorkoutId, updateData);

      expect(result).toEqual(updatedWorkout);
      expect(mockedPrisma.workout.update).toHaveBeenCalledWith({
        where: { id: mockWorkoutId },
        data: updateData,
      });
    });

    it("日付のみを更新できる", async () => {
      const dateOnlyUpdate = { date: new Date("2024-01-22") };
      const updatedWorkout = {
        ...mockWorkout,
        date: dateOnlyUpdate.date,
      };
      mockedPrisma.workout.update.mockResolvedValue(updatedWorkout as any);

      await workoutRepository.update(mockWorkoutId, dateOnlyUpdate);

      expect(mockedPrisma.workout.update).toHaveBeenCalledWith({
        where: { id: mockWorkoutId },
        data: dateOnlyUpdate,
      });
    });

    it("メモのみを更新できる", async () => {
      const memoOnlyUpdate = { memo: "Only memo updated" };
      const updatedWorkout = {
        ...mockWorkout,
        dialy: memoOnlyUpdate.memo,
      };
      mockedPrisma.workout.update.mockResolvedValue(updatedWorkout as any);

      await workoutRepository.update(mockWorkoutId, memoOnlyUpdate);

      expect(mockedPrisma.workout.update).toHaveBeenCalledWith({
        where: { id: mockWorkoutId },
        data: memoOnlyUpdate,
      });
    });
  });

  describe("delete", () => {
    it("ワークアウトを削除できる", async () => {
      mockedPrisma.workout.delete.mockResolvedValue(mockWorkout as any);

      const result = await workoutRepository.delete(mockWorkoutId);

      expect(result).toEqual(mockWorkout);
      expect(mockedPrisma.workout.delete).toHaveBeenCalledWith({
        where: { id: mockWorkoutId },
      });
    });

    it("正しいIDで削除を実行する", async () => {
      mockedPrisma.workout.delete.mockResolvedValue(mockWorkout as any);

      await workoutRepository.delete(mockWorkoutId);

      const deleteCall = mockedPrisma.workout.delete.mock.calls[0][0];
      expect(deleteCall.where.id).toBe(mockWorkoutId);
    });
  });
});
