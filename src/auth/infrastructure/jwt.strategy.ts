import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { Request } from 'express';

export interface JwtPayload {
    sub: string;
    username: string;
}

// Handle the main session token embedded in header
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor(private readonly configService: ConfigService) {
        const jwtSecret = configService.get<string>('JWT_SECRET');

        if (!jwtSecret) {
            throw new Error(
                'JWT_SECRET environment variable is not configured.',
            );
        }

        super({
            jwtFromRequest: (req: Request) => {
                if (req && req.cookies) {
                    return req.cookies['session_token']; // Look for the cookie named 'session_token'
                }
                return null; 
            },
            ignoreExpiration: false,
            secretOrKey: jwtSecret,
        });
    }

    async validate(payload: JwtPayload): Promise<JwtPayload> {
        return { sub: payload.sub, username: payload.username };
    }
}
