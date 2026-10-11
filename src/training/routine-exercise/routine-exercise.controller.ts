import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Patch, Post, Req, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

import { PositiveIntPipe } from '../../common/pipes/positive-int-pipe';
import { PermissionsGuard } from '../../auth/guards/permissions/permissions.guard';
import { Permissions } from '../../auth/decorators/permissions.decorator';
import type { AuthenticatedRequest } from '../common/authenticated-request';
import { CreateRoutineExerciseDto } from './dto/create-routine-exercise.dto';
import { UpdateRoutineExerciseDto } from './dto/update-routine-exercise.dto';
import { RoutineExerciseService } from './routine-exercise.service';

@Controller('routine-exercises')
@UseGuards(AuthGuard('jwt'), PermissionsGuard)
export class RoutineExerciseController {
    constructor(private readonly routineExerciseService: RoutineExerciseService) {}

    @Post()
    @HttpCode(HttpStatus.CREATED)
    @Permissions('create_routine')
    create(@Body() dto: CreateRoutineExerciseDto, @Req() request: AuthenticatedRequest) {
        return this.routineExerciseService.create(dto, request.user);
    }

    @Get()
    @Permissions('read_routine')
    findAll(@Req() request: AuthenticatedRequest) {
        return this.routineExerciseService.findAll(request.user);
    }

    @Get(':id')
    @Permissions('read_routine')
    findOne(@Param('id', PositiveIntPipe) id: number, @Req() request: AuthenticatedRequest) {
        return this.routineExerciseService.findOne(id, request.user);
    }

    @Patch(':id')
    @Permissions('update_routine')
    update(@Param('id', PositiveIntPipe) id: number, @Body() dto: UpdateRoutineExerciseDto, @Req() request: AuthenticatedRequest) {
        return this.routineExerciseService.update(id, dto, request.user);
    }

    @Delete(':id')
    @HttpCode(HttpStatus.NO_CONTENT)
    @Permissions('delete_routine')
    remove(@Param('id', PositiveIntPipe) id: number, @Req() request: AuthenticatedRequest) {
        return this.routineExerciseService.remove(id, request.user);
    }
}

