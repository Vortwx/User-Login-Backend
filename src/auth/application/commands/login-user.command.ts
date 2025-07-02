import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MinLength } from 'class-validator';

export class LoginUserCommand {
    @ApiProperty({
        description: 'The username of the user',
        example: 'John Doe',
    })
    @IsNotEmpty({ message: 'Username is required.' })
    @IsString()
    username: string;

    // The validation of password will not be done repeatedly in the login process
    @ApiProperty({
        description: 'The password of the user',
        minLength: 8,
        example: 'P@ssword123',
    })
    @IsString()
    @IsNotEmpty()
    @MinLength(8, { message: 'Password must be at least 8 characters long.' })
    password: string;

    constructor(username: string, password: string) {
        this.username = username;
        this.password = password;
    }
}

export class LoginUserCommandResponse {
    @ApiProperty({
        description: 'A message indicating the result of the login attempt',
        example: 'Dynamic Code required. Check your registered phone number.',
    })
    message: string;

    @ApiProperty({
        description:
            'The pre-Authentication JWT token to validate access to the dynamic code verification',
        example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJkYWMxODE3My1hZDNiLTQ5MjMtODE5Zi03ODU0NzI5ZTE1ZjkiLCJwdXJwb3NlIjoiZHluYW1pY19jb2RlX3ZlcmlmaWNhdGlvbiIsImlhdCI6MTc1MTQyNzA1OSwiZXhwIjoxNzUxNDI3MzU5fQ.OyizyIZeVrWP8B5UkVlcDEBrmDqnSuladXKQ64xiQhE',
    })
    preAuthToken: string;
}
