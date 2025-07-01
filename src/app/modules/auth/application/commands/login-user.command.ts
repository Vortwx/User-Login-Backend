import { IsString, MinLength } from 'class-validator';

export class LoginUserCommand {
  @IsString()
  username!: string;

  @IsString()
  @MinLength(8, { message: 'Password must be at least 8 characters long.' })
  password!: string;

  constructor(username: string, password: string) {
    this.username = username;
    this.password = password;
  }
}

export class LoginUserCommandResponse {
  message!: string;
  preAuthToken?: string;
}