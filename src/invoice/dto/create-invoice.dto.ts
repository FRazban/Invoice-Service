import { Type } from 'class-transformer';
import { IsArray, IsDate, IsNumber, IsString, ValidateNested } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

class InvoiceItemDto {
  @ApiProperty({ example: 'SKU-123', description: 'Product SKU' })
  @IsString()
  sku: string;

  @ApiProperty({ example: 2, description: 'Quantity purchased' })
  @IsNumber()
  qt: number;
}

export class CreateInvoiceDto {
    @ApiProperty({ example: 'John Doe', description: 'Customer name' })
    @IsString()
  customer: string;

  @ApiProperty({ example: 199.99, description: 'Total amount' })
  @IsNumber()
  amount: number;

  @ApiProperty({ example: 'REF-12345', description: 'Invoice reference' })
  @IsString()
  reference: string;

  @ApiProperty({ example: '2024-03-20', description: 'Invoice date' })
  @IsDate()
  @Type(() => Date)
  date: Date;

  @ApiProperty({ 
    type: [InvoiceItemDto],
    example: [{ sku: 'SKU-123', qt: 2 }],
    description: 'List of purchased items'
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => InvoiceItemDto)
  items: InvoiceItemDto[];
}