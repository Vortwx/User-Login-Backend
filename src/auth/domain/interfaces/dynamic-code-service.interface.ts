export interface IDynamicCodeService {
    generateDynamicCode(): string;
    storeDynamicCode(
        userId: string,
        hashedCode: string,
        expiresInMinutes?: number,
    ): void;
    verifyDynamicCode(userId: string, code: string): Promise<boolean>;
}

export const DYNAMIC_CODE_SERVICE_TOKEN = 'IDynamicCodeService';
