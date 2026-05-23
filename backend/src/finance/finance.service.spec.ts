import { Test, TestingModule } from '@nestjs/testing';
import { FinanceService } from './finance.service';
import { PrismaService } from '../prisma/prisma.service';

describe('FinanceService', () => {
  let service: FinanceService;
  let prismaMock: any;

  beforeEach(async () => {
    prismaMock = {
      systemSetting: {
        findUnique: jest.fn(),
      },
      payment: {
        aggregate: jest.fn(),
        findMany: jest.fn(),
        create: jest.fn(),
      },
      expense: {
        aggregate: jest.fn(),
        groupBy: jest.fn(),
        findMany: jest.fn(),
        create: jest.fn(),
      },
      student: {
        groupBy: jest.fn(),
        findMany: jest.fn(),
        findUnique: jest.fn(),
      },
      feeStructure: {
        findMany: jest.fn(),
        createMany: jest.fn(),
        upsert: jest.fn(),
      },
      teacher: {
        findMany: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FinanceService,
        { provide: PrismaService, useValue: prismaMock },
      ],
    }).compile();

    service = module.get<FinanceService>(FinanceService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('computeTermBreakdown', () => {
    it('should allocate payments sequentially', () => {
      const scholarType = 'Day';
      const structures = [
        { scholarType: 'Day', totalAmount: 150000, term: 1 },
        { scholarType: 'Day', totalAmount: 150000, term: 2 },
        { scholarType: 'Day', totalAmount: 150000, term: 3 },
      ];
      // Total paid is 250,000 (100k for term 1, 150k for term 2)
      const payments = [
        { amount: 100000, term: 1 },
        { amount: 150000, term: 2 },
      ];

      const res = (service as any).computeTermBreakdown(scholarType, payments, structures);

      // Term 1 should be fully paid (150,000 expected, 150,000 allocated)
      expect(res.terms[0]).toEqual(expect.objectContaining({
        term: 1,
        expectedFee: 150000,
        effectivePaid: 150000,
        balance: 0,
        overpaid: 0,
        status: 'Paid',
      }));

      // Term 2 should be partially paid (150,000 expected, 100,000 allocated)
      expect(res.terms[1]).toEqual(expect.objectContaining({
        term: 2,
        expectedFee: 150000,
        effectivePaid: 100000,
        balance: 50000,
        overpaid: 0,
        status: 'Partial',
      }));

      // Term 3 should be unpaid
      expect(res.terms[2]).toEqual(expect.objectContaining({
        term: 3,
        expectedFee: 150000,
        effectivePaid: 0,
        balance: 150000,
        overpaid: 0,
        status: 'Unpaid',
      }));

      // Annual summary should be correct
      expect(res.annual).toEqual({
        totalExpected: 450000,
        totalPaid: 250000,
        totalBalance: 200000,
        totalOverpaid: 0,
        status: 'Partial',
      });
    });

    it('should handle overpayment correctly', () => {
      const scholarType = 'Boarding';
      const structures = [
        { scholarType: 'Boarding', totalAmount: 250000, term: 1 },
        { scholarType: 'Boarding', totalAmount: 250000, term: 2 },
        { scholarType: 'Boarding', totalAmount: 250000, term: 3 },
      ];
      const payments = [
        { amount: 300000, term: 1 },
        { amount: 500000, term: 2 },
      ]; // Total 800,000 (total expected 750,000)

      const res = (service as any).computeTermBreakdown(scholarType, payments, structures);

      expect(res.terms[0]).toEqual(expect.objectContaining({
        term: 1,
        expectedFee: 250000,
        effectivePaid: 250000,
        balance: 0,
        status: 'Paid',
      }));

      expect(res.terms[1]).toEqual(expect.objectContaining({
        term: 2,
        expectedFee: 250000,
        effectivePaid: 250000,
        balance: 0,
        status: 'Paid',
      }));

      expect(res.terms[2]).toEqual(expect.objectContaining({
        term: 3,
        expectedFee: 250000,
        effectivePaid: 300000, // 250k + 50k overpaid
        balance: 0,
        overpaid: 50000,
        status: 'Overpaid',
      }));

      expect(res.annual).toEqual({
        totalExpected: 750000,
        totalPaid: 800000,
        totalBalance: 0,
        totalOverpaid: 50000,
        status: 'Overpaid',
      });
    });

    it('should handle 0 expected fee structures', () => {
      const scholarType = 'Day';
      const structures = [
        { scholarType: 'Day', totalAmount: 150000, term: 1 },
        { scholarType: 'Day', totalAmount: 0, term: 2 },
        { scholarType: 'Day', totalAmount: 150000, term: 3 },
      ];
      const payments = [
        { amount: 200000, term: 1 },
      ]; // Total 200,000

      const res = (service as any).computeTermBreakdown(scholarType, payments, structures);

      expect(res.terms[0]).toEqual(expect.objectContaining({
        term: 1,
        expectedFee: 150000,
        effectivePaid: 150000,
        balance: 0,
        status: 'Paid',
      }));

      expect(res.terms[1]).toEqual(expect.objectContaining({
        term: 2,
        expectedFee: 0,
        effectivePaid: 0,
        balance: 0,
        status: 'N/A',
      }));

      expect(res.terms[2]).toEqual(expect.objectContaining({
        term: 3,
        expectedFee: 150000,
        effectivePaid: 50000,
        balance: 100000,
        status: 'Partial',
      }));
    });
  });
});
