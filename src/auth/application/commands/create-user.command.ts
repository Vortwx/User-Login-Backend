import { IsString, MinLength, Matches, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import {
    ContainsLowercase,
    ContainsDigit,
    ContainsSpecialCharacter,
    ContainsUppercase,
    IsDigitOnly,
} from '../../../shared/domain/validators/validator';

export class CreateUserCommand {
    @ApiProperty({
        description: 'The username of the new user',
        example: 'John Doe',
    })
    @IsNotEmpty({ message: 'Username is required.' })
    @IsString()
    username: string;

    @ApiProperty({
        description: 'The password of the new user',
        minLength: 8,
        example: 'P@ssword123',
    })
    @IsNotEmpty({ message: 'Password is required.' })
    @IsString()
    @MinLength(8, { message: 'Password must be at least 8 characters long.' })
    @ContainsLowercase()
    @ContainsUppercase()
    @ContainsDigit()
    @ContainsSpecialCharacter()
    password: string;

    @ApiProperty({
        description: 'The phone number of the new user',
        example: '1234567890',
    })
    @IsNotEmpty({ message: 'Phone number is required.' })
    @IsString()
    @MinLength(10, { message: 'Phone number must be at least 10 digits long.' })
    @IsDigitOnly({ message: 'Phone number must contain only digits.' })
    phoneNumber: string;

    constructor(username: string, password: string, phoneNumber: string) {
        this.username = username;
        this.password = password;
        this.phoneNumber = phoneNumber;
    }
}

export class CreateUserCommandResponse {
    @ApiProperty({
        description: 'The unique ID assigned to the registered user',
        format: 'uuid',
        example: '11111111-2222-4333-a444-555566667777',
    })
    id: string;

    @ApiProperty({
        description: 'The username of the registered user',
        example: 'John Doe',
    })
    username: string;

    @ApiProperty({
        description: 'The phone number of the registered user',
        example: '1234567890',
    })
    phoneNumber: string;
}
