import { IsString, MinLength, Matches } from 'class-validator';

export class CreateUserCommand {
  @IsString()
  username!: string;

  @IsString()
  @MinLength(8, { message: 'Password must be at least 8 characters long.' })
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/, {
    message: 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character.',
  })
  password!: string;

  @IsString()
  @Matches(/^\d{10,}$/, { message: 'Phone number must be at least 10 digits long.' })
  phoneNumber!: string;

  constructor(username: string, password: string, phoneNumber: string) {
    this.username = username;
    this.password = password;
    this.phoneNumber = phoneNumber;
  }
}

export class CreateUserCommandResponse {
  id!: string;
  username!: string;
  phoneNumber!: string;
}