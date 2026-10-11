import { ConflictException } from '@nestjs/common';

export function rethrowForeignKeyConflict(error: unknown, message: string): never {
    const driverError = (error as { driverError?: { code?: string } })?.driverError;
    if (driverError?.code === '23503') {
        throw new ConflictException(message);
    }
    throw error;
}
