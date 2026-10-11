import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { User } from '../../auth/entities/user.entity';
import { hasPermission } from '../common/has-permission';
import { rethrowForeignKeyConflict } from '../common/foreign-key-conflict';
import { ActivityLog } from '../entities/activity-log.entity';
import { ActivityExercise } from '../entities/activity-exercise.entity';
import { RoutineExercise } from '../entities/routine-exercise.entity';
import { CreateActivityExerciseDto } from './dto/create-activity-exercise.dto';
import { UpdateActivityExerciseDto } from './dto/update-activity-exercise.dto';

@Injectable()
export class ActivityExerciseService {
    constructor(
        @InjectRepository(ActivityExercise) private readonly activityExerciseRepository: Repository<ActivityExercise>,
        @InjectRepository(ActivityLog) private readonly activityLogRepository: Repository<ActivityLog>,
        @InjectRepository(RoutineExercise) private readonly routineExerciseRepository: Repository<RoutineExercise>,
    ) {}

    private isAdmin(actor: User): boolean { return hasPermission(actor, 'manage_users'); }

    private activityLogWhere(id: number, actor: User) {
        return this.isAdmin(actor) ? { id } : { id, user: { id: actor.id } };
    }

    private routineExerciseWhere(id: number, actor: User) {
        return this.isAdmin(actor) ? { id } : { id, routine: { user: { id: actor.id } } };
    }

    private async findActivityLog(id: number, actor: User): Promise<ActivityLog> {
        const log = await this.activityLogRepository.findOne({ where: this.activityLogWhere(id, actor), select: { id: true } });
        if (!log) throw new NotFoundException(`Activity log ${id} was not found`);
        return log;
    }

    private async findRoutineExercise(id: number, actor: User): Promise<RoutineExercise> {
        const item = await this.routineExerciseRepository.findOne({ where: this.routineExerciseWhere(id, actor), select: { id: true } });
        if (!item) throw new NotFoundException(`Routine exercise ${id} was not found`);
        return item;
    }

    async create(dto: CreateActivityExerciseDto, actor: User): Promise<ActivityExercise> {
        const [activityLog, routineExercise] = await Promise.all([
            this.findActivityLog(dto.activityLogId, actor),
            this.findRoutineExercise(dto.routineExerciseId, actor),
        ]);
        return this.activityExerciseRepository.save(
            this.activityExerciseRepository.create({
                actualSets: dto.actualSets,
                actualReps: dto.actualReps,
                actualWeightKg: dto.actualWeightKg,
                actualDurationMin: dto.actualDurationMin,
                caloriesBurned: dto.caloriesBurned,
                distanceCoveredKm: dto.distanceCoveredKm,
                startedAt: dto.startedAt,
                completedAt: dto.completedAt,
                activityLog,
                routineExercise,
            }),
        );
    }

    findAll(actor: User): Promise<ActivityExercise[]> {
        if (this.isAdmin(actor)) return this.activityExerciseRepository.find();
        return this.activityExerciseRepository.find({ where: {
            activityLog: { user: { id: actor.id } },
            routineExercise: { routine: { user: { id: actor.id } } },
        } });
    }

    async findOne(id: number, actor: User): Promise<ActivityExercise> {
        const item = await this.activityExerciseRepository.findOne({ where: this.isAdmin(actor) ? { id } : {
            id,
            activityLog: { user: { id: actor.id } },
            routineExercise: { routine: { user: { id: actor.id } } },
        } });
        if (!item) throw new NotFoundException(`Activity exercise ${id} was not found`);
        return item;
    }

    async update(id: number, dto: UpdateActivityExerciseDto, actor: User): Promise<ActivityExercise> {
        const item = await this.findOne(id, actor);
        if (dto.actualSets !== undefined) item.actualSets = dto.actualSets;
        if (dto.actualReps !== undefined) item.actualReps = dto.actualReps;
        if (dto.actualWeightKg !== undefined) item.actualWeightKg = dto.actualWeightKg;
        if (dto.actualDurationMin !== undefined) item.actualDurationMin = dto.actualDurationMin;
        if (dto.caloriesBurned !== undefined) item.caloriesBurned = dto.caloriesBurned;
        if (dto.distanceCoveredKm !== undefined) item.distanceCoveredKm = dto.distanceCoveredKm;
        if (dto.startedAt !== undefined) item.startedAt = dto.startedAt;
        if (dto.completedAt !== undefined) item.completedAt = dto.completedAt;
        if (dto.activityLogId !== undefined) item.activityLog = await this.findActivityLog(dto.activityLogId, actor);
        if (dto.routineExerciseId !== undefined) item.routineExercise = await this.findRoutineExercise(dto.routineExerciseId, actor);
        return this.activityExerciseRepository.save(item);
    }

    async remove(id: number, actor: User): Promise<void> {
        await this.findOne(id, actor);
        try {
            await this.activityExerciseRepository.delete(id);
        } catch (error) {
            rethrowForeignKeyConflict(error, 'Activity exercise could not be deleted because it is referenced');
        }
    }
}
