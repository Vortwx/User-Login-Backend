import { Inject, Injectable } from '@nestjs/common';
import { IDynamicCodeService } from '../../../auth/domain/interfaces/dynamic-code-service.interface';
import { IHasherService } from 'src/auth/domain/interfaces/hasher-service.interface';
import { HASHER_SERVICE_TOKEN } from 'src/auth/domain/interfaces/hasher-service.interface';

interface DynamicCodeData {
    hashedCode: string;
    expiresAt: Date;
}

@Injectable()
export class DynamicCodeService implements IDynamicCodeService {
    private readonly userDynamicCodeData = new Map<string, DynamicCodeData>();

    constructor(
        @Inject(HASHER_SERVICE_TOKEN)
        private readonly hasherService: IHasherService,
    ) {}

    // Ensure this is a 6-digit dynamic code (or OTP)
    generateDynamicCode(): string {
        return Math.floor(100000 + Math.random() * 900000).toString();
    }

    storeDynamicCode(
        userId: string,
        hashedCode: string,
        expiresInMinutes: number = 5,
    ): void {
        const expiresAt = new Date(Date.now() + expiresInMinutes * 60 * 1000);
        this.userDynamicCodeData.set(userId, { hashedCode, expiresAt });

        setTimeout(
            () => {
                if (this.userDynamicCodeData.has(userId)) {
                    const currentStored = this.userDynamicCodeData.get(userId);
                    if (
                        currentStored &&
                        currentStored.hashedCode === hashedCode
                    ) {
                        this.userDynamicCodeData.delete(userId);
                        console.log(
                            `[DEBUG] OTP for user ${userId} expired and removed.`,
                        );
                    }
                }
            },
            expiresInMinutes * 60 * 1000,
        );
    }

    async verifyDynamicCode(userId: string, code: string): Promise<boolean> {
        const storedData = this.userDynamicCodeData.get(userId);

        if (!storedData) {
            return false;
        }

        if (storedData.expiresAt < new Date()) {
            this.userDynamicCodeData.delete(userId);
            return false;
        }

        const isValid = await this.hasherService.compare(
            code,
            storedData.hashedCode,
        );

        if (isValid) {
            this.userDynamicCodeData.delete(userId);
            return true;
        }

        return false;
    }
}
