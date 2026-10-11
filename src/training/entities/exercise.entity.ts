import { Column, CreateDateColumn, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';

import { RoutineExercise } from './routine-exercise.entity';

@Entity('exercises')
export class Exercise {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ type: 'varchar' })
    name: string;

    @Column({ type: 'text' })
    description: string;

    @Column({ type: 'varchar' })
    type: string;

    @Column({ name: 'estimated_calories', type: 'float' })
    estimatedCalories: number;

    @Column({ name: 'estimated_distance_km', type: 'float' })
    estimatedDistanceKm: number;

    @Column({ name: 'estimated_duration_min', type: 'int' })
    estimatedDurationMin: number;

    @Column({ type: 'varchar' })
    icon: string;

    @CreateDateColumn({ name: 'created_at', type: 'timestamp' })
    createdAt: Date;

    @OneToMany(() => RoutineExercise, (routineExercise) => routineExercise.exercise)
    routineExercises: RoutineExercise[];
}
