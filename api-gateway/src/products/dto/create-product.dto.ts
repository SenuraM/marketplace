import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsString, Min } from 'class-validator';

export class CreateProductDto {
  @ApiProperty({ example: 'Product Name' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 'Product description' })
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiProperty({ example: 100 })
  @IsNumber()
  @Min(0)
  price: number;

  @ApiProperty({ example: 10 })
  @IsNumber()
  @Min(0)
  stock: number;

  @ApiProperty({ example: 'ABC123' })
  @IsString()
  @IsNotEmpty()
  productCode: string;
}