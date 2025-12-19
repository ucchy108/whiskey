import { WorkoutService } from "../WorkoutService";
import { workoutRepository } from "@/repositories/workoutRepository";
import { vi, type MockedObject } from "vitest";

// workoutRepositoryをモック化
vi.mock("@/repositories/workoutRepository");

const mockedWorkoutRepository = workoutRepository as MockedObject<typeof workoutRepository>;

describe("WorkoutService", () => {
  let workoutService: WorkoutService;

  beforeEach(() => {
    workoutService = new WorkoutService();
    vi.clearAllMocks();
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

  describe("getWorkoutsByUserId", () => {
    it("ユーザーの全ワークアウトを取得できる", async () => {
      const mockWorkouts = [mockWorkoutWithDetails];
      mockedWorkoutRepository.findAllByUserId.mockResolvedValue(mockWorkouts);

      const result = await workoutService.getWorkoutsByUserId(mockUserId);

      expect(result).toEqual(mockWorkouts);
      expect(mockedWorkoutRepository.findAllByUserId).toHaveBeenCalledWith(
        mockUserId
      );
    });

    it("ワークアウトが存在しない場合は空配列を返す", async () => {
      mockedWorkoutRepository.findAllByUserId.mockResolvedValue([]);

      const result = await workoutService.getWorkoutsByUserId(mockUserId);

      expect(result).toEqual([]);
      expect(mockedWorkoutRepository.findAllByUserId).toHaveBeenCalledWith(
        mockUserId
      );
    });
  });

  describe("getWorkoutById", () => {
    it("指定されたワークアウトを取得できる", async () => {
      mockedWorkoutRepository.findByIdAndUserId.mockResolvedValue(
        mockWorkoutWithDetails
      );

      const result = await workoutService.getWorkoutById(
        mockWorkoutId,
        mockUserId
      );

      expect(result).toEqual(mockWorkoutWithDetails);
      expect(mockedWorkoutRepository.findByIdAndUserId).toHaveBeenCalledWith(
        mockWorkoutId,
        mockUserId
      );
    });

    it("ワークアウトが存在しない場合はエラーをスローする", async () => {
      mockedWorkoutRepository.findByIdAndUserId.mockResolvedValue(null);

      await expect(
        workoutService.getWorkoutById(mockWorkoutId, mockUserId)
      ).rejects.toThrow("Workout not found");

      expect(mockedWorkoutRepository.findByIdAndUserId).toHaveBeenCalledWith(
        mockWorkoutId,
        mockUserId
      );
    });

    it("他のユーザーのワークアウトは取得できない", async () => {
      const otherUserId = "other-user";
      mockedWorkoutRepository.findByIdAndUserId.mockResolvedValue(null);

      await expect(
        workoutService.getWorkoutById(mockWorkoutId, otherUserId)
      ).rejects.toThrow("Workout not found");

      expect(mockedWorkoutRepository.findByIdAndUserId).toHaveBeenCalledWith(
        mockWorkoutId,
        otherUserId
      );
    });
  });

  describe("createWorkout", () => {
    const createData = {
      date: new Date("2024-01-20"),
      memo: "New workout",
    };

    it("ワークアウトを作成できる", async () => {
      mockedWorkoutRepository.create.mockResolvedValue(mockWorkout);

      const result = await workoutService.createWorkout(mockUserId, createData);

      expect(result).toEqual(mockWorkout);
      expect(mockedWorkoutRepository.create).toHaveBeenCalledWith({
        userId: mockUserId,
        date: createData.date,
        memo: createData.memo,
      });
    });

    it("メモなしでワークアウトを作成できる", async () => {
      const dataWithoutMemo = { date: new Date("2024-01-20") };
      mockedWorkoutRepository.create.mockResolvedValue(mockWorkout);

      await workoutService.createWorkout(mockUserId, dataWithoutMemo);

      expect(mockedWorkoutRepository.create).toHaveBeenCalledWith({
        userId: mockUserId,
        date: dataWithoutMemo.date,
        memo: undefined,
      });
    });
  });

  describe("updateWorkout", () => {
    const updateData = {
      date: new Date("2024-01-21"),
      memo: "Updated workout",
    };

    it("自分のワークアウトを更新できる", async () => {
      mockedWorkoutRepository.findByIdAndUserId.mockResolvedValue(
        mockWorkoutWithDetails
      );
      const updatedWorkout = { ...mockWorkout, ...updateData };
      mockedWorkoutRepository.update.mockResolvedValue(updatedWorkout);

      const result = await workoutService.updateWorkout(
        mockWorkoutId,
        mockUserId,
        updateData
      );

      expect(result).toEqual(updatedWorkout);
      expect(mockedWorkoutRepository.findByIdAndUserId).toHaveBeenCalledWith(
        mockWorkoutId,
        mockUserId
      );
      expect(mockedWorkoutRepository.update).toHaveBeenCalledWith(
        mockWorkoutId,
        updateData
      );
    });

    it("存在しないワークアウトは更新できない", async () => {
      mockedWorkoutRepository.findByIdAndUserId.mockResolvedValue(null);

      await expect(
        workoutService.updateWorkout(mockWorkoutId, mockUserId, updateData)
      ).rejects.toThrow("Workout not found or unauthorized");

      expect(mockedWorkoutRepository.findByIdAndUserId).toHaveBeenCalledWith(
        mockWorkoutId,
        mockUserId
      );
      expect(mockedWorkoutRepository.update).not.toHaveBeenCalled();
    });

    it("他のユーザーのワークアウトは更新できない", async () => {
      const otherUserId = "other-user";
      mockedWorkoutRepository.findByIdAndUserId.mockResolvedValue(null);

      await expect(
        workoutService.updateWorkout(mockWorkoutId, otherUserId, updateData)
      ).rejects.toThrow("Workout not found or unauthorized");

      expect(mockedWorkoutRepository.update).not.toHaveBeenCalled();
    });
  });

  describe("deleteWorkout", () => {
    it("自分のワークアウトを削除できる", async () => {
      mockedWorkoutRepository.findByIdAndUserId.mockResolvedValue(
        mockWorkoutWithDetails
      );
      mockedWorkoutRepository.delete.mockResolvedValue(mockWorkout);

      const result = await workoutService.deleteWorkout(
        mockWorkoutId,
        mockUserId
      );

      expect(result).toEqual(mockWorkout);
      expect(mockedWorkoutRepository.findByIdAndUserId).toHaveBeenCalledWith(
        mockWorkoutId,
        mockUserId
      );
      expect(mockedWorkoutRepository.delete).toHaveBeenCalledWith(
        mockWorkoutId
      );
    });

    it("存在しないワークアウトは削除できない", async () => {
      mockedWorkoutRepository.findByIdAndUserId.mockResolvedValue(null);

      await expect(
        workoutService.deleteWorkout(mockWorkoutId, mockUserId)
      ).rejects.toThrow("Workout not found or unauthorized");

      expect(mockedWorkoutRepository.findByIdAndUserId).toHaveBeenCalledWith(
        mockWorkoutId,
        mockUserId
      );
      expect(mockedWorkoutRepository.delete).not.toHaveBeenCalled();
    });

    it("他のユーザーのワークアウトは削除できない", async () => {
      const otherUserId = "other-user";
      mockedWorkoutRepository.findByIdAndUserId.mockResolvedValue(null);

      await expect(
        workoutService.deleteWorkout(mockWorkoutId, otherUserId)
      ).rejects.toThrow("Workout not found or unauthorized");

      expect(mockedWorkoutRepository.delete).not.toHaveBeenCalled();
    });
  });
});
