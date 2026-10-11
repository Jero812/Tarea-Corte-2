import { createHmac } from 'node:crypto';
import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { PassportModule } from '@nestjs/passport';
import { jest } from '@jest/globals';
import request from 'supertest';

import { PermissionsGuard } from '../src/auth/guards/permissions/permissions.guard';
import { JwtStrategy } from '../src/auth/strategies/jwt.strategy';
import { UserService } from '../src/auth/user/user.service';
import { ExerciseController } from '../src/training/exercise/exercise.controller';
import { ExerciseService } from '../src/training/exercise/exercise.service';
import { RoutineController } from '../src/training/routine/routine.controller';
import { RoutineService } from '../src/training/routine/routine.service';
import { RoutineExerciseController } from '../src/training/routine-exercise/routine-exercise.controller';
import { RoutineExerciseService } from '../src/training/routine-exercise/routine-exercise.service';
import { ActivityLogController } from '../src/training/activity-log/activity-log.controller';
import { ActivityLogService } from '../src/training/activity-log/activity-log.service';
import { ActivityExerciseController } from '../src/training/activity-exercise/activity-exercise.controller';
import { ActivityExerciseService } from '../src/training/activity-exercise/activity-exercise.service';

const secret = 'training-e2e-test-secret';
const permissionsByUser = new Map<number, string[]>();
const operationRoutes = [
  { method: 'post', path: '/exercises', permission: 'manage_exercises', status: 201 },
  { method: 'get', path: '/exercises', permission: 'manage_exercises', status: 200 },
  { method: 'get', path: '/exercises/1', permission: 'manage_exercises', status: 200 },
  { method: 'patch', path: '/exercises/1', permission: 'manage_exercises', status: 200 },
  { method: 'delete', path: '/exercises/1', permission: 'manage_exercises', status: 204 },
  { method: 'post', path: '/routines', permission: 'create_routine', status: 201 },
  { method: 'get', path: '/routines', permission: 'read_routine', status: 200 },
  { method: 'get', path: '/routines/1', permission: 'read_routine', status: 200 },
  { method: 'patch', path: '/routines/1', permission: 'update_routine', status: 200 },
  { method: 'delete', path: '/routines/1', permission: 'delete_routine', status: 204 },
  { method: 'post', path: '/routine-exercises', permission: 'create_routine', status: 201 },
  { method: 'get', path: '/routine-exercises', permission: 'read_routine', status: 200 },
  { method: 'get', path: '/routine-exercises/1', permission: 'read_routine', status: 200 },
  { method: 'patch', path: '/routine-exercises/1', permission: 'update_routine', status: 200 },
  { method: 'delete', path: '/routine-exercises/1', permission: 'delete_routine', status: 204 },
  { method: 'post', path: '/activity-logs', permission: 'create_activity', status: 201 },
  { method: 'get', path: '/activity-logs', permission: 'read_activity', status: 200 },
  { method: 'get', path: '/activity-logs/1', permission: 'read_activity', status: 200 },
  { method: 'patch', path: '/activity-logs/1', permission: 'update_activity', status: 200 },
  { method: 'delete', path: '/activity-logs/1', permission: 'delete_activity', status: 204 },
  { method: 'post', path: '/activity-exercises', permission: 'create_activity', status: 201 },
  { method: 'get', path: '/activity-exercises', permission: 'read_activity', status: 200 },
  { method: 'get', path: '/activity-exercises/1', permission: 'read_activity', status: 200 },
  { method: 'patch', path: '/activity-exercises/1', permission: 'update_activity', status: 200 },
  { method: 'delete', path: '/activity-exercises/1', permission: 'delete_activity', status: 204 },
] as const;

function token(sub: number): string {
  const encode = (value: object) => Buffer.from(JSON.stringify(value)).toString('base64url');
  const header = encode({ alg: 'HS256', typ: 'JWT' });
  const payload = encode({ sub, iat: Math.floor(Date.now() / 1000), exp: Math.floor(Date.now() / 1000) + 3600 });
  const data = `${header}.${payload}`;
  const signature = createHmac('sha256', secret).update(data).digest('base64url');
  return `${data}.${signature}`;
}

describe('Training permissions (HTTP)', () => {
  let app: INestApplication;
  const serviceMocks = [
    ExerciseService, RoutineService, RoutineExerciseService, ActivityLogService, ActivityExerciseService,
  ];
  const controllers = [
    ExerciseController, RoutineController, RoutineExerciseController, ActivityLogController, ActivityExerciseController,
  ];

  beforeAll(async () => {
    const serviceProviders = serviceMocks.map((service) => ({
      provide: service,
      useValue: new Proxy({}, {
        get: (_target, property) => property === 'then' ? undefined : jest.fn().mockResolvedValue({ id: 1 }),
      }),
    }));
    const moduleRef = await Test.createTestingModule({
      imports: [PassportModule.register({ defaultStrategy: 'jwt' })],
      controllers,
      providers: [
        ...serviceProviders,
        PermissionsGuard,
        JwtStrategy,
        { provide: ConfigService, useValue: { get: () => secret } },
        {
          provide: UserService,
          useValue: {
            findOne: async (id: number) => ({
              id,
              role: {
                rolePermissions: (permissionsByUser.get(id) ?? []).map((name) => ({ permission: { name } })),
              },
            }),
          },
        },
      ],
    }).compile();

    app = moduleRef.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    if (app) await app.close();
  });

  operationRoutes.forEach((route, index) => {
    const permittedUserId = 100 + index;
    const deniedUserId = 1000 + index;

    it(`${route.method.toUpperCase()} ${route.path} rejects a request without a token`, async () => {
      const response = await request(app.getHttpServer())[route.method](route.path).send({}).expect(401);
      expect(response.body).toBeDefined();
    });

    it(`${route.method.toUpperCase()} ${route.path} accepts a user with ${route.permission}`, async () => {
      permissionsByUser.set(permittedUserId, [route.permission]);
      await request(app.getHttpServer())[route.method](route.path)
        .set('Authorization', `Bearer ${token(permittedUserId)}`).send({}).expect(route.status);
    });

    it(`${route.method.toUpperCase()} ${route.path} rejects an authenticated user without ${route.permission}`, async () => {
      await request(app.getHttpServer())[route.method](route.path)
        .set('Authorization', `Bearer ${token(deniedUserId)}`).send({}).expect(403);
    });
  });
});
