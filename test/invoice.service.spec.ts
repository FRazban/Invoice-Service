import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { InvoiceService } from '../src/invoice/invoice.service';
import { Invoice } from '../src/invoice/schemas/invoice.schema';

describe('InvoiceService', () => {
  let service: InvoiceService;
  let mockInvoiceModel: any;

  beforeEach(async () => {
    mockInvoiceModel = {
      save: jest.fn().mockImplementation((dto) => Promise.resolve(dto)),
      find: jest.fn(),
      findById: jest.fn(),
      constructor: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        InvoiceService,
        {
          provide: getModelToken(Invoice.name),
          useValue: mockInvoiceModel,
        },
      ],
    }).compile();

    service = module.get<InvoiceService>(InvoiceService);
  });

  it('should create an invoice', async () => {
    const dto = {
      customer: 'Test Customer',
      amount: 100,
      reference: 'REF-123',
      date: new Date(),
      items: [{ sku: 'ITEM-1', qt: 2 }],
    };

    const result = await service.create(dto as CreateInvoiceDto);
    expect(result).toEqual(dto);
    expect(mockInvoiceModel.save).toHaveBeenCalled();
  });
});