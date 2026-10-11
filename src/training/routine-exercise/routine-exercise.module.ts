import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Exercise } from '../entities/exercise.entity';
import { Routine } from '../entities/routine.entity';
import { RoutineExercise } from '../entities/routine-exercise.entity';
import { RoutineExerciseController } from './routine-exercise.controller';
import { RoutineExerciseService } from './routine-exercise.service';

@Module({
    imports: [TypeOrmModule.forFeature([RoutineExercise, Routine, Exercise])],
    controllers: [RoutineExerciseController],
    providers: [RoutineExerciseService],
    exports: [RoutineExerciseService],
})
export class RoutineExerciseModule {}
