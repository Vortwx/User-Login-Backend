import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { IUserRepository } from '../../domain/user/interfaces/user.interface'; // Updated import path
import { User } from '../../domain/user/entities/user.entity';
import { User as PrismaUser } from '@prisma/client';

// Act as independent infrastucture implementation to allow easier replacement for other databases
@Injectable()
export class PrismaUserRepository implements IUserRepository {
    constructor(private readonly prisma: PrismaService) {}

    // Reference to Prisma.User failed
    private mapPrismaUserToDomain(prismaUser: PrismaUser): User {
        return new User(
            prismaUser.id,
            prismaUser.username,
            prismaUser.phoneNumber,
            prismaUser.hashedPassword,
            prismaUser.createdAt,
            prismaUser.updatedAt,
        );
    }

    async findById(id: string): Promise<User | null> {
        const prismaUser = await this.prisma.user.findUnique({ where: { id } });
        return prismaUser ? this.mapPrismaUserToDomain(prismaUser) : null;
    }

    async findByUsername(username: string): Promise<User | null> {
        const prismaUser = await this.prisma.user.findUnique({
            where: { username },
        });
        return prismaUser ? this.mapPrismaUserToDomain(prismaUser) : null;
    }

    async findByPhoneNumber(phoneNumber: string): Promise<User | null> {
        const prismaUser = await this.prisma.user.findUnique({
            where: { phoneNumber },
        });
        return prismaUser ? this.mapPrismaUserToDomain(prismaUser) : null;
    }

    async save(user: User): Promise<void> {
        await this.prisma.user.create({
            data: {
                id: user.id,
                username: user.username,
                phoneNumber: user.phoneNumber,
                hashedPassword: user.hashedPassword,
                createdAt: user.createdAt,
                updatedAt: user.updatedAt,
            },
        });
    }

    async update(user: User): Promise<void> {
        await this.prisma.user.update({
            where: { id: user.id },
            data: {
                username: user.username,
                phoneNumber: user.phoneNumber,
                hashedPassword: user.hashedPassword,
                updatedAt: user.updatedAt,
            },
        });
    }
}
