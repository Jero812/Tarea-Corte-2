import { CreateDateColumn, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn, Column } from 'typeorm';
import type { Relation } from 'typeorm';

import { User } from '../../auth/entities/user.entity';
import { ActivityExercise } from './activity-exercise.entity';
import { Routine } from './routine.entity';

@Entity('activity_logs')
export class ActivityLog {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ name: 'started_at', type: 'timestamp' })
    startedAt: Date;

    @Column({ name: 'completed_at', type: 'timestamp' })
    completedAt: Date;

    @CreateDateColumn({ name: 'created_at', type: 'timestamp' })
    createdAt: Date;

    @ManyToOne(() => User, (user) => user.activityLogs, { nullable: false })
    @JoinColumn({ name: 'user_id' })
    user: Relation<User>;

    @ManyToOne(() => Routine, (routine) => routine.activityLogs, { nullable: false })
    @JoinColumn({ name: 'routine_id' })
    routine: Relation<Routine>;

    @OneToMany(() => ActivityExercise, (activityExercise) => activityExercise.activityLog)
    activityExercises: ActivityExercise[];
}
