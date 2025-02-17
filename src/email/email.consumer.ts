import { Injectable, OnModuleInit } from '@nestjs/common';
import { connect } from 'amqplib';
import { ConfigService } from '@nestjs/config';

@Injectable()

export class EmailConsumer implements OnModuleInit {
  constructor(private configService: ConfigService) {}

  async onModuleInit() {
    const conn = await connect(this.configService.get('RABBITMQ_URI'));
    const channel = await conn.createChannel();
    await channel.assertQueue('daily_sales_report');
    channel.consume('daily_sales_report', (msg) => {
      if (msg) {
        const report = JSON.parse(msg.content.toString());
        this.sendEmail(report);
        channel.ack(msg);
      }
    });
  }

  private sendEmail(report: any) {
    console.log('Email Sent:', report); // Mock implementation
  }
}