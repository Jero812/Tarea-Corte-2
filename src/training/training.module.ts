import { Module } from '@nestjs/common';

import { ActivityExerciseModule } from './activity-exercise/activity-exercise.module';
import { ActivityLogModule } from './activity-log/activity-log.module';
import { ExerciseModule } from './exercise/exercise.module';
import { RoutineExerciseModule } from './routine-exercise/routine-exercise.module';
import { RoutineModule } from './routine/routine.module';

@Module({
    imports: [ExerciseModule, RoutineModule, RoutineExerciseModule, ActivityLogModule, ActivityExerciseModule],
})
export class TrainingModule {}
