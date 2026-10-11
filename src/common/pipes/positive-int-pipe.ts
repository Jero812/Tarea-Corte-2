import { PipeTransform, Injectable, ArgumentMetadata, BadRequestException } from '@nestjs/common';

/**
 * Transforma una cadena en un entero y valida que sea estrictamente positivo (> 0).
 */
@Injectable()
export class PositiveIntPipe implements PipeTransform<string, number> {
    transform(value: string, metadata: ArgumentMetadata): number {
        const val = Number(value);

        if (!/^-?\d+$/.test(value) || !Number.isSafeInteger(val)) {
            throw new BadRequestException(`El parámetro '${metadata.data ?? 'id'}' debe ser un número entero válido.`);
        }

        if (val <= 0) {
            throw new BadRequestException(
                `El parámetro '${metadata.data ?? 'id'}' debe ser un número positivo mayor que 0.`,
            );
        }

        return val;
    }
}
