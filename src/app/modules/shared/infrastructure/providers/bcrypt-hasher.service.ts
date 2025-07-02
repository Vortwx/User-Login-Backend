import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { IHasherService } from '../../../auth/domain/interfaces/hasher-service.interface';

@Injectable()
export class BcryptHasherService implements IHasherService {
    private readonly saltRounds: number;

    constructor(private readonly configService: ConfigService) {
        this.saltRounds = parseInt(
            this.configService.get<string>('BCRYPT_SALT_ROUNDS') || '10',
            10,
        );
    }

    async hash(data: string): Promise<string> {
        return bcrypt.hash(data, this.saltRounds);
    }

    async compare(data: string, hashedData: string): Promise<boolean> {
        return bcrypt.compare(data, hashedData);
    }
}
