import { User } from '../../auth/entities/user.entity';

export function hasPermission(user: User, permissionName: string): boolean {
    return user.role?.rolePermissions?.some((rolePermission) => rolePermission.permission?.name === permissionName) ?? false;
}
