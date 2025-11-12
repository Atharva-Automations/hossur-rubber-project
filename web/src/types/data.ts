// Shared Types from Prisma Schema
export interface InwardEntry {
  id: number;
  materialName: string;
  supplierName: string;
  //   quantity      Float
  //   unit          String
  //   bagWeight     Float?
  //   storedAsWhole Boolean        @default(false)
  //   mfgDate       DateTime
  //   expDate       DateTime
  //   status        String
  //   createdAt     DateTime       @default(now())
  //   updatedAt     DateTime       @updatedAt
  //   qrCodes       InwardQrCode[]
}

export interface BinAssignmentData {
  binNumber: string;
  ingredientId: number;
  minQuantity: number;
  maxQuantity: number;
}

export interface IngredientOption {
  // Matches the definition in useIngredients file
  id: number;
  ingredientCode: string;
  name?: string | null;
  materialName?: string; // Add if returned by unassigned ingredients
}

export interface OutwardCreateDto {
  materialName: string;
  issuedTo: string;
  selectedQrIds: string[];
  // ... other optional fields ...
}
// ...
