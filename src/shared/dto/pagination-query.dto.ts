import {
  IsOptional,
  IsString,
  IsNumberString,
  IsBoolean,
} from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';

export class ProductQueryDto {
  @ApiPropertyOptional({ default: 10, description: 'Items per page' })
  @IsOptional()
  @IsNumberString()
  limit?: number;

  @ApiPropertyOptional({ default: 1, description: 'Page number' })
  @IsOptional()
  @IsNumberString()
  page?: number;

  @ApiPropertyOptional({ description: 'Search by product name' })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ description: 'Filter by active status' })
  @IsOptional()
  @Transform(({ value }) => value === 'true')
  @IsBoolean()
  isActive?: boolean;

  @ApiPropertyOptional({ description: 'Minimum price' })
  @IsOptional()
  @IsNumberString()
  minPrice?: number;

  @ApiPropertyOptional({ description: 'Maximum price' })
  @IsOptional()
  @IsNumberString()
  maxPrice?: number;
}

export class InvoiceQueryDto {
  @ApiPropertyOptional({ default: 10, description: 'Items per page' })
  @IsOptional()
  @IsNumberString()
  limit?: number;

  @ApiPropertyOptional({ default: 1, description: 'Page number' })
  @IsOptional()
  @IsNumberString()
  page?: number;

  @ApiPropertyOptional({ description: 'Search by due date' })
  @IsOptional()
  dueDate?: Date;

  @ApiPropertyOptional({ description: 'Search' })
  @IsOptional()
  search?: string;

  @ApiPropertyOptional({ description: 'Search by status' })
  @IsOptional()
  @IsString()
  status?: string;
}

export class ClientQueryDto {
  @ApiPropertyOptional({ default: 10, description: 'Items per page' })
  @IsOptional()
  @IsNumberString()
  limit?: number;

  @ApiPropertyOptional({ default: 1, description: 'Page number' })
  @IsOptional()
  @IsNumberString()
  page?: number;

  @ApiPropertyOptional({ description: 'Search' })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ description: 'Category' })
  @IsOptional()
  @IsString()
  category?: string;

  @ApiPropertyOptional({ description: 'Brand' })
  @IsOptional()
  @IsString()
  brand?: string;

  @ApiPropertyOptional({ description: 'Stock' })
  @Transform(({ value }) => value === 'true')
  @IsOptional()
  @IsBoolean()
  stock?: string;
}
export class DetailBLDto {
  @ApiPropertyOptional({ description: 'Search' })
  @IsString()
  combine?: string;
}

export class UserQueryDto {
  @ApiPropertyOptional({ default: 10, description: 'Items per page' })
  @IsOptional()
  @IsNumberString()
  limit?: number;

  @ApiPropertyOptional({ default: 1, description: 'Page number' })
  @IsOptional()
  @IsNumberString()
  page?: number;

  @ApiPropertyOptional({ description: 'Search' })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ description: 'Search by status' })
  @IsOptional()
  @IsString()
  status?: string;
}
