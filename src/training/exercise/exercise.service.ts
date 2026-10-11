import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { rethrowForeignKeyConflict } from '../common/foreign-key-conflict';
import { Exercise } from '../entities/exercise.entity';
import { CreateExerciseDto } from './dto/create-exercise.dto';
import { UpdateExerciseDto } from './dto/update-exercise.dto';

@Injectable()
export class ExerciseService {
    constructor(@InjectRepository(Exercise) private readonly exerciseRepository: Repository<Exercise>) {}

    async create(dto: CreateExerciseDto): Promise<Exercise> {
        const exercise = this.exerciseRepository.create({
            name: dto.name,
            description: dto.description,
            type: dto.type,
            estimatedCalories: dto.estimatedCalories,
            estimatedDistanceKm: dto.estimatedDistanceKm,
            estimatedDurationMin: dto.estimatedDurationMin,
            icon: dto.icon,
        });
        return this.exerciseRepository.save(exercise);
    }

    findAll(): Promise<Exercise[]> {
        return this.exerciseRepository.find();
    }

    async findOne(id: number): Promise<Exercise> {
        const exercise = await this.exerciseRepository.findOneBy({ id });
        if (!exercise) throw new NotFoundException(`Exercise ${id} was not found`);
        return exercise;
    }

    async update(id: number, dto: UpdateExerciseDto): Promise<Exercise> {
        const exercise = await this.findOne(id);
        if (dto.name !== undefined) exercise.name = dto.name;
        if (dto.description !== undefined) exercise.description = dto.description;
        if (dto.type !== undefined) exercise.type = dto.type;
        if (dto.estimatedCalories !== undefined) exercise.estimatedCalories = dto.estimatedCalories;
        if (dto.estimatedDistanceKm !== undefined) exercise.estimatedDistanceKm = dto.estimatedDistanceKm;
        if (dto.estimatedDurationMin !== undefined) exercise.estimatedDurationMin = dto.estimatedDurationMin;
        if (dto.icon !== undefined) exercise.icon = dto.icon;
        return this.exerciseRepository.save(exercise);
    }

    async remove(id: number): Promise<void> {
        await this.findOne(id);
        try {
            await this.exerciseRepository.delete(id);
        } catch (error) {
            rethrowForeignKeyConflict(error, 'Exercise is still referenced by routines');
        }
    }
}
