import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { CronJob } from 'cron';
import { SchedulerRegistry } from '@nestjs/schedule';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { connect } from 'amqplib';
import { InvoiceDocument, Invoice } from '../invoice/schemas/invoice.schema';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class ReportService implements OnModuleInit {
  private readonly logger = new Logger(ReportService.name);

  constructor(
    private readonly configService: ConfigService,
    @InjectModel(Invoice.name) private invoiceModel: Model<InvoiceDocument>,
    private readonly schedulerRegistry: SchedulerRegistry,
  ) {}

  onModuleInit() {
    const cronExpression = this.configService.get<string>('DAILY_SALES_CRON') || '0 12 * * *';
    
    const job = new CronJob(cronExpression, async () => {
      try {
        await this.generateDailySalesReport();
        this.logger.log('Daily sales report generated successfully');
      } catch (error) {
        this.logger.error('Error generating daily sales report', error);
      }
    });

    this.schedulerRegistry.addCronJob('dailySalesReport', job);
    job.start();
    this.logger.log(`Cron job scheduled with expression: ${cronExpression}`);
  }

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
    const connection = await connect(this.configService.get<string>('RABBITMQ_URI'));
    const channel = await connection.createChannel();
    await channel.sendToQueue('daily_sales_report', Buffer.from(JSON.stringify(report)));
  }
}