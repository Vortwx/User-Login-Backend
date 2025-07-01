import { IsUUID } from 'class-validator';

export class GetUserProfileQuery {
  @IsUUID('4', { message: 'Invalid user ID format.' })
  userId!: string;

  constructor(userId: string) {
    this.userId = userId;
  }
}

export class GetUserProfileQueryResult {
  id!: string;
  username!: string;
  phoneNumber!: string;
  createdAt!: Date;
  updatedAt!: Date;
}