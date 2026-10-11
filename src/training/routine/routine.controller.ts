import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Patch, Post, Req, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

import { PositiveIntPipe } from '../../common/pipes/positive-int-pipe';
import { PermissionsGuard } from '../../auth/guards/permissions/permissions.guard';
import { Permissions } from '../../auth/decorators/permissions.decorator';
import type { AuthenticatedRequest } from '../common/authenticated-request';
import { CreateRoutineDto } from './dto/create-routine.dto';
import { UpdateRoutineDto } from './dto/update-routine.dto';
import { RoutineService } from './routine.service';

@Controller('routines')
@UseGuards(AuthGuard('jwt'), PermissionsGuard)
export class RoutineController {
    constructor(private readonly routineService: RoutineService) {}

    @Post()
    @HttpCode(HttpStatus.CREATED)
    @Permissions('create_routine')
    create(@Body() dto: CreateRoutineDto, @Req() request: AuthenticatedRequest) {
        return this.routineService.create(dto, request.user);
    }

    @Get()
    @Permissions('read_routine')
    findAll(@Req() request: AuthenticatedRequest) {
        return this.routineService.findAll(request.user);
    }

    @Get(':id')
    @Permissions('read_routine')
    findOne(@Param('id', PositiveIntPipe) id: number, @Req() request: AuthenticatedRequest) {
        return this.routineService.findOne(id, request.user);
    }

    @Patch(':id')
    @Permissions('update_routine')
    update(@Param('id', PositiveIntPipe) id: number, @Body() dto: UpdateRoutineDto, @Req() request: AuthenticatedRequest) {
        return this.routineService.update(id, dto, request.user);
    }

    @Delete(':id')
    @HttpCode(HttpStatus.NO_CONTENT)
    @Permissions('delete_routine')
    remove(@Param('id', PositiveIntPipe) id: number, @Req() request: AuthenticatedRequest) {
        return this.routineService.remove(id, request.user);
    }
}

