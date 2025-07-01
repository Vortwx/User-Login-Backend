export interface IHasherService {
    hash(data: string): Promise<string>;
    compare(data: string, hashedData: string): Promise<boolean>;
}

export const HASHER_SERVICE_TOKEN = 'IHasherService';