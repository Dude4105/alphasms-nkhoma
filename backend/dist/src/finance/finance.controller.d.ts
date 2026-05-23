import { FinanceService } from './finance.service';
export declare class FinanceController {
    private readonly financeService;
    constructor(financeService: FinanceService);
    getOverview(term?: string, academicYear?: string): Promise<{
        stats: {
            title: string;
            value: string;
            change: string;
            trend: string;
            icon: string;
            color: string;
        }[];
        recentCollections: {
            id: string;
            name: string;
            class: string;
            amountPaid: string;
            date: string;
        }[];
        expenseBreakdown: {
            value: number;
            label: string;
            color: string;
        }[];
    }>;
    test(): {
        message: string;
    };
    getReports(): Promise<{
        summary: {
            totalRevenue: number;
            totalExpenses: number;
            netBalance: number;
            totalExpected: number;
            collectionRate: number;
        };
        transactions: {
            id: string;
            type: string;
            category: string;
            description: string;
            amount: number;
            date: Date;
            status: string;
        }[];
    }>;
    getTeachers(): Promise<{
        id: number;
        firstName: string;
        lastName: string;
        teacher_id: string;
    }[]>;
    getFeeStructure(): Promise<{
        id: number;
        updatedAt: Date;
        scholarType: string;
        academicYear: string;
        term: number;
        totalAmount: number;
        installments: import("@prisma/client/runtime/library").JsonValue | null;
    }[]>;
    updateFeeStructure(data: any): Promise<{
        message: string;
    }>;
    getPayments(): Promise<({
        student: {
            class: {
                name: string;
            } | null;
        } & {
            id: number;
            firstName: string;
            lastName: string;
            userId: number;
            createdAt: Date;
            updatedAt: Date;
            email: string | null;
            student_id: string;
            gender: string | null;
            dob: string | null;
            enrollmentDate: string | null;
            scholarType: string | null;
            guardianName: string | null;
            guardianRelation: string | null;
            guardianPhone: string | null;
            guardianEmail: string | null;
            guardianAddress: string | null;
            classHistory: string | null;
            classId: number | null;
            hostelId: number | null;
        };
    } & {
        id: number;
        createdAt: Date;
        studentId: number;
        status: string;
        academicYear: string;
        term: number;
        amount: number;
        date: Date;
        method: string;
        reference: string | null;
    })[]>;
    recordPayment(data: any): Promise<{
        id: number;
        createdAt: Date;
        studentId: number;
        status: string;
        academicYear: string;
        term: number;
        amount: number;
        date: Date;
        method: string;
        reference: string | null;
    }>;
    searchStudents(query: string): Promise<{
        id: number;
        firstName: string;
        lastName: string;
        class: {
            name: string;
        } | null;
        student_id: string;
        scholarType: string | null;
    }[]>;
    getStudentFees(): Promise<{
        id: string;
        dbId: number;
        name: string;
        class: string;
        scholarType: string | null;
        activeTerm: number;
        termBreakdown: {
            term: number;
            expectedFee: number;
            termPaid: number;
            effectivePaid: number;
            balance: number;
            overpaid: number;
            status: string;
        }[];
        annualSummary: {
            totalExpected: number;
            totalPaid: number;
            totalBalance: number;
            totalOverpaid: number;
            status: string;
        };
        feeStatus: string;
        amountPaid: string;
        balance: string;
    }[]>;
    getStudentAccount(studentId: number): Promise<{
        student: {
            id: number;
            studentId: string;
            name: string;
            class: string;
            scholarType: string | null;
        };
        academicYear: string;
        activeTerm: number;
        terms: {
            payments: {
                id: number;
                amount: number;
                date: Date;
                method: string;
                reference: string | null;
            }[];
            term: number;
            expectedFee: number;
            termPaid: number;
            effectivePaid: number;
            balance: number;
            overpaid: number;
            status: string;
        }[];
        annualSummary: {
            totalExpected: number;
            totalPaid: number;
            totalBalance: number;
            totalOverpaid: number;
            status: string;
        };
    }>;
    getExpenses(): Promise<{
        id: number;
        createdAt: Date;
        status: string;
        description: string;
        amount: number;
        date: Date;
        category: string;
        attachmentUrl: string | null;
    }[]>;
    recordExpense(data: any, file: Express.Multer.File): Promise<{
        id: number;
        createdAt: Date;
        status: string;
        description: string;
        amount: number;
        date: Date;
        category: string;
        attachmentUrl: string | null;
    }>;
    updateExpense(id: number, data: any, file: Express.Multer.File): Promise<{
        id: number;
        createdAt: Date;
        status: string;
        description: string;
        amount: number;
        date: Date;
        category: string;
        attachmentUrl: string | null;
    }>;
}
