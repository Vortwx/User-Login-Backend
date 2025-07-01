export interface IJwtService {
    sign(payload: Record<string, any>): Promise<string>;
    verify<T>(token: string): Promise<T>;
}

export const JWT_SERVICE_TOKEN = 'IJwtService';
