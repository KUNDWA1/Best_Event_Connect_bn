import { IsString, IsNotEmpty, IsEmail, IsEnum, IsOptional, IsInt, IsPhoneNumber } from 'class-validator';

export enum GuestCategory {
  VIP = 'VIP',
  VVIP = 'VVIP',
  STAFF = 'STAFF',
  REGULAR = 'REGULAR',
  FAMILY = 'FAMILY',
  FRIEND = 'FRIEND'
}

export enum RSVPStatus {
  Pending = 'Pending',
  Confirmed = 'Confirmed',
  Declined = 'Declined'
}

export class CreateGuestDto {
  @IsString()
  @IsNotEmpty()
  eventId!: string;

  @IsString()
  @IsNotEmpty()
  fullNames!: string;

  @IsString()
  @IsNotEmpty()
  phone!: string;

  @IsEmail()
  @IsNotEmpty()
  email!: string;

  @IsEnum(GuestCategory)
  @IsOptional()
  category?: GuestCategory;

  @IsInt()
  @IsOptional()
  tableNumber?: number;

  @IsEnum(RSVPStatus)
  @IsOptional()
  rsvpStatus?: RSVPStatus;
}

export class UpdateGuestDto {
  @IsString()
  @IsOptional()
  fullNames?: string;

  @IsString()
  @IsOptional()
  phone?: string;

  @IsEmail()
  @IsOptional()
  email?: string;

  @IsEnum(GuestCategory)
  @IsOptional()
  category?: GuestCategory;

  @IsInt()
  @IsOptional()
  tableNumber?: number;

  @IsEnum(RSVPStatus)
  @IsOptional()
  rsvpStatus?: RSVPStatus;
}

export class GuestResponseDto {
  id!: string;
  eventId!: string;
  fullNames!: string;
  phone!: string;
  email!: string;
  category!: GuestCategory;
  tableNumber?: number;
  rsvpStatus!: RSVPStatus;
  qrCode?: string;
  createdAt!: Date;
  updatedAt!: Date;
}
