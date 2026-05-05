import { ArrayMaxSize, IsArray, IsInt, IsOptional, IsString, Max, MaxLength, Min, MinLength } from 'class-validator';

/**
 * DTO for creating a new vendor profile
 */
export class CreateVendorDto {
  @IsString()
  @MinLength(3, { message: 'Business name must be at least 3 characters long' })
  @MaxLength(100, { message: 'Business name must not exceed 100 characters' })
  businessName!: string;

  @IsOptional()
  @IsString()
  @MaxLength(500, { message: 'Bio must not exceed 500 characters' })
  bio?: string;

  @IsOptional()
  @IsInt()
  @Min(0, { message: 'Experience years cannot be negative' })
  @Max(100, { message: 'Experience years must be realistic' })
  experienceYears?: number;

  @IsOptional()
  @IsString()
  @MaxLength(200, { message: 'Location must not exceed 200 characters' })
  location?: string;

  @IsOptional()
  @IsString()
  profileImage?: string;

  @IsOptional()
  @IsArray()
  @ArrayMaxSize(20, { message: 'Portfolio images must not exceed 20 items' })
  @IsString({ each: true })
  portfolioImages?: string[];

  @IsOptional()
  @IsArray()
  @ArrayMaxSize(20, { message: 'Certifications must not exceed 20 items' })
  @IsString({ each: true })
  certifications?: string[];

  @IsOptional()
  @IsArray()
  @ArrayMaxSize(20, { message: 'Awards must not exceed 20 items' })
  @IsString({ each: true })
  awards?: string[];
}

/**
 * DTO for updating vendor profile
 */
export class UpdateVendorDto {
  @IsOptional()
  @IsString()
  @MinLength(3, { message: 'Business name must be at least 3 characters long' })
  @MaxLength(100, { message: 'Business name must not exceed 100 characters' })
  businessName?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500, { message: 'Bio must not exceed 500 characters' })
  bio?: string;

  @IsOptional()
  @IsInt()
  @Min(0, { message: 'Experience years cannot be negative' })
  @Max(100, { message: 'Experience years must be realistic' })
  experienceYears?: number;

  @IsOptional()
  @IsString()
  @MaxLength(200, { message: 'Location must not exceed 200 characters' })
  location?: string;

  @IsOptional()
  @IsString()
  profileImage?: string;

  @IsOptional()
  @IsArray()
  @ArrayMaxSize(20, { message: 'Portfolio images must not exceed 20 items' })
  @IsString({ each: true })
  portfolioImages?: string[];

  @IsOptional()
  @IsArray()
  @ArrayMaxSize(20, { message: 'Certifications must not exceed 20 items' })
  @IsString({ each: true })
  certifications?: string[];

  @IsOptional()
  @IsArray()
  @ArrayMaxSize(20, { message: 'Awards must not exceed 20 items' })
  @IsString({ each: true })
  awards?: string[];
}

/**
 * DTO for vendor response
 */
export class VendorResponseDto {
  id!: string;
  userId!: string;
  businessName!: string;
  bio?: string;
  experienceYears!: number;
  location?: string;
  isVerified!: boolean;
  averageRating!: number;
  profileImage?: string;
  portfolioImages!: string[];
  certifications!: string[];
  awards!: string[];
  createdAt!: Date;
  updatedAt!: Date;
}
