import { IsEmail, IsEnum, IsNotEmpty, IsOptional, IsPhoneNumber, IsString, MaxLength, MinLength } from 'class-validator';

export enum UserRole {
  ADMIN = 'admin',
  EVENT_PLANNER = 'event_planner',
  VENDOR = 'vendor',
}

export class RegisterDto {
  @IsString()
  @MinLength(2)
  @MaxLength(50)
  firstName!: string;

  @IsString()
  @MinLength(2)
  @MaxLength(50)
  lastName!: string;

  @IsEmail()
  email!: string;

  @IsString()
  @MinLength(8)
  @MaxLength(100)
  password!: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsEnum(UserRole)
  role?: UserRole; // defaults to event_planner
}

export class LoginDto {
  @IsEmail()
  email!: string;

  @IsString()
  @MinLength(8)
  @MaxLength(100)
  password!: string;
}
