import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Patch, Post, Req, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

import { PositiveIntPipe } from '../../common/pipes/positive-int-pipe';
import { PermissionsGuard } from '../../auth/guards/permissions/permissions.guard';
import { Permissions } from '../../auth/decorators/permissions.decorator';
import type { AuthenticatedRequest } from '../common/authenticated-request';
import { CreateActivityExerciseDto } from './dto/create-activity-exercise.dto';
import { UpdateActivityExerciseDto } from './dto/update-activity-exercise.dto';
import { ActivityExerciseService } from './activity-exercise.service';

@Controller('activity-exercises')
@UseGuards(AuthGuard('jwt'), PermissionsGuard)
export class ActivityExerciseController {
    constructor(private readonly activityExerciseService: ActivityExerciseService) {}

    @Post()
    @HttpCode(HttpStatus.CREATED)
    @Permissions('create_activity')
    create(@Body() dto: CreateActivityExerciseDto, @Req() request: AuthenticatedRequest) {
        return this.activityExerciseService.create(dto, request.user);
    }

    @Get()
    @Permissions('read_activity')
    findAll(@Req() request: AuthenticatedRequest) {
        return this.activityExerciseService.findAll(request.user);
    }

    @Get(':id')
    @Permissions('read_activity')
    findOne(@Param('id', PositiveIntPipe) id: number, @Req() request: AuthenticatedRequest) {
        return this.activityExerciseService.findOne(id, request.user);
    }

    @Patch(':id')
    @Permissions('update_activity')
    update(@Param('id', PositiveIntPipe) id: number, @Body() dto: UpdateActivityExerciseDto, @Req() request: AuthenticatedRequest) {
        return this.activityExerciseService.update(id, dto, request.user);
    }

    @Delete(':id')
    @HttpCode(HttpStatus.NO_CONTENT)
    @Permissions('delete_activity')
    remove(@Param('id', PositiveIntPipe) id: number, @Req() request: AuthenticatedRequest) {
        return this.activityExerciseService.remove(id, request.user);
    }
}

