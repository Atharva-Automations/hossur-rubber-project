import { Injectable } from '@nestjs/common';
import { SequentialSession } from './interfaces/sequential-session.interface';
import { SequentialWeighingRepository } from './sequential-weighing.repository';

@Injectable()
export class SequentialWeighingService {
  constructor(private readonly repository: SequentialWeighingRepository) {}

  private session: SequentialSession | null = null;

  getSession() {
    return this.session;
  }

  async start(recipeCode: string) {
    const recipe = await this.repository.findRecipe(recipeCode);

    if (!recipe) {
      throw new Error('Recipe not found');
    }

    const steps = await this.repository.getRecipeSteps(recipe.id);

    console.log(recipe);
    console.log(steps);
  }
}
