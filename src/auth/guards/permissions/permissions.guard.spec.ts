import { ExecutionContext, ForbiddenException, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

import { Permissions } from '../../decorators/permissions.decorator';
import { PermissionsGuard } from './permissions.guard';

describe('PermissionsGuard', () => {
    class TestController {
        protectedOperation() {
            return 'protected';
        }

        operationWithoutPermission() {
            return 'not configured';
        }
    }

    const descriptor = Object.getOwnPropertyDescriptor(TestController.prototype, 'protectedOperation');
    if (descriptor) {
        Permissions('manage_users')(TestController.prototype, 'protectedOperation', descriptor);
    }

    function executionContext(user?: unknown, handlerName = 'protectedOperation'): ExecutionContext {
        return {
            getHandler: () => TestController.prototype[handlerName],
            getClass: () => TestController,
            switchToHttp: () => ({ getRequest: () => ({ user }) }),
        } as unknown as ExecutionContext;
    }

    const guard = new PermissionsGuard(new Reflector());

    it('rejects a request without an authenticated user', () => {
        expect(() => guard.canActivate(executionContext())).toThrow(UnauthorizedException);
    });

    it('allows an authenticated user with the required role permission', () => {
        const user = { role: { rolePermissions: [{ permission: { name: 'manage_users' } }] } };

        expect(guard.canActivate(executionContext(user))).toBe(true);
    });

    it('rejects an authenticated user without the required permission', () => {
        const user = { role: { rolePermissions: [{ permission: { name: 'manage_roles' } }] } };

        expect(() => guard.canActivate(executionContext(user))).toThrow(ForbiddenException);
    });

    it('fails closed when a protected route has no permission metadata', () => {
        const user = { role: { rolePermissions: [{ permission: { name: 'manage_users' } }] } };

        expect(() => guard.canActivate(executionContext(user, 'operationWithoutPermission'))).toThrow(
            ForbiddenException,
        );
    });
});
