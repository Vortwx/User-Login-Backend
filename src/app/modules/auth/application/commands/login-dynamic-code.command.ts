import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsUUID, Length } from 'class-validator';

export class LoginDynamicCodeCommand {
    @ApiProperty({
        description:
            'The pre-Authentication token to validate access to the dynamic code verification',
        format: 'uuid',
        example: '11111111-2222-4333-a444-555566667777',
    })
    @IsString()
    @IsNotEmpty()
    @IsUUID('4', { message: 'Invalid pre-Authentication token format.' })
    preAuthToken: string;

    @IsString()
    @IsNotEmpty()
    @Length(6, 6, { message: 'Dynamic code must be 6 digits.' })
    dynamicCode: string;

    constructor(preAuthToken: string, dynamicCode: string) {
        this.preAuthToken = preAuthToken;
        this.dynamicCode = dynamicCode;
    }
}

export class LoginDynamicCodeCommandResponse {
    @ApiProperty({
        description: 'The session token for the authenticated user',
        format: 'uuid',
        example: '11111111-2222-4333-a444-555566667777',
    })
    sessionToken: string;
}
