import { Injectable } from '@nestjs/common';
import { JwtService as NestJwtService } from '@nestjs/jwt';
import { IJwtService } from 'src/app/modules/auth/domain/interfaces/jwt-service.interface';

@Injectable()
export class JwtService implements IJwtService {
    constructor(private readonly nestJwtService: NestJwtService) {}

    async sign(payload: Record<string, any>): Promise<string> {
        return this.nestJwtService.sign(payload);
    }

    async verify<T>(token: string): Promise<T> {
        return this.nestJwtService.verify(token) as T;
    }
}
