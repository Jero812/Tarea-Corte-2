import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { User } from '../../auth/entities/user.entity';
import { hasPermission } from '../common/has-permission';
import { rethrowForeignKeyConflict } from '../common/foreign-key-conflict';
import { ActivityLog } from '../entities/activity-log.entity';
import { Routine } from '../entities/routine.entity';
import { CreateActivityLogDto } from './dto/create-activity-log.dto';
import { UpdateActivityLogDto } from './dto/update-activity-log.dto';

@Injectable()
export class ActivityLogService {
    constructor(
        @InjectRepository(ActivityLog) private readonly activityLogRepository: Repository<ActivityLog>,
        @InjectRepository(User) private readonly userRepository: Repository<User>,
        @InjectRepository(Routine) private readonly routineRepository: Repository<Routine>,
    ) {}

    private async findUser(id: number): Promise<User> {
        const user = await this.userRepository.findOne({ where: { id }, select: { id: true } });
        if (!user) throw new NotFoundException(`User ${id} was not found`);
        return user;
    }

    private isAdmin(actor: User): boolean { return hasPermission(actor, 'manage_users'); }

    private async findRoutine(id: number, actor: User): Promise<Routine> {
        const routine = await this.routineRepository.findOne({ where: this.isAdmin(actor) ? { id } : { id, user: { id: actor.id } }, select: { id: true } });
        if (!routine) throw new NotFoundException(`Routine ${id} was not found`);
        return routine;
    }

    async create(dto: CreateActivityLogDto, actor: User): Promise<ActivityLog> {
        if (!this.isAdmin(actor) && dto.userId !== actor.id) throw new ForbiddenException('An activity log can only be created for the authenticated user');
        const [user, routine] = await Promise.all([this.findUser(dto.userId), this.findRoutine(dto.routineId, actor)]);
        return this.activityLogRepository.save(
            this.activityLogRepository.create({ user, routine, startedAt: dto.startedAt, completedAt: dto.completedAt }),
        );
    }

    findAll(actor: User): Promise<ActivityLog[]> {
        return this.activityLogRepository.find({ where: this.isAdmin(actor) ? {} : { user: { id: actor.id } } });
    }

    async findOne(id: number, actor: User): Promise<ActivityLog> {
        const log = await this.activityLogRepository.findOne({ where: this.isAdmin(actor) ? { id } : { id, user: { id: actor.id } } });
        if (!log) throw new NotFoundException(`Activity log ${id} was not found`);
        return log;
    }

    async update(id: number, dto: UpdateActivityLogDto, actor: User): Promise<ActivityLog> {
        const log = await this.findOne(id, actor);
        if (dto.startedAt !== undefined) log.startedAt = dto.startedAt;
        if (dto.completedAt !== undefined) log.completedAt = dto.completedAt;
        if (dto.userId !== undefined) {
            if (!this.isAdmin(actor) && dto.userId !== actor.id) throw new ForbiddenException('An activity log can only be assigned to its owner');
            log.user = await this.findUser(dto.userId);
        }
        if (dto.routineId !== undefined) log.routine = await this.findRoutine(dto.routineId, actor);
        return this.activityLogRepository.save(log);
    }

    async remove(id: number, actor: User): Promise<void> {
        await this.findOne(id, actor);
        try {
            await this.activityLogRepository.delete(id);
        } catch (error) {
            rethrowForeignKeyConflict(error, 'Activity log is still referenced by activity exercises');
        }
    }
}
