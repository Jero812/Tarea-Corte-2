import { Type } from 'class-transformer';
import { IsDate, IsInt, IsNumber, IsPositive } from 'class-validator';

export class CreateActivityExerciseDto {
    @Type(() => Number)
    @IsInt()
    @IsPositive()
    activityLogId: number;

    @Type(() => Number)
    @IsInt()
    @IsPositive()
    routineExerciseId: number;

    @Type(() => Number)
    @IsInt()
    actualSets: number;

    @Type(() => Number)
    @IsInt()
    actualReps: number;

    @Type(() => Number)
    @IsNumber({ allowNaN: false, allowInfinity: false })
    actualWeightKg: number;

    @Type(() => Number)
    @IsInt()
    actualDurationMin: number;

    @Type(() => Number)
    @IsNumber({ allowNaN: false, allowInfinity: false })
    caloriesBurned: number;

    @Type(() => Number)
    @IsNumber({ allowNaN: false, allowInfinity: false })
    distanceCoveredKm: number;

    @Type(() => Date)
    @IsDate()
    startedAt: Date;

    @Type(() => Date)
    @IsDate()
    completedAt: Date;
}
