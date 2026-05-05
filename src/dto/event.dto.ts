import { IsString, IsNotEmpty, IsEnum, IsOptional, IsDateString, IsNumber, Min, MaxLength, IsInt, IsBoolean } from 'class-validator';

export enum EventType {
  WEDDING = 'wedding',
  CONFERENCE = 'conference',
  BIRTHDAY = 'birthday',
  CORPORATE = 'corporate',
  CONCERT = 'concert',
  OTHER = 'other'
}

export enum EventStatus {
  DRAFT = 'draft',
  PUBLISHED = 'published',
  CANCELLED = 'cancelled',
  COMPLETED = 'completed'
}

export enum EventVisibility {
  PUBLIC = 'public',
  PRIVATE = 'private',
}

export class CreateEventDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  title!: string;

  @IsEnum(EventStatus)
  @IsOptional()
  status?: EventStatus;

  @IsString()
  @IsOptional()
  @MaxLength(1000)
  description?: string;

  @IsEnum(EventType)
  @IsNotEmpty()
  eventType!: EventType;

  @IsDateString()
  @IsNotEmpty()
  startDate!: string;

  @IsDateString()
  @IsNotEmpty()
  endDate!: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(300)
  location!: string;

  @IsNumber()
  @IsOptional()
  @Min(0)
  budget?: number;

  @IsInt()
  @IsOptional()
  @Min(1)
  guestCount?: number;

  @IsEnum(EventVisibility)
  @IsOptional()
  visibility?: EventVisibility;
}

export class UpdateEventDto {
  @IsString()
  @IsOptional()
  @MaxLength(200)
  title?: string;

  @IsString()
  @IsOptional()
  @MaxLength(1000)
  description?: string;

  @IsEnum(EventType)
  @IsOptional()
  eventType?: EventType;

  @IsEnum(EventStatus)
  @IsOptional()
  status?: EventStatus;

  @IsDateString()
  @IsOptional()
  startDate?: string;

  @IsDateString()
  @IsOptional()
  endDate?: string;

  @IsString()
  @IsOptional()
  @MaxLength(300)
  location?: string;

  @IsNumber()
  @IsOptional()
  @Min(0)
  budget?: number;

  @IsInt()
  @IsOptional()
  @Min(1)
  guestCount?: number;

  @IsString()
  @IsOptional()
  imageUrl?: string;

  @IsEnum(EventVisibility)
  @IsOptional()
  visibility?: EventVisibility;
}

export class CreateEventServiceDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  category!: string;

  @IsString()
  @IsOptional()
  @MaxLength(200)
  title?: string;

  @IsString()
  @IsOptional()
  @MaxLength(500)
  description?: string;

  @IsNumber()
  @IsOptional()
  @Min(0)
  budget?: number;

  @IsInt()
  @IsOptional()
  @Min(1)
  quantity?: number;
}

export class UpdateEventServiceDto {
  @IsString()
  @IsOptional()
  @MaxLength(100)
  category?: string;

  @IsString()
  @IsOptional()
  @MaxLength(200)
  title?: string;

  @IsString()
  @IsOptional()
  @MaxLength(500)
  description?: string;

  @IsNumber()
  @IsOptional()
  @Min(0)
  budget?: number;

  @IsInt()
  @IsOptional()
  @Min(1)
  quantity?: number;
}
