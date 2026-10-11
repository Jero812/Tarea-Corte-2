import { Type } from 'class-transformer';
import { IsInt, IsNumber, IsPositive } from 'class-validator';

export class CreateRoutineExerciseDto {
    @Type(() => Number)
    @IsInt()
    @IsPositive()
    routineId: number;

    @Type(() => Number)
    @IsInt()
    @IsPositive()
    exerciseId: number;

    @Type(() => Number)
    @IsInt()
    orderIndex: number;

    @Type(() => Number)
    @IsInt()
    targetSets: number;

    @Type(() => Number)
    @IsInt()
    targetReps: number;

    @Type(() => Number)
    @IsNumber({ allowNaN: false, allowInfinity: false })
    targetWeightKg: number;

    @Type(() => Number)
    @IsInt()
    targetDurationMin: number;
}
