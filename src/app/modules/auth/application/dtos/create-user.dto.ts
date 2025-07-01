import { IsString, MinLength, MaxLength, Matches } from 'class-validator';

export class CreateUserDto {
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
}

export class RegisterUserResponseDto {
  id!: string;
  username!: string;
  phoneNumber!: string;
}