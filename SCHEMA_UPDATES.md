# Database Schema Updates - Batch Execution Process

## Summary of Changes

The Prisma schema has been updated to fully support the complete batch execution workflow as described. The schema now properly tracks:

1. **Batch creation with execution options** (which steps to execute)
2. **Individual product execution** within batches
3. **Weighing process** with QR code tracking
4. **Step-by-step ingredient addition** with verification
5. **Material traceability** from inward through production
6. **Final product generation**

---

## New Enums

### `ProductExecutionStatus`

Tracks the lifecycle of individual products within a batch:

- `CREATED` - Product execution initialized
- `WEIGHING_IN_PROGRESS` - Weighing ingredients for this product
- `WEIGHING_COMPLETED` - All ingredients weighed
- `STEP_IN_PROGRESS` - Currently executing a step
- `STEP_COMPLETED` - Step completed
- `PRODUCT_COMPLETED` - Entire product done

---

## New Models

### `ProductExecution`

**Purpose**: Tracks execution of a single product within a batch (1 of 10, 2 of 10, etc.)

**Key Fields**:

- `batchId` - Which batch this product belongs to
- `productSequence` - Product number (1, 2, 3... N)
- `status` - Current execution status
- `weighingStartedAt`, `weighingCompletedAt` - Weighing timeline
- `executionStartedAt`, `executionCompletedAt` - Execution timeline

**Important Constraint**: Unique combination of `batchId + productSequence` ensures each product in a batch is tracked separately.

**Relations**:

- `weighedBags` - All bags weighed for this product
- `executionScans` - All QR scans during execution
- `stepExecutions` - Each step execution for this product
- `finalProduct` - The final product QR after completion

---

### `StepExecution`

**Purpose**: Tracks execution of each step for each product

**Key Fields**:

- `productExecutionId` - Which product execution
- `batchStepId` - Which step in the batch
- `status` - PENDING → IN_PROGRESS → DONE
- `ingredientsAdded` - Count of ingredients added so far
- `ingredientsExpected` - Total ingredients expected in this step

**Important Constraint**: Unique combination of `productExecutionId + batchStepId` ensures one execution record per step per product.

---

## Modified Models

### `Batch`

**Added Fields**:

```prisma
// Track which steps will be executed in this batch
executeKneader Boolean @default(true)
executeMixer   Boolean @default(true)

// Single strategy parameter for both QR printing and weighing
// ONE_BY_ONE: Print 1 QR → weigh 1 ingredient → repeat
// BULK: Print all QRs upfront → then weigh ingredients flexibly
weighingStrategy String @default("ONE_BY_ONE") // ONE_BY_ONE or BULK
```

**Explanation**:

- `weighingStrategy` replaces the redundant "weighingStrategy" and "qrPrintingStrategy" parameters
- `ONE_BY_ONE`: Print QR automatically when ingredient reaches correct weight, then move to next ingredient sequentially
- `BULK`: Print all required QRs upfront, then weigh ingredients (worker can weigh them in flexible order)

**New Relation**:

- `productExecutions` - All product executions in this batch

**Workflow Context**:

- Supervisor selects recipe → enters quantity (e.g., 10)
- Optionally selects which steps to execute (both kneader & mixer, or only kneader, or only mixer)
- Optionally selects weighing strategy
- System creates batch with these configurations

---

### `BatchStep`

**Added Fields**:

```prisma
recipeStepId Int?  // Link to original recipe step for audit trail
startedAt DateTime?
completedAt DateTime?
```

**New Relation**:

- `recipeStep` - Link back to original recipe definition
- `stepExecutions` - Individual step executions for each product

---

### `BatchIngredient`

**Added Field**:

```prisma
sequenceInStep Int  // Order in which ingredient appears in the step (1st, 2nd, 3rd, etc.)
```

**Updated Relations**:

- `executionScans` - All scans for this ingredient across all product executions

---

### `WeighedBag`

**Added Fields**:

```prisma
productExecutionId Int       // Which product this bag is for
inwardQrCodeId Int?          // Traceability to source material
scannedForVerification DateTime?  // When scanned before adding to bin
addedToBinAt DateTime?            // When actually added to bin
```

**New Relations**:

- `productExecution` - Which product this bag belongs to
- `inwardQrCode` - Source material traceability

**Indexes**: Added `productExecutionId` for efficient product-level queries

---

### `ExecutionScan`

**Enhanced Fields**:

```prisma
productExecutionId Int  // Which product's execution
batchIngredientId Int   // Which ingredient being verified
sequenceInStep Int      // Order of ingredient in this step
```

**New Relations**:

- `productExecution` - Which product execution
- `batchIngredient` - Which ingredient was scanned

---

### `FinalProduct`

**Enhanced Fields**:

```prisma
productExecutionId Int  // Link to product execution
productSequence Int     // Product number in batch
binId String?           // Which bin (if applicable)
completedAt DateTime    // When product was completed
```

**New Relation**:

- `productExecution` - Back-reference to product execution

---

### `InwardQrCode`

**Added Fields**:

```prisma
consumedAt DateTime?  // When material was consumed in production
```

**New Relation**:

- `weighedBags` - All bags that used this source material

---

### `RecipeStep`

**New Relation**:

- `batchSteps` - All batch steps created from this recipe step

---

## Data Flow Diagram

### Batch Creation

```
Supervisor creates batch
├─ Select Recipe (e.g., SR001)
├─ Enter Quantity (e.g., 10 products)
├─ Select Steps to Execute (kneader + mixer? or only kneader?)
└─ Select Weighing Strategy (ONE_BY_ONE or BULK)

↓ Creates Batch record with:
- recipeId, quantity (10)
- executeKneader=true, executeMixer=true
- weighingStrategy="ONE_BY_ONE" (or "BULK")
- status=CREATED

Weighing Strategy Details:
• ONE_BY_ONE: Print QR as each ingredient reaches target weight
  └─ Sequential, strict order, automatic QR printing
• BULK: Print all QRs upfront, then weigh in flexible order
  └─ Worker has freedom in order, QRs pre-printed
```

### Product Execution Initialization

```
For each product (1 to quantity):
├─ Create ProductExecution record
│  ├─ batchId
│  ├─ productSequence (1, 2, 3... 10)
│  └─ status=CREATED
│
└─ For each recipe step being executed:
   └─ Create BatchStep (if not already created)
      └─ Create StepExecution for this product
         ├─ productExecutionId
         ├─ batchStepId
         └─ status=PENDING
```

### Weighing Phase

```
Worker selects batch to make

Option 1: SEQUENTIAL weighing (ONE_BY_ONE QR printing)
├─ Display next ingredient needed
├─ Open corresponding bin
├─ Worker weighs ingredient in bag
├─ On correct weight: QR printed automatically
├─ Bag scanned: Create WeighedBag record
├─ Move to next ingredient (same product)
└─ After all ingredients for product 1: Move to product 2

Option 2: BULK weighing (ALL QRs printed upfront)
├─ All 70 QRs printed and stuck on bags
├─ Worker scans a QR: ingredient details appear
├─ Open corresponding bin
├─ Worker weighs and marks as done
└─ Continue until all weighed
```

### Execution Phase (Adding to Bins/Mixers)

```
For each ProductExecution:
  └─ For each StepExecution:
     └─ For each ingredient in sequence:
        ├─ Display ingredient details (qty, bin, params)
        ├─ Worker scans WeighedBag QR
        ├─ Verify: ingredientId → correct ingredient?
        ├─ Create ExecutionScan record
        ├─ Bin opens automatically
        ├─ Worker adds material to bin
        ├─ Set addedToBinAt timestamp
        ├─ Update binQuantity (BinAssignment.currentQuantity)
        └─ Increment ingredientsAdded counter

     After all ingredients added:
     ├─ PLC receives parameters (temp, pressure, rpm, time)
     ├─ Process starts
     └─ Process completes → StepExecution.status = DONE

  After all steps completed:
  ├─ Generate final product QR
  ├─ Create FinalProduct record
  └─ ProductExecution.status = PRODUCT_COMPLETED

After all products completed:
└─ Generate batch completion QR
```

---

## Key Query Examples

### Get all products in a batch with their execution status

```sql
SELECT
  pe.productSequence,
  pe.status,
  COUNT(se.id) as totalSteps,
  SUM(CASE WHEN se.status = 'DONE' THEN 1 ELSE 0 END) as completedSteps
FROM ProductExecution pe
LEFT JOIN StepExecution se ON pe.id = se.productExecutionId
WHERE pe.batchId = ?
GROUP BY pe.id, pe.productSequence, pe.status
ORDER BY pe.productSequence;
```

### Get current product execution progress

```sql
SELECT
  pe.productSequence,
  se.batchStepId,
  se.ingredientsAdded,
  se.ingredientsExpected,
  COUNT(es.id) as scannedCount
FROM ProductExecution pe
JOIN StepExecution se ON pe.id = se.productExecutionId
LEFT JOIN ExecutionScan es ON se.productExecutionId = es.productExecutionId
  AND se.batchStepId = es.batchStepId
WHERE pe.batchId = ? AND pe.status != 'PRODUCT_COMPLETED'
GROUP BY pe.id, se.id
ORDER BY pe.productSequence, se.batchStepId;
```

### Trace material from inward to final product

```sql
SELECT
  iqc.qrId as source_material_qr,
  ie.materialName,
  wb.qrId as weighed_bag_qr,
  pe.productSequence,
  fp.qrId as final_product_qr
FROM InwardQrCode iqc
JOIN InwardEntry ie ON iqc.inwardId = ie.id
LEFT JOIN WeighedBag wb ON iqc.id = wb.inwardQrCodeId
LEFT JOIN ProductExecution pe ON wb.productExecutionId = pe.id
LEFT JOIN FinalProduct fp ON pe.id = fp.productExecutionId
WHERE iqc.qrId = ?;
```

---

## Migration Notes

When creating a migration for these changes:

1. Add new enums
2. Add new models (ProductExecution, StepExecution)
3. Add new fields to existing models
4. Add new relations
5. Create indexes for frequently queried fields

```bash
cd api
npx prisma migrate dev --name batch_execution_updates
```

---

## Validation Rules

1. **ProductExecution**: `productSequence` must be between 1 and `batch.quantity`
2. **StepExecution**: Only one StepExecution per (ProductExecution, BatchStep) pair
3. **WeighedBag**: `weight` must be positive
4. **BatchIngredient**: `sequenceInStep` must be unique per step
5. **Batch**: If no steps executed (`executeKneader=false && executeMixer=false`), batch cannot start

---

## Next Steps for Backend Implementation

1. **Batch Creation API**

   - Accept recipe, quantity, step selections
   - Create Batch + ProductExecutions + StepExecutions

2. **Weighing Phase API**

   - Get next ingredient to weigh
   - Record weighed bag with QR
   - Handle both SEQUENTIAL and BULK strategies

3. **Execution Phase API**

   - Scan QR during ingredient addition
   - Verify ingredient matches expected
   - Update bin quantities
   - Track step progress

4. **Completion API**

   - Generate final product QR
   - Mark batch as completed
   - Generate batch completion report

5. **Production Simulation (for testing)**
   - API endpoint to scan QRs (simulating hardware scanner)
   - API endpoint to open bins (simulating PLC)
   - Real-time status updates
