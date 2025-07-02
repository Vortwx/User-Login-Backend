import { IsString } from 'class-validator';

export class LoginUserDto {
    @IsString()
    username!: string;

    // When user login. validation will be handled by comparision of password
    @IsString()
    password!: string;
}

export class LoginUserResponseDto {
    message!: string;
    preAuthToken?: string;
}
