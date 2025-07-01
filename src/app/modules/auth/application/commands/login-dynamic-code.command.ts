import { IsString, IsUUID, Length } from 'class-validator';

export class LoginDynamicCodeCommand {
  @IsString()
  @IsUUID('4', { message: 'Invalid temporary token format.' })
  preAuthToken!: string;

  @IsString()
  @Length(6, 6, { message: 'Dynamic code must be 6 digits.' })
  dynamicCode!: string;

  constructor(preAuthToken: string, dynamicCode: string) {
    this.preAuthToken = preAuthToken;
    this.dynamicCode = dynamicCode;
  }
}

export class LoginDynamicCodeCommandResponse {
  sessionToken!: string;
}