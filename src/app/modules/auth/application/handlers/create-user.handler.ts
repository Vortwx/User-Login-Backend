import { Inject, Injectable } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CreateUserCommand, CreateUserCommandResponse } from '../commands/create-user.command';
import { IUserRepository, USER_REPOSITORY_TOKEN } from '../../../shared/domain/user/interfaces/user.interface';
import { IHasherService, HASHER_SERVICE_TOKEN } from '../../../auth/domain/interfaces/hasher.service.interface';
import { User } from 'src/app/modules/shared/domain/user/entities/user.entity';
import { v4 as uuidv4 } from 'uuid';
import { DuplicateUserError } from '../../domain/exceptions/duplicate-user.error';

@Injectable()
@CommandHandler(CreateUserCommand)
export class CreateUserCommandHandler implements ICommandHandler<CreateUserCommand> {
  constructor(
    @Inject(USER_REPOSITORY_TOKEN)
    private readonly userRepository: IUserRepository,
    @Inject(HASHER_SERVICE_TOKEN)
    private readonly hasherService: IHasherService,
  ) {}

  async execute(command: CreateUserCommand): Promise<CreateUserCommandResponse> {
    if (!command.username || command.username.trim() === '') {
        throw new Error('Username cannot be empty.');
    }

    const existingUserByUsername = await this.userRepository.findByUsername(command.username);
    if (existingUserByUsername) {
      throw new DuplicateUserError('Username already exists.');
    }

    const existingUserByPhoneNumber = await this.userRepository.findByPhoneNumber(command.phoneNumber);
    if (existingUserByPhoneNumber) {
        throw new DuplicateUserError('Phone number already registered.');
    }

    const hashedPassword = await this.hasherService.hash(command.password);

    const newUser = new User(uuidv4(), command.username, command.phoneNumber, hashedPassword);

    await this.userRepository.save(newUser);

    return {
      id: newUser.id,
      username: newUser.username,
      phoneNumber: newUser.phoneNumber,
    };
  }
}