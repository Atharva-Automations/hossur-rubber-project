// import { Injectable, NotFoundException } from '@nestjs/common';
// import { PrismaService } from '../prisma/prisma.service';
// import { CreateIngredientDto } from './dto/create-ingredient.dto';
// import { UpdateIngredientDto } from './dto/update-ingredient.dto';

// @Injectable()
// export class IngredientsService {
//   constructor(private prisma: PrismaService) {}

//   create(data: CreateIngredientDto) {
//     return this.prisma.ingredient.create({ data });
//   }

//   findAll() {
//     return this.prisma.ingredient.findMany({ orderBy: { id: 'desc' } });
//   }

//   async findOne(id: number) {
//     const item = await this.prisma.ingredient.findUnique({ where: { id } });
//     if (!item) throw new NotFoundException('Ingredient not found');
//     return item;
//   }

//   async update(id: number, data: UpdateIngredientDto) {
//     await this.findOne(id); // ensures 404 if missing
//     return this.prisma.ingredient.update({ where: { id }, data });
//   }

//   async remove(id: number) {
//     await this.findOne(id);
//     await this.prisma.ingredient.delete({ where: { id } });
//     return { ok: true };
//   }
// }
