import {
  Injectable,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { PaginationDto } from '../common/dto/pagination.dto';

@Injectable()
export class SubjectsService {
  constructor(private prisma: PrismaService) {}

  async create(data: any) {
    const code =
      data.subject_code || `SUB-${Math.floor(100 + Math.random() * 900)}`;

    return this.prisma.subject.create({
      data: {
        subject_code: code,
        name: data.name,
        department: data.department,
        description: data.description,
      },
    });
  }

  async findAll(query: PaginationDto) {
    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 10;
    const skip = (page - 1) * limit;

    const where = query.search
      ? {
          OR: [
            { name: { contains: query.search } },
            { subject_code: { contains: query.search } },
            { department: { contains: query.search } },
          ],
        }
      : {};

    const [data, total] = await Promise.all([
      this.prisma.subject.findMany({
        where,
        skip,
        take: limit,
      }),
      this.prisma.subject.count({ where }),
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

  async findOne(id: number) {
    return this.prisma.subject.findUnique({
      where: { id },
    });
  }

  async remove(id: number) {
    const subject = await this.prisma.subject.findUnique({
      where: { id },
    });

    if (!subject) {
      throw new NotFoundException(`Subject with ID ${id} not found`);
    }

    // Check if the subject is assigned to any class
    // Since subjects are stored in a JSON array in the Class model
    const classes = await this.prisma.class.findMany({
      select: { name: true, subjects: true },
    });

    const assignedClass = classes.find((c) => {
      const subjects = Array.isArray(c.subjects) ? (c.subjects as any[]) : [];
      return subjects.some((s) => s.name === subject.name);
    });

    if (assignedClass) {
      throw new ConflictException(
        `Subject "${subject.name}" cannot be deleted because it is assigned to class "${assignedClass.name}"`,
      );
    }

    return this.prisma.subject.delete({
      where: { id },
    });
  }

  async bulkCreate(subjects: any[]) {
    // Basic department mapping logic
    const getDept = (name: string) => {
      const sci = [
        'Biology',
        'Physics',
        'Chemistry',
        'Mathematics',
        'Physical Science',
        'Agriculture',
        'Computer Studies',
      ];
      const lang = ['English', 'Chichewa', 'French'];
      const hum = [
        'Geography',
        'History',
        'Social Studies',
        'Life Skills',
        'Bible Knowledge',
        'Religious Studies',
      ];
      const comm = ['Business Studies', 'Accounting'];
      const tech = ['Home Economics', 'Technical Education'];

      if (sci.some((s) => name.includes(s))) return 'Sciences';
      if (lang.some((s) => name.includes(s))) return 'Languages';
      if (hum.some((s) => name.includes(s))) return 'Humanities';
      if (comm.some((s) => name.includes(s))) return 'Commercial';
      if (tech.some((s) => name.includes(s))) return 'Technical';
      return 'General';
    };

    const data = subjects.map((s) => ({
      name: s.name,
      subject_code:
        s.subject_code ||
        `SUB-${s.name.substring(0, 3).toUpperCase()}-${Math.floor(100 + Math.random() * 900)}`,
      department: s.department || getDept(s.name),
      description: s.description || `Academic course for ${s.name}`,
    }));

    return this.prisma.subject.createMany({
      data,
      skipDuplicates: true,
    });
  }
}
