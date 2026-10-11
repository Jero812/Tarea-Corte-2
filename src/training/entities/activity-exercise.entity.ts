import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import type { Relation } from 'typeorm';

import { ActivityLog } from './activity-log.entity';
import { RoutineExercise } from './routine-exercise.entity';

@Entity('activity_exercises')
export class ActivityExercise {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ name: 'actual_sets', type: 'int' })
    actualSets: number;

    @Column({ name: 'actual_reps', type: 'int' })
    actualReps: number;

    @Column({ name: 'actual_weight_kg', type: 'float' })
    actualWeightKg: number;

    @Column({ name: 'actual_duration_min', type: 'int' })
    actualDurationMin: number;

    @Column({ name: 'calories_burned', type: 'float' })
    caloriesBurned: number;

    @Column({ name: 'distance_covered_km', type: 'float' })
    distanceCoveredKm: number;

    @Column({ name: 'started_at', type: 'timestamp' })
    startedAt: Date;

    @Column({ name: 'completed_at', type: 'timestamp' })
    completedAt: Date;

    @ManyToOne(() => ActivityLog, (activityLog) => activityLog.activityExercises, { nullable: false })
    @JoinColumn({ name: 'activity_log_id' })
    activityLog: Relation<ActivityLog>;

    @ManyToOne(() => RoutineExercise, (routineExercise) => routineExercise.activityExercises, { nullable: false })
    @JoinColumn({ name: 'routine_exercise_id' })
    routineExercise: Relation<RoutineExercise>;
}
