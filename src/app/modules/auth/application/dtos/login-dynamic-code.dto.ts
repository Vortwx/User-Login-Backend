import { IsString, IsUUID, Length } from 'class-validator';

export class LoginDynamicCodeDto {
    @IsString()
    @IsUUID('4', { message: 'Invalid temporary token format.' })
    preAuthToken!: string;
  
    @IsString()
    @Length(6, 6, { message: 'Dynamic code must be 6 digits.' })
    dynamicCode!: string;
  }
  
  export class DynamicCodeLoginResponseDto {
    sessionToken!: string; // The final JWT
  }