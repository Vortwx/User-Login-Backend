import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsUUID, Length } from 'class-validator';

export class LoginDynamicCodeCommand {
    @ApiProperty({
        description:
            'The pre-Authentication JWT token to validate access to the dynamic code verification',
        example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJkYWMxODE3My1hZDNiLTQ5MjMtODE5Zi03ODU0NzI5ZTE1ZjkiLCJwdXJwb3NlIjoiZHluYW1pY19jb2RlX3ZlcmlmaWNhdGlvbiIsImlhdCI6MTc1MTQyNzA1OSwiZXhwIjoxNzUxNDI3MzU5fQ.OyizyIZeVrWP8B5UkVlcDEBrmDqnSuladXKQ64xiQhE',
    })
    @IsString()
    @IsNotEmpty()
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

export class LoginDynamicCodeCommandResponse {}
