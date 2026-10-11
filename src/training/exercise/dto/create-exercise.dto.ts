import { Type } from 'class-transformer';
import { IsInt, IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class CreateExerciseDto {
    @IsString()
    @IsNotEmpty()
    name: string;

    @IsString()
    description: string;

    @IsString()
    @IsNotEmpty()
    type: string;

    @Type(() => Number)
    @IsNumber({ allowNaN: false, allowInfinity: false })
    estimatedCalories: number;

    @Type(() => Number)
    @IsNumber({ allowNaN: false, allowInfinity: false })
    estimatedDistanceKm: number;

    @Type(() => Number)
    @IsInt()
    estimatedDurationMin: number;

    @IsString()
    @IsNotEmpty()
    icon: string;
}
