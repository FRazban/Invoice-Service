import { Injectable } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { connect } from 'amqplib';
import { InvoiceDocument } from '../invoice/schemas/invoice.schema';
import { Invoice } from '../invoice/schemas/invoice.schema';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class ReportService {
  constructor(private configService: ConfigService,
    @InjectModel(Invoice.name) private invoiceModel: Model<InvoiceDocument>) {}

  @Cron('0 12 * * *') // 12:00 PM daily
  async generateDailySalesReport() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    const invoices = await this.invoiceModel.find({
      date: { $gte: today, $lt: tomorrow },
    });

    const totalSales = invoices.reduce((sum, inv) => sum + inv.amount, 0);
    const itemsSummary = invoices.flatMap(inv => inv.items)
      .reduce((acc, item) => {
        acc[item.sku] = (acc[item.sku] || 0) + item.qt;
        return acc;
      }, {});

    const report = { totalSales, itemsSummary, date: today.toISOString() };
    const connection = await connect(this.configService.get('RABBITMQ_URI'));
    const channel = await connection.createChannel();
    await channel.sendToQueue('daily_sales_report', Buffer.from(JSON.stringify(report)));
  }
}