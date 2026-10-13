import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { PaginationDto } from '../common/dto/pagination.dto';

@Injectable()
export class FinanceService {
  constructor(private prisma: PrismaService) {}

  /** Reads the active term & academic year from SystemSetting */
  private async getActiveTermContext(): Promise<{
    term: number;
    academicYear: string;
  }> {
    const [termSetting, yearSetting] = await Promise.all([
      this.prisma.systemSetting.findUnique({ where: { key: 'currentTerm' } }),
      this.prisma.systemSetting.findUnique({ where: { key: 'academicYear' } }),
    ]);
    return {
      term: termSetting ? parseInt(termSetting.value) : 1,
      academicYear: yearSetting?.value || new Date().getFullYear().toString(),
    };
  }

  async getOverview(filterTerm?: number, filterYear?: string) {
    const context = await this.getActiveTermContext();
    const academicYear = filterYear !== undefined ? filterYear : context.academicYear;
    const term = filterTerm !== undefined ? filterTerm : undefined;

    // Build payment filter
    const paymentWhere: any = { status: 'VERIFIED', academicYear };
    if (term !== undefined && term !== 0) {
      paymentWhere.term = term;
    }

    // Build fee structure filter
    const structureWhere: any = { academicYear };
    if (term !== undefined && term !== 0) {
      structureWhere.term = term;
    }

    // Build expense filter (by calendar year matching the academicYear)
    const expenseWhere: any = {};
    if (academicYear) {
      const yearNum = parseInt(academicYear);
      if (!isNaN(yearNum)) {
        expenseWhere.date = {
          gte: new Date(`${yearNum}-01-01T00:00:00.000Z`),
          lte: new Date(`${yearNum}-12-31T23:59:59.999Z`),
        };
      }
    }

    const [
      verifiedPayments,
      allExpenses,
      studentCounts,
      feeStructures,
      recentPayments,
      expenseGroups,
    ] = await Promise.all([
      this.prisma.payment.aggregate({
        where: paymentWhere,
        _sum: { amount: true },
      }),
      this.prisma.expense.aggregate({
        where: expenseWhere,
        _sum: { amount: true },
      }),
      this.prisma.student.groupBy({
        by: ['scholarType'],
        _count: { id: true },
      }),
      this.prisma.feeStructure.findMany({
        where: structureWhere,
      }),
      this.prisma.payment.findMany({
        where: paymentWhere,
        take: 5,
        orderBy: { date: 'desc' },
        include: {
          student: {
            include: { class: { select: { name: true } } },
          },
        },
      }),
      this.prisma.expense.groupBy({
        by: ['category'],
        where: expenseWhere,
        _sum: { amount: true },
      }),
    ]);

    // Calculate expected revenue
    let totalExpected = 0;
    studentCounts.forEach((group) => {
      // Sum all structures matching this scholarType
      const matchingStructures = feeStructures.filter(
        (fs) => fs.scholarType === group.scholarType,
      );
      matchingStructures.forEach((structure) => {
        totalExpected += structure.totalAmount * group._count.id;
      });
    });

    const totalRevenue = verifiedPayments._sum.amount || 0;
    const totalExpenses = allExpenses._sum.amount || 0;
    const pendingFees = Math.max(0, totalExpected - totalRevenue);
    const netBalance = totalRevenue - totalExpenses;

    // Calculate real category breakdown percentages
    const expenseBreakdown = [
      { label: 'Salaries', value: 0, color: '#3b82f6' },
      { label: 'Utilities', value: 0, color: '#f59e0b' },
      { label: 'Maintenance', value: 0, color: '#10b981' },
      { label: 'Supplies', value: 0, color: '#8b5cf6' },
      { label: 'Food', value: 0, color: '#ef4444' },
      { label: 'Other', value: 0, color: '#64748b' },
    ].map((item) => {
      const match = expenseGroups.find((g) => g.category === item.label);
      const amount = match?._sum.amount || 0;
      return {
        ...item,
        value:
          totalExpenses > 0 ? Math.round((amount / totalExpenses) * 100) : 0,
      };
    });

    return {
      stats: [
        {
          title: 'Total Revenue',
          value: `MK ${totalRevenue.toLocaleString()}`,
          change: '+0%',
          trend: 'up',
          icon: 'TrendingUp',
          color: '#10b981',
        },
        {
          title: 'Pending Fees',
          value: `MK ${pendingFees.toLocaleString()}`,
          change: '0%',
          trend: 'stable',
          icon: 'Clock',
          color: '#f59e0b',
        },
        {
          title: 'Total Expenses',
          value: `MK ${totalExpenses.toLocaleString()}`,
          change: '0%',
          trend: 'stable',
          icon: 'TrendingDown',
          color: '#ef4444',
        },
        {
          title: 'Net Balance',
          value: `MK ${netBalance.toLocaleString()}`,
          change: '+0%',
          trend: 'up',
          icon: 'Wallet',
          color: '#3b82f6',
        },
      ],
      recentCollections: recentPayments.map((p) => ({
        dbId: p.studentId,
        id: p.student.student_id,
        name: `${p.student.firstName} ${p.student.lastName}`,
        class: p.student.class?.name || 'N/A',
        amountPaid: `MK ${p.amount.toLocaleString()}`,
        date: new Date(p.date).toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
        }),
      })),
      expenseBreakdown,
    };
  }

  async getFeeStructure() {
    const { term, academicYear } = await this.getActiveTermContext();

    let structures = await this.prisma.feeStructure.findMany({
      where: { academicYear, term },
    });

    // If none exists, create default ones
    if (structures.length === 0) {
      await this.prisma.feeStructure.createMany({
        data: [
          {
            scholarType: 'Day',
            totalAmount: 450000,
            installments: [150000, 150000, 150000],
            academicYear,
            term,
          },
          {
            scholarType: 'Boarding',
            totalAmount: 750000,
            installments: [250000, 250000, 250000],
            academicYear,
            term,
          },
        ],
      });
      structures = await this.prisma.feeStructure.findMany({
        where: { academicYear, term },
      });
    }

    return structures;
  }

  async updateFeeStructure(data: any) {
    const { term, academicYear } = await this.getActiveTermContext();

    for (const item of data) {
      await this.prisma.feeStructure.upsert({
        where: {
          scholarType_academicYear_term: {
            scholarType: item.scholarType,
            academicYear,
            term,
          },
        },
        update: {
          totalAmount: parseFloat(
            item.totalAmount.toString().replace(/,/g, ''),
          ),
          installments: item.installments,
        },
        create: {
          scholarType: item.scholarType,
          totalAmount: parseFloat(
            item.totalAmount.toString().replace(/,/g, ''),
          ),
          installments: item.installments,
          academicYear,
          term,
        },
      });
    }
    return { message: 'Fee structure updated successfully' };
  }

  async getPayments(query?: PaginationDto) {
    const page = Number(query?.page) || 1;
    const limit = Number(query?.limit) || 10;
    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      this.prisma.payment.findMany({
        skip,
        take: limit,
        orderBy: { date: 'desc' },
        include: {
          student: {
            include: { class: { select: { name: true } } },
          },
        },
      }),
      this.prisma.payment.count(),
    ]);

    return {
      data,
      meta: {
        total,
        page,
        lastPage: Math.ceil(total / limit),
        limit,
      },
    };
  }

  async searchStudents(query: string) {
    return this.prisma.student.findMany({
      where: {
        OR: [
          { firstName: { contains: query } },
          { lastName: { contains: query } },
          { student_id: { contains: query } },
        ],
      },
      select: {
        id: true,
        student_id: true,
        firstName: true,
        lastName: true,
        scholarType: true,
        class: { select: { name: true } },
      },
      take: 10,
    });
  }

  async recordPayment(data: any, user?: { userId?: number; email?: string }) {
    const { term: activeTerm, academicYear } =
      await this.getActiveTermContext();
    const paymentTerm = data.term ? parseInt(data.term) : activeTerm;
    const recorder = await this.resolveRecorder(user);

    return this.prisma.payment.create({
      data: {
        studentId: parseInt(data.studentId),
        amount: parseFloat(data.amount),
        date: data.date ? new Date(data.date) : new Date(),
        method: data.method,
        reference: data.reference || null,
        academicYear,
        term: paymentTerm,
        status: 'VERIFIED',
        recordedBy: recorder.name,
        recordedById: recorder.userId,
      },
    });
  }

  /**
   * Resolves a human-readable name for the user recording a payment so every
   * payment carries an audit trail of who captured it.
   */
  private async resolveRecorder(user?: { userId?: number; email?: string }) {
    const userId = user?.userId;
    if (!userId) {
      return { userId: undefined, name: user?.email || 'Unknown' };
    }

    try {
      const admin = await this.prisma.adminProfile.findUnique({
        where: { userId },
      });
      if (admin) {
        return {
          userId,
          name: `${admin.firstName || ''} ${admin.lastName || ''}`.trim(),
        };
      }

      const teacher = await this.prisma.teacher.findUnique({
        where: { userId },
      });
      if (teacher) {
        return {
          userId,
          name: `${teacher.firstName || ''} ${teacher.lastName || ''}`.trim(),
        };
      }

      const student = await this.prisma.student.findUnique({
        where: { userId },
      });
      if (student) {
        return {
          userId,
          name: `${student.firstName || ''} ${student.lastName || ''}`.trim(),
        };
      }
    } catch (err) {
      console.error('Unable to resolve payment recorder:', err);
    }

    return { userId, name: user?.email || 'Unknown' };
  }

  /**
   * Calculates per-term fee breakdown for a single student.
   * Overpayment from earlier terms automatically carries forward.
   */
  private computeTermBreakdown(
    scholarType: string | null,
    payments: { amount: number; term: number }[],
    structures: { scholarType: string; totalAmount: number; term: number }[],
  ) {
    const terms = [1, 2, 3];
    const totalPayments = payments.reduce((sum, p) => sum + p.amount, 0);
    let remainingPool = totalPayments;

    const breakdown = terms.map((t) => {
      const structure = structures.find(
        (fs) => fs.scholarType === scholarType && fs.term === t,
      );
      const expectedFee = structure ? structure.totalAmount : 0;
      const termPayments = payments
        .filter((p) => p.term === t)
        .reduce((sum, p) => sum + p.amount, 0);

      // Allocate from the pooled payments sequentially
      const allocated = Math.min(remainingPool, expectedFee);
      remainingPool = Math.max(0, remainingPool - allocated);

      // For the last term (Term 3), any remaining payment is overpaid
      const isLastTerm = t === 3;
      const overpaid = isLastTerm ? remainingPool : 0;
      const effectivePaid = allocated + overpaid;
      const balance = Math.max(0, expectedFee - allocated);

      let status = 'Unpaid';
      if (expectedFee === 0) {
        status = effectivePaid > 0 ? 'Overpaid' : 'N/A';
      } else if (effectivePaid >= expectedFee) {
        status = overpaid > 0 ? 'Overpaid' : 'Paid';
      } else if (effectivePaid > 0) {
        status = 'Partial';
      }

      return {
        term: t,
        expectedFee,
        termPaid: termPayments,
        effectivePaid,
        balance,
        overpaid,
        status,
      };
    });

    const annualExpected = breakdown.reduce((s, b) => s + b.expectedFee, 0);
    const annualPaid = totalPayments;
    const annualBalance = breakdown.reduce((s, b) => s + b.balance, 0);
    const annualOverpaid = remainingPool; // remaining pool after all allocations

    let annualStatus = 'Unpaid';
    if (annualExpected > 0 && annualBalance === 0) {
      annualStatus = annualOverpaid > 0 ? 'Overpaid' : 'Paid';
    } else if (annualPaid > 0) {
      annualStatus = 'Partial';
    }

    return {
      terms: breakdown,
      annual: {
        totalExpected: annualExpected,
        totalPaid: annualPaid,
        totalBalance: annualBalance,
        totalOverpaid: annualOverpaid,
        status: annualStatus,
      },
    };
  }

  async getStudentFees() {
    const { term: activeTerm, academicYear } =
      await this.getActiveTermContext();

    // Get all students with ALL payments for this academic year
    const students = await this.prisma.student.findMany({
      include: {
        payments: {
          where: { academicYear, status: 'VERIFIED' },
        },
        class: true,
      },
    });

    // Get fee structures for all terms
    const structures = await this.prisma.feeStructure.findMany({
      where: { academicYear },
    });

    return students.map((s) => {
      const paymentData = s.payments.map((p) => ({
        amount: p.amount,
        term: p.term,
      }));

      const { terms, annual } = this.computeTermBreakdown(
        s.scholarType,
        paymentData,
        structures,
      );

      return {
        id: s.student_id,
        dbId: s.id,
        name: `${s.firstName} ${s.lastName}`,
        class: s.class?.name || 'N/A',
        scholarType: s.scholarType,
        activeTerm,
        termBreakdown: terms,
        annualSummary: annual,
        // Backward-compatible flat fields (use active term data)
        feeStatus: annual.status,
        amountPaid: `MK ${annual.totalPaid.toLocaleString()}`,
        balance: `MK ${annual.totalBalance.toLocaleString()}`,
      };
    });
  }

  async getStudentAccount(studentId: number) {
    const { term: activeTerm, academicYear } =
      await this.getActiveTermContext();

    const student = await this.prisma.student.findUnique({
      where: { id: studentId },
      include: {
        payments: {
          where: { academicYear, status: 'VERIFIED' },
          orderBy: { date: 'desc' },
        },
        class: true,
      },
    });

    if (!student) {
      throw new Error('Student not found');
    }

    const structures = await this.prisma.feeStructure.findMany({
      where: { academicYear },
    });

    const paymentData = student.payments.map((p) => ({
      amount: p.amount,
      term: p.term,
    }));

    const { terms, annual } = this.computeTermBreakdown(
      student.scholarType,
      paymentData,
      structures,
    );

    // Enrich terms with individual payment records
    const termsWithPayments = terms.map((t) => ({
      ...t,
      payments: student.payments
        .filter((p) => p.term === t.term)
        .map((p) => ({
          id: p.id,
          amount: p.amount,
          date: p.date,
          method: p.method,
          reference: p.reference,
          recordedBy: p.recordedBy,
        })),
    }));

    return {
      student: {
        id: student.id,
        studentId: student.student_id,
        name: `${student.firstName} ${student.lastName}`,
        class: student.class?.name || 'N/A',
        scholarType: student.scholarType,
      },
      academicYear,
      activeTerm,
      terms: termsWithPayments,
      annualSummary: annual,
    };
  }

  /** Full fee-payment history for one student, grouped by academic year → term. */
  async getStudentPaymentHistory(studentId: number) {
    const student = await this.prisma.student.findUnique({
      where: { id: studentId },
      include: {
        payments: {
          orderBy: [{ academicYear: 'desc' }, { term: 'asc' }, { date: 'desc' }],
        },
        class: true,
      },
    });

    if (!student) {
      throw new NotFoundException('Student not found');
    }

    const { term: currentTerm, academicYear: currentYear } =
      await this.getActiveTermContext();

    // Group payments: academicYear → term → payments
    const byYear = new Map<string, Map<number, typeof student.payments>>();
    for (const p of student.payments) {
      if (!byYear.has(p.academicYear)) byYear.set(p.academicYear, new Map());
      const byTerm = byYear.get(p.academicYear)!;
      if (!byTerm.has(p.term)) byTerm.set(p.term, []);
      byTerm.get(p.term)!.push(p);
    }

    const years = Array.from(byYear.entries())
      .sort((a, b) => b[0].localeCompare(a[0])) // newest academic year first
      .map(([year, byTerm]) => {
        const terms = Array.from(byTerm.entries())
          .sort((a, b) => a[0] - b[0])
          .map(([term, payments]) => ({
            term,
            totalPaid: payments.reduce((sum, p) => sum + p.amount, 0),
            payments: payments.map((p) => ({
              id: p.id,
              amount: p.amount,
              date: p.date,
              method: p.method,
              reference: p.reference,
              status: p.status,
              recordedBy: p.recordedBy,
            })),
          }));
        return {
          academicYear: year,
          isCurrent: year === currentYear,
          totalPaid: terms.reduce((sum, t) => sum + t.totalPaid, 0),
          terms,
        };
      });

    return {
      student: {
        id: student.id,
        studentId: student.student_id,
        name: `${student.firstName} ${student.lastName}`,
        class: student.class?.name || 'N/A',
        scholarType: student.scholarType,
      },
      currentYear,
      currentTerm,
      years,
      grandTotal: years.reduce((sum, y) => sum + y.totalPaid, 0),
      paymentCount: student.payments.length,
    };
  }

  async getExpenses(query?: PaginationDto) {
    const page = Number(query?.page) || 1;
    const limit = Number(query?.limit) || 10;
    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      this.prisma.expense.findMany({
        skip,
        take: limit,
        orderBy: { date: 'desc' },
      }),
      this.prisma.expense.count(),
    ]);

    return {
      data,
      meta: {
        total,
        page,
        lastPage: Math.ceil(total / limit),
        limit,
      },
    };
  }

  async recordExpense(data: any, file?: Express.Multer.File) {
    return this.prisma.expense.create({
      data: {
        category: data.category,
        description: data.description,
        amount: parseFloat(data.amount),
        date: data.date ? new Date(data.date) : new Date(),
        status: data.status || 'COMPLETED',
        attachmentUrl: file ? `/uploads/finance/${file.filename}` : null,
      },
    });
  }

  async updateExpense(id: number, data: any, file?: Express.Multer.File) {
    const expense = await this.prisma.expense.findUnique({
      where: { id },
    });

    if (!expense) {
      throw new Error('Expense not found');
    }

    if (expense.status !== 'PENDING') {
      throw new Error('Only expenses with PENDING status can be edited');
    }

    return this.prisma.expense.update({
      where: { id },
      data: {
        category: data.category,
        description: data.description,
        amount: data.amount ? parseFloat(data.amount) : undefined,
        date: data.date ? new Date(data.date) : undefined,
        status: data.status,
        attachmentUrl: file ? `/uploads/finance/${file.filename}` : undefined,
      },
    });
  }
  async getReports() {
    const { term, academicYear } = await this.getActiveTermContext();

    const [payments, expenses, feeStructures, studentCounts] =
      await Promise.all([
        this.prisma.payment.findMany({
          where: { academicYear, term, status: 'VERIFIED' },
          include: { student: { include: { class: true } } },
          orderBy: { date: 'desc' },
        }),
        this.prisma.expense.findMany({
          orderBy: { date: 'desc' },
        }),
        this.prisma.feeStructure.findMany({
          where: { academicYear, term },
        }),
        this.prisma.student.groupBy({
          by: ['scholarType'],
          _count: { id: true },
        }),
      ]);

    // Calculations
    const totalRevenue = payments.reduce((sum, p) => sum + p.amount, 0);
    const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
    const netBalance = totalRevenue - totalExpenses;

    // Predicted revenue based on student counts
    let totalExpected = 0;
    studentCounts.forEach((group) => {
      const structure = feeStructures.find(
        (fs) => fs.scholarType === group.scholarType,
      );
      if (structure) totalExpected += structure.totalAmount * group._count.id;
    });

    // Combine into a generic transaction timeline
    const transactions = [
      ...payments.map((p) => ({
        id: `PAY-${p.id}`,
        type: 'INCOME',
        category: 'Fee Payment',
        description: `Fee: ${p.student.firstName} ${p.student.lastName} (${p.student.student_id})`,
        amount: p.amount,
        date: p.date,
        status: 'VERIFIED',
      })),
      ...expenses.map((e) => ({
        id: `EXP-${e.id}`,
        type: 'EXPENSE',
        category: e.category,
        description: e.description,
        amount: e.amount,
        date: e.date,
        status: e.status,
      })),
    ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    return {
      summary: {
        totalRevenue,
        totalExpenses,
        netBalance,
        totalExpected,
        collectionRate:
          totalExpected > 0
            ? Math.round((totalRevenue / totalExpected) * 100)
            : 0,
      },
      transactions,
    };
  }

  async getTeachers() {
    return this.prisma.teacher.findMany({
      select: {
        id: true,
        teacher_id: true,
        firstName: true,
        lastName: true,
      },
    });
  }
}
