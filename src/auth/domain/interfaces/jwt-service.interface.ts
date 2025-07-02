export interface IJwtService {
    sign(payload: Record<string, any>, options?: { expiresIn?: string; secret?: string}): Promise<string>;
    verify<T>(token: string, secret?: string): Promise<T>;
}

export const JWT_SERVICE_TOKEN = 'IJwtService';
