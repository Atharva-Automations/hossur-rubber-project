import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class OutwardService {
  constructor(private prisma: PrismaService) {}

  async create(data: Prisma.OutwardEntryCreateInput) {
    return this.prisma.outwardEntry.create({ data });
  }

  async findAll() {
    return this.prisma.outwardEntry.findMany();
  }

  async findOne(id: number) {
    return this.prisma.outwardEntry.findUnique({ where: { id } });
  }

  async update(id: number, data: Prisma.OutwardEntryUpdateInput) {
    return this.prisma.outwardEntry.update({ where: { id }, data });
  }

  async remove(id: number) {
    return this.prisma.outwardEntry.delete({ where: { id } });
  }
}
