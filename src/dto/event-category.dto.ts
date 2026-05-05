import { IsString, MinLength, MaxLength } from 'class-validator';

export class CreateEventCategoryDto {
  @IsString()
  @MinLength(2, { message: 'Category name must be at least 2 characters long' })
  @MaxLength(100, { message: 'Category name must not exceed 100 characters' })
  name!: string;
}

export class UpdateEventCategoryDto {
  @IsString()
  @MinLength(2, { message: 'Category name must be at least 2 characters long' })
  @MaxLength(100, { message: 'Category name must not exceed 100 characters' })
  name!: string;
}
