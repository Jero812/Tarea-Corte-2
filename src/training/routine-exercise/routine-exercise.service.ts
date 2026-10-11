import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { User } from '../../auth/entities/user.entity';
import { hasPermission } from '../common/has-permission';
import { rethrowForeignKeyConflict } from '../common/foreign-key-conflict';
import { Exercise } from '../entities/exercise.entity';
import { Routine } from '../entities/routine.entity';
import { RoutineExercise } from '../entities/routine-exercise.entity';
import { CreateRoutineExerciseDto } from './dto/create-routine-exercise.dto';
import { UpdateRoutineExerciseDto } from './dto/update-routine-exercise.dto';

@Injectable()
export class RoutineExerciseService {
    constructor(
        @InjectRepository(RoutineExercise) private readonly routineExerciseRepository: Repository<RoutineExercise>,
        @InjectRepository(Routine) private readonly routineRepository: Repository<Routine>,
        @InjectRepository(Exercise) private readonly exerciseRepository: Repository<Exercise>,
    ) {}

    private isAdmin(actor: User): boolean { return hasPermission(actor, 'manage_users'); }

    private async findRoutine(id: number, actor: User): Promise<Routine> {
        const routine = await this.routineRepository.findOne({ where: this.isAdmin(actor) ? { id } : { id, user: { id: actor.id } } });
        if (!routine) throw new NotFoundException(`Routine ${id} was not found`);
        return routine;
    }

    private async findExercise(id: number): Promise<Exercise> {
        const exercise = await this.exerciseRepository.findOneBy({ id });
        if (!exercise) throw new NotFoundException(`Exercise ${id} was not found`);
        return exercise;
    }

    async create(dto: CreateRoutineExerciseDto, actor: User): Promise<RoutineExercise> {
        const [routine, exercise] = await Promise.all([this.findRoutine(dto.routineId, actor), this.findExercise(dto.exerciseId)]);
        return this.routineExerciseRepository.save(
            this.routineExerciseRepository.create({
                orderIndex: dto.orderIndex,
                targetSets: dto.targetSets,
                targetReps: dto.targetReps,
                targetWeightKg: dto.targetWeightKg,
                targetDurationMin: dto.targetDurationMin,
                routine,
                exercise,
            }),
        );
    }

    findAll(actor: User): Promise<RoutineExercise[]> {
        return this.routineExerciseRepository.find({ where: this.isAdmin(actor) ? {} : { routine: { user: { id: actor.id } } } });
    }

    async findOne(id: number, actor: User): Promise<RoutineExercise> {
        const item = await this.routineExerciseRepository.findOne({ where: this.isAdmin(actor) ? { id } : { id, routine: { user: { id: actor.id } } } });
        if (!item) throw new NotFoundException(`Routine exercise ${id} was not found`);
        return item;
    }

    async update(id: number, dto: UpdateRoutineExerciseDto, actor: User): Promise<RoutineExercise> {
        const item = await this.findOne(id, actor);
        if (dto.orderIndex !== undefined) item.orderIndex = dto.orderIndex;
        if (dto.targetSets !== undefined) item.targetSets = dto.targetSets;
        if (dto.targetReps !== undefined) item.targetReps = dto.targetReps;
        if (dto.targetWeightKg !== undefined) item.targetWeightKg = dto.targetWeightKg;
        if (dto.targetDurationMin !== undefined) item.targetDurationMin = dto.targetDurationMin;
        if (dto.routineId !== undefined) item.routine = await this.findRoutine(dto.routineId, actor);
        if (dto.exerciseId !== undefined) item.exercise = await this.findExercise(dto.exerciseId);
        return this.routineExerciseRepository.save(item);
    }

    async remove(id: number, actor: User): Promise<void> {
        await this.findOne(id, actor);
        try {
            await this.routineExerciseRepository.delete(id);
        } catch (error) {
            rethrowForeignKeyConflict(error, 'Routine exercise is still referenced by activity exercises');
        }
    }
}
