import { PlcService } from './plc.service';
import { WEIGHING_REGISTERS } from '../config/registers/weighing.registers';

export class WeighingPlcService {
  private currentQrId: string | null = null;
  private currentBinNumber: number | null = null;

  constructor(private readonly plcService: PlcService) {}

  async process(payload: any) {
    console.log('Weighing Service started.');
    this.currentQrId = payload.currentIngredient.qrId;
    console.log('Received weighing payload');

    await this.closeCurrentBin();

    if (payload.firstScan) {
      console.log('Writing recipe...');
      await this.writeRecipe(payload.recipe);
    }

    console.log('Writing current ingredient...');
    await this.writeCurrentIngredient(payload.currentIngredient);

    console.log('PLC write completed.');
  }

  getCurrentQr() {
    return this.currentQrId;
  }

  clearCurrentQr() {
    this.currentQrId = null;
  }

  hasActiveWeighing() {
    return this.currentQrId !== null;
  }

  private async writeRecipe(recipe: any) {
    // Recipe Name
    await this.plcService.writeAscii(
      WEIGHING_REGISTERS.RECIPE_NAME_START,
      recipe.recipeName,
      WEIGHING_REGISTERS.RECIPE_NAME_LENGTH
    );

    // Ingredient Count
    await this.plcService.writeWord(
      WEIGHING_REGISTERS.INGREDIENT_COUNT,
      recipe.ingredientCount
    );

    // Ingredients
    for (const ingredient of recipe.ingredients) {
      const index = ingredient.ingredientNumber - 1;

      // Ingredient Code
      await this.plcService.writeAscii(
        WEIGHING_REGISTERS.INGREDIENT_CODE_START +
          index * WEIGHING_REGISTERS.INGREDIENT_CODE_LENGTH,
        ingredient.ingredientCode,
        WEIGHING_REGISTERS.INGREDIENT_CODE_LENGTH
      );

      // Weight (grams)
      await this.plcService.writeDWord(
        WEIGHING_REGISTERS.WEIGHT_START +
          index * WEIGHING_REGISTERS.WEIGHT_STEP,
        ingredient.quantity
      );

      // Tolerance
      await this.plcService.writeFloat(
        WEIGHING_REGISTERS.TOLERANCE_START +
          index * WEIGHING_REGISTERS.TOLERANCE_STEP,
        ingredient.tolerance
      );
    }

    console.log('Recipe written.');
  }

  private async writeCurrentIngredient(current: any) {
    const unloadingRegister =
      WEIGHING_REGISTERS.BIN_UNLOADING[current.binNumber];

    if (!unloadingRegister) {
      throw new Error(
        `No unloading register configured for Bin ${current.binNumber}`
      );
    }

    // Open Bin
    await this.plcService.writeWord(unloadingRegister, 2);
    this.currentBinNumber = current.binNumber;

    // Current Ingredient Number
    await this.plcService.writeWord(
      WEIGHING_REGISTERS.CURRENT_INGREDIENT,
      current.ingredientNumber
    );

    // Weighing Machine
    await this.plcService.writeWord(
      WEIGHING_REGISTERS.WEIGHING_MACHINE,
      current.weighingMachine
    );

    console.log(
      `Ingredient ${current.ingredientNumber} written. Bin ${current.binNumber} opened.`
    );
  }

  async closeCurrentBin() {
    if (this.currentBinNumber == null) {
      return;
    }

    const unloadingRegister =
      WEIGHING_REGISTERS.BIN_UNLOADING[this.currentBinNumber];

    if (!unloadingRegister) {
      return;
    }

    await this.plcService.writeWord(unloadingRegister, 0);

    this.currentBinNumber = null;
  }

  async closeAllBins() {
    const registers = Object.values(WEIGHING_REGISTERS.BIN_UNLOADING);

    for (const register of registers) {
      await this.plcService.writeWord(register, 1);
    }

    this.currentBinNumber = null;

    console.log('All bins closed.');
  }
}
