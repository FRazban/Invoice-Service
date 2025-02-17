import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { InvoiceService } from './invoice.service';
import { CreateInvoiceDto } from './dto/create-invoice.dto';

@Controller('invoices')
export class InvoiceController {
  constructor(private readonly invoiceService: InvoiceService) {}

  @Post()
  async create(@Body() createInvoiceDto: CreateInvoiceDto) {
    return this.invoiceService.create(createInvoiceDto);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.invoiceService.findById(id);
  }

  @Get()
  async findAll(@Query('startDate') startDate?: string, @Query('endDate') endDate?: string) {
    return this.invoiceService.findAll(startDate, endDate);
  }
}