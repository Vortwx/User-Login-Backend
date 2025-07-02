import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService as NestJwtService } from '@nestjs/jwt';
import { IJwtService } from 'src/auth/domain/interfaces/jwt-service.interface';

@Injectable()
export class JwtService implements IJwtService {
    constructor(
        private readonly nestJwtService: NestJwtService,
        private readonly configService: ConfigService
        ) {}

    async sign(payload: Record<string, any>, options?: { expiresIn?: string; secret?: string}): Promise<string> {
        const signingSecret = options?.secret || this.configService.get<string>('JWT_SECRET');
        // Will not fail if JWT_SECRET is defined in place but just in case
        if (!signingSecret) {
            throw new Error('JWT secret is not configured.');
        }
        return this.nestJwtService.sign(payload, {
            secret: signingSecret,
            expiresIn: options?.expiresIn || process.env.TOKEN_EXPIRATION_DURATION,
        });
    }

    async verify<T>(token: string, secret?: string): Promise<T> {
        try{
            const verifyingSecret = secret || this.configService.get<string>('JWT_SECRET');
            // Will not fail if JWT_SECRET is defined in place but just in case
            if (!verifyingSecret) {
                throw new Error('JWT secret is not configured.');
            }
            return this.nestJwtService.verify(token, {
                secret: verifyingSecret
            }) as T;
        } catch (error) {
            throw error;
        }
    }
}
