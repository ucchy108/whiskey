import { ExerciseService } from "../ExerciseService";
import { ExerciseRepository } from "@/repositories/exerciseRepository";
import { vi, type MockedObject } from "vitest";

vi.mock("@/repositories/exerciseRepository");

describe("ExerciseService", () => {
  let service: ExerciseService;
  let mockedRepository: MockedObject<ExerciseRepository>;

  beforeEach(() => {
    mockedRepository = new ExerciseRepository(
      "user-1"
    ) as MockedObject<ExerciseRepository>;
    service = new ExerciseService(mockedRepository);
    vi.clearAllMocks();
  });

  const mockUserId = "user-1";
  const mockExerciseId = "exercise-1";

  const mockExercise = {
    id: mockExerciseId,
    userId: mockUserId,
    name: "Bench Press",
    description: "Chest exercise",
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  describe("getExerciseById", () => {
    it("運動種目を取得できる", async () => {
      mockedRepository.findByIdAndUserId.mockResolvedValue(mockExercise);

      const result = await service.getExerciseById(mockExerciseId, mockUserId);

      expect(result).toEqual(mockExercise);
      expect(mockedRepository.findByIdAndUserId).toHaveBeenCalledWith(
        mockExerciseId,
        mockUserId
      );
    });

    it("存在しない場合はエラーをスローする", async () => {
      mockedRepository.findByIdAndUserId.mockResolvedValue(null);

      await expect(
        service.getExerciseById(mockExerciseId, mockUserId)
      ).rejects.toThrow("Exercise not found");
    });

    it("他のユーザーの運動種目は取得できない", async () => {
      const otherUserId = "other-user";
      mockedRepository.findByIdAndUserId.mockResolvedValue(null);

      await expect(
        service.getExerciseById(mockExerciseId, otherUserId)
      ).rejects.toThrow("Exercise not found");
    });
  });

  describe("updateExercise", () => {
    const updateData = {
      name: "Updated Name",
      description: "Updated Description",
    };

    it("自分の運動種目を更新できる", async () => {
      mockedRepository.findByIdAndUserId.mockResolvedValue(mockExercise);
      const updatedExercise = { ...mockExercise, ...updateData };
      mockedRepository.update.mockResolvedValue(updatedExercise);

      const result = await service.updateExercise(
        mockExerciseId,
        mockUserId,
        updateData
      );

      expect(result).toEqual(updatedExercise);
      expect(mockedRepository.findByIdAndUserId).toHaveBeenCalledWith(
        mockExerciseId,
        mockUserId
      );
      expect(mockedRepository.update).toHaveBeenCalledWith(
        mockExerciseId,
        updateData
      );
    });

    it("存在しない運動種目は更新できない", async () => {
      mockedRepository.findByIdAndUserId.mockResolvedValue(null);

      await expect(
        service.updateExercise(mockExerciseId, mockUserId, updateData)
      ).rejects.toThrow("Exercise not found or unauthorized");

      expect(mockedRepository.update).not.toHaveBeenCalled();
    });

    it("他のユーザーの運動種目は更新できない", async () => {
      const otherUserId = "other-user";
      mockedRepository.findByIdAndUserId.mockResolvedValue(null);

      await expect(
        service.updateExercise(mockExerciseId, otherUserId, updateData)
      ).rejects.toThrow("Exercise not found or unauthorized");

      expect(mockedRepository.update).not.toHaveBeenCalled();
    });
  });

  describe("deleteExercise", () => {
    it("自分の運動種目を削除できる", async () => {
      mockedRepository.findByIdAndUserId.mockResolvedValue(mockExercise);
      mockedRepository.delete.mockResolvedValue(mockExercise);

      const result = await service.deleteExercise(mockExerciseId, mockUserId);

      expect(result).toEqual(mockExercise);
      expect(mockedRepository.findByIdAndUserId).toHaveBeenCalledWith(
        mockExerciseId,
        mockUserId
      );
      expect(mockedRepository.delete).toHaveBeenCalledWith(mockExerciseId);
    });

    it("存在しない運動種目は削除できない", async () => {
      mockedRepository.findByIdAndUserId.mockResolvedValue(null);

      await expect(
        service.deleteExercise(mockExerciseId, mockUserId)
      ).rejects.toThrow("Exercise not found or unauthorized");

      expect(mockedRepository.delete).not.toHaveBeenCalled();
    });

    it("他のユーザーの運動種目は削除できない", async () => {
      const otherUserId = "other-user";
      mockedRepository.findByIdAndUserId.mockResolvedValue(null);

      await expect(
        service.deleteExercise(mockExerciseId, otherUserId)
      ).rejects.toThrow("Exercise not found or unauthorized");

      expect(mockedRepository.delete).not.toHaveBeenCalled();
    });
  });
});
