import { Type } from 'class-transformer';
import { IsDate, IsInt, IsPositive } from 'class-validator';

export class CreateActivityLogDto {
    @Type(() => Number)
    @IsInt()
    @IsPositive()
    userId: number;

    @Type(() => Number)
    @IsInt()
    @IsPositive()
    routineId: number;

    @Type(() => Date)
    @IsDate()
    startedAt: Date;

    @Type(() => Date)
    @IsDate()
    completedAt: Date;
}
