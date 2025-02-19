import { Test, TestingModule } from '@nestjs/testing';
import { ReportService } from '../src/report/report.service';
import { getModelToken } from '@nestjs/mongoose';
import { Invoice } from '../src/invoice/schemas/invoice.schema';
import { ConfigService } from '@nestjs/config';
import { connect } from 'amqplib';

// Mock amqplib connect
jest.mock('amqplib');

describe('ReportService', () => {
  let service: ReportService;
  let invoiceModel: any;
  let configService: any;
  let mockChannel: any;
  let mockConnection: any;

  beforeEach(async () => {
    invoiceModel = {
      find: jest.fn(),
    };

    configService = {
      get: jest.fn().mockReturnValue('amqp://test-uri'),
    };

    mockChannel = {
      sendToQueue: jest.fn(),
    };
    mockConnection = {
      createChannel: jest.fn().mockResolvedValue(mockChannel),
    };

    (connect as jest.Mock).mockResolvedValue(mockConnection);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ReportService,
        { provide: getModelToken(Invoice.name), useValue: invoiceModel },
        { provide: ConfigService, useValue: configService },
      ],
    }).compile();

    service = module.get<ReportService>(ReportService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should generate and send daily sales report', async () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const invoiceData = [
      { amount: 100, date: today, items: [{ sku: 'A', qt: 2 }] },
      { amount: 200, date: today, items: [{ sku: 'A', qt: 3 }, { sku: 'B', qt: 1 }] },
    ];
    invoiceModel.find.mockResolvedValue(invoiceData);

    await service.generateDailySalesReport();

    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);
    expect(invoiceModel.find).toHaveBeenCalledWith({
      date: { $gte: today, $lt: tomorrow },
    });

    const expectedTotalSales = 300;
    const expectedItemsSummary = { A: 5, B: 1 };

    expect(mockChannel.sendToQueue).toHaveBeenCalledWith(
      'daily_sales_report',
      expect.any(Buffer)
    );

    const bufferArg = mockChannel.sendToQueue.mock.calls[0][1];
    const reportSent = JSON.parse(bufferArg.toString());
    expect(reportSent.totalSales).toEqual(expectedTotalSales);
    expect(reportSent.itemsSummary).toEqual(expectedItemsSummary);
    expect(reportSent.date).toBeDefined();
  });
});
