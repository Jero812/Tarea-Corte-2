import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ActivityExercise } from '../entities/activity-exercise.entity';
import { ActivityLog } from '../entities/activity-log.entity';
import { RoutineExercise } from '../entities/routine-exercise.entity';
import { ActivityExerciseController } from './activity-exercise.controller';
import { ActivityExerciseService } from './activity-exercise.service';

@Module({
    imports: [TypeOrmModule.forFeature([ActivityExercise, ActivityLog, RoutineExercise])],
    controllers: [ActivityExerciseController],
    providers: [ActivityExerciseService],
    exports: [ActivityExerciseService],
})
export class ActivityExerciseModule {}
