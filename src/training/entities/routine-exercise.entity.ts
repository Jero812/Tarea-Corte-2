import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import type { Relation } from 'typeorm';

import { ActivityExercise } from './activity-exercise.entity';
import { Exercise } from './exercise.entity';
import { Routine } from './routine.entity';

@Entity('routine_exercises')
export class RoutineExercise {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ name: 'order_index', type: 'int' })
    orderIndex: number;

    @Column({ name: 'target_sets', type: 'int' })
    targetSets: number;

    @Column({ name: 'target_reps', type: 'int' })
    targetReps: number;

    @Column({ name: 'target_weight_kg', type: 'float' })
    targetWeightKg: number;

    @Column({ name: 'target_duration_min', type: 'int' })
    targetDurationMin: number;

    @CreateDateColumn({ name: 'created_at', type: 'timestamp' })
    createdAt: Date;

    @ManyToOne(() => Routine, (routine) => routine.routineExercises, { nullable: false })
    @JoinColumn({ name: 'routine_id' })
    routine: Relation<Routine>;

    @ManyToOne(() => Exercise, (exercise) => exercise.routineExercises, { nullable: false })
    @JoinColumn({ name: 'exercise_id' })
    exercise: Relation<Exercise>;

    @OneToMany(() => ActivityExercise, (activityExercise) => activityExercise.routineExercise)
    activityExercises: ActivityExercise[];
}
