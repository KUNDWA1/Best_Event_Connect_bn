import { IsNotEmpty, IsNumber, IsOptional, IsString, MaxLength, Min } from 'class-validator';

export class CreateVendorServicePackageDto {
  @IsString()
  @IsNotEmpty({ message: 'Category is required' })
  @MaxLength(100, { message: 'Category must not exceed 100 characters' })
  category!: string;

  @IsString()
  @IsNotEmpty({ message: 'Title is required' })
  @MaxLength(150, { message: 'Title must not exceed 150 characters' })
  title!: string;

  @IsString()
  @IsOptional()
  @MaxLength(1000, { message: 'Description must not exceed 1000 characters' })
  description?: string;

  @IsNumber()
  @Min(0, { message: 'Minimum price cannot be negative' })
  minPrice!: number;

  @IsNumber()
  @Min(0, { message: 'Maximum price cannot be negative' })
  maxPrice!: number;
}

export class UpdateVendorServicePackageDto {
  @IsString()
  @IsOptional()
  @MaxLength(100, { message: 'Category must not exceed 100 characters' })
  category?: string;

  @IsString()
  @IsOptional()
  @MaxLength(150, { message: 'Title must not exceed 150 characters' })
  title?: string;

  @IsString()
  @IsOptional()
  @MaxLength(1000, { message: 'Description must not exceed 1000 characters' })
  description?: string;

  @IsNumber()
  @IsOptional()
  @Min(0, { message: 'Minimum price cannot be negative' })
  minPrice?: number;

  @IsNumber()
  @IsOptional()
  @Min(0, { message: 'Maximum price cannot be negative' })
  maxPrice?: number;
}
