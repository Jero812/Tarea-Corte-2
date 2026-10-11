import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

import { PositiveIntPipe } from '../../common/pipes/positive-int-pipe';
import { PermissionsGuard } from '../../auth/guards/permissions/permissions.guard';
import { Permissions } from '../../auth/decorators/permissions.decorator';
import { CreateExerciseDto } from './dto/create-exercise.dto';
import { UpdateExerciseDto } from './dto/update-exercise.dto';
import { ExerciseService } from './exercise.service';

@Controller('exercises')
@UseGuards(AuthGuard('jwt'), PermissionsGuard)
export class ExerciseController {
    constructor(private readonly exerciseService: ExerciseService) {}

    @Post()
    @HttpCode(HttpStatus.CREATED)
    @Permissions('manage_exercises')
    create(@Body() dto: CreateExerciseDto) {
        return this.exerciseService.create(dto);
    }

    @Get()
    @Permissions('manage_exercises')
    findAll() {
        return this.exerciseService.findAll();
    }

    @Get(':id')
    @Permissions('manage_exercises')
    findOne(@Param('id', PositiveIntPipe) id: number) {
        return this.exerciseService.findOne(id);
    }

    @Patch(':id')
    @Permissions('manage_exercises')
    update(@Param('id', PositiveIntPipe) id: number, @Body() dto: UpdateExerciseDto) {
        return this.exerciseService.update(id, dto);
    }

    @Delete(':id')
    @HttpCode(HttpStatus.NO_CONTENT)
    @Permissions('manage_exercises')
    remove(@Param('id', PositiveIntPipe) id: number) {
        return this.exerciseService.remove(id);
    }
}
