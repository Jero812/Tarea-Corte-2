import { Type } from 'class-transformer';
import { IsInt, IsNotEmpty, IsPositive, IsString } from 'class-validator';

export class CreateRoutineDto {
    @Type(() => Number)
    @IsInt()
    @IsPositive()
    userId: number;

    @IsString()
    @IsNotEmpty()
    name: string;

    @IsString()
    description: string;
}
