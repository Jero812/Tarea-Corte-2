import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { User } from '../../auth/entities/user.entity';
import { hasPermission } from '../common/has-permission';
import { rethrowForeignKeyConflict } from '../common/foreign-key-conflict';
import { Routine } from '../entities/routine.entity';
import { CreateRoutineDto } from './dto/create-routine.dto';
import { UpdateRoutineDto } from './dto/update-routine.dto';

@Injectable()
export class RoutineService {
    constructor(
        @InjectRepository(Routine) private readonly routineRepository: Repository<Routine>,
        @InjectRepository(User) private readonly userRepository: Repository<User>,
    ) {}

    private async findUser(id: number): Promise<User> {
        const user = await this.userRepository.findOne({ where: { id }, select: { id: true } });
        if (!user) throw new NotFoundException(`User ${id} was not found`);
        return user;
    }

    private isAdmin(actor: User): boolean { return hasPermission(actor, 'manage_users'); }

    private async findOwned(id: number, actor: User): Promise<Routine> {
        const routine = await this.routineRepository.findOne({
            where: this.isAdmin(actor) ? { id } : { id, user: { id: actor.id } },
        });
        if (!routine) throw new NotFoundException(`Routine ${id} was not found`);
        return routine;
    }

    async create(dto: CreateRoutineDto, actor: User): Promise<Routine> {
        if (!this.isAdmin(actor) && dto.userId !== actor.id) throw new ForbiddenException('A routine can only be created for the authenticated user');
        const user = await this.findUser(dto.userId);
        return this.routineRepository.save(
            this.routineRepository.create({ name: dto.name, description: dto.description, user }),
        );
    }

    findAll(actor: User): Promise<Routine[]> {
        return this.routineRepository.find({ where: this.isAdmin(actor) ? {} : { user: { id: actor.id } } });
    }

    findOne(id: number, actor: User): Promise<Routine> {
        return this.findOwned(id, actor);
    }

    async update(id: number, dto: UpdateRoutineDto, actor: User): Promise<Routine> {
        const routine = await this.findOwned(id, actor);
        if (dto.name !== undefined) routine.name = dto.name;
        if (dto.description !== undefined) routine.description = dto.description;
        if (dto.userId !== undefined) {
            if (!this.isAdmin(actor) && dto.userId !== actor.id) throw new ForbiddenException('A routine can only be assigned to its owner');
            routine.user = await this.findUser(dto.userId);
        }
        return this.routineRepository.save(routine);
    }

    async remove(id: number, actor: User): Promise<void> {
        await this.findOwned(id, actor);
        try {
            await this.routineRepository.delete(id);
        } catch (error) {
            rethrowForeignKeyConflict(error, 'Routine is still referenced by activity logs or routine exercises');
        }
    }
}
