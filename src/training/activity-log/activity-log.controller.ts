import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Patch, Post, Req, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

import { PositiveIntPipe } from '../../common/pipes/positive-int-pipe';
import { PermissionsGuard } from '../../auth/guards/permissions/permissions.guard';
import { Permissions } from '../../auth/decorators/permissions.decorator';
import type { AuthenticatedRequest } from '../common/authenticated-request';
import { CreateActivityLogDto } from './dto/create-activity-log.dto';
import { UpdateActivityLogDto } from './dto/update-activity-log.dto';
import { ActivityLogService } from './activity-log.service';

@Controller('activity-logs')
@UseGuards(AuthGuard('jwt'), PermissionsGuard)
export class ActivityLogController {
    constructor(private readonly activityLogService: ActivityLogService) {}

    @Post()
    @HttpCode(HttpStatus.CREATED)
    @Permissions('create_activity')
    create(@Body() dto: CreateActivityLogDto, @Req() request: AuthenticatedRequest) {
        return this.activityLogService.create(dto, request.user);
    }

    @Get()
    @Permissions('read_activity')
    findAll(@Req() request: AuthenticatedRequest) {
        return this.activityLogService.findAll(request.user);
    }

    @Get(':id')
    @Permissions('read_activity')
    findOne(@Param('id', PositiveIntPipe) id: number, @Req() request: AuthenticatedRequest) {
        return this.activityLogService.findOne(id, request.user);
    }

    @Patch(':id')
    @Permissions('update_activity')
    update(@Param('id', PositiveIntPipe) id: number, @Body() dto: UpdateActivityLogDto, @Req() request: AuthenticatedRequest) {
        return this.activityLogService.update(id, dto, request.user);
    }

    @Delete(':id')
    @HttpCode(HttpStatus.NO_CONTENT)
    @Permissions('delete_activity')
    remove(@Param('id', PositiveIntPipe) id: number, @Req() request: AuthenticatedRequest) {
        return this.activityLogService.remove(id, request.user);
    }
}

