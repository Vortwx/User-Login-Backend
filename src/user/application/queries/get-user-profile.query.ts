import { ApiProperty } from '@nestjs/swagger';
import { IsUUID } from 'class-validator';

export class GetUserProfileQuery {
    @ApiProperty({
        description: 'The unique ID assigned to the user',
        format: 'uuid',
        example: '11111111-2222-4333-a444-555566667777',
    })
    @IsUUID('4', { message: 'Invalid user ID format.' })
    userId: string;

    constructor(userId: string) {
        this.userId = userId;
    }
}

export class GetUserProfileQueryResult {
    @ApiProperty({
        description: 'The unique ID assigned to the user',
        format: 'uuid',
        example: '11111111-2222-4333-a444-555566667777',
    })
    id: string;

    @ApiProperty({
        description: 'The username of the user',
        example: 'John Doe',
    })
    username: string;

    @ApiProperty({
        description: 'The phone number of the user',
        example: '1234567890',
    })
    phoneNumber: string;

    @ApiProperty({
        description: 'The date and time when the user was created',
        example: '2023-06-01T12:34:56.789Z',
    })
    createdAt!: Date;

    @ApiProperty({
        description: 'The date and time when the user was last updated',
        example: '2023-06-01T12:34:56.789Z',
    })
    updatedAt: Date;
}
