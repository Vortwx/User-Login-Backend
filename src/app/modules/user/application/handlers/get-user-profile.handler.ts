import { Inject, Injectable } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import {
    GetUserProfileQuery,
    GetUserProfileQueryResult,
} from '../queries/get-user-profile.query';
import {
    IUserRepository,
    USER_REPOSITORY_TOKEN,
} from '../../../shared/domain/user/interfaces/user.interface';
import { UserNotFoundError } from '../../../shared/domain/exceptions/user-not-found.error';

@Injectable()
@QueryHandler(GetUserProfileQuery)
export class GetUserProfileQueryHandler
    implements IQueryHandler<GetUserProfileQuery>
{
    constructor(
        @Inject(USER_REPOSITORY_TOKEN)
        private readonly userRepository: IUserRepository,
    ) {}

    async execute(
        query: GetUserProfileQuery,
    ): Promise<GetUserProfileQueryResult> {
        const user = await this.userRepository.findById(query.userId);

        if (!user) {
            throw new UserNotFoundError(
                `User with ID ${query.userId} not found.`,
            );
        }

        return {
            id: user.id,
            username: user.username,
            phoneNumber: user.phoneNumber,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt,
        };
    }
}
