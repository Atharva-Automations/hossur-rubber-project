# Database Schema - Execution Process Visualization

## Entity Relationship Overview

```
┌──────────────────────────────────────────────────────────────────────┐
│                         BATCH CREATION                               │
├──────────────────────────────────────────────────────────────────────┤
│  Supervisor selects:                                                 │
│  • Recipe (SR001, SR002, etc.)                                       │
│  • Quantity (5, 10, 25 products)                                     │
│  • Steps to execute (Kneader, Mixer, or both)                        │
│  • Weighing Strategy (ONE_BY_ONE or BULK)                            │
│                                                                      │
│  ↓ Creates: Batch (status=CREATED)                                   │
│             ├─ recipeId, quantity=10                                 │
│             ├─ executeKneader=true, executeMixer=true                │
│             └─ weighingStrategy="ONE_BY_ONE"                         │
└──────────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────────┐
│                    BATCH STRUCTURE                                   │
├──────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  Batch (quantity=10)                                                 │
│  │                                                                   │
│  ├─ BatchStep 1 (Kneader, seq=1)                                     │
│  │  ├─ BatchIngredient 1 (Polymer, qty=10kg, seq=1)                  │
│  │  ├─ BatchIngredient 2 (Filler, qty=5kg, seq=2)                    │
│  │  └─ BatchIngredient 3 (Activator, qty=2kg, seq=3)                 │
│  │                                                                   │
│  ├─ BatchStep 2 (Kneader, seq=2)                                     │
│  │  └─ BatchIngredient 4 (Curing, qty=1kg, seq=1)                    │
│  │                                                                   │
│  ├─ BatchStep 3 (Mixer, seq=1)                                       │
│  │  └─ BatchIngredient 5 (Pigment, qty=0.5kg, seq=1)                 │
│  │                                                                   │
│  └─ BatchStep 4 (Mixer, seq=2)                                       │
│     └─ BatchIngredient 6 (ProcessAid, qty=0.3kg, seq=1)              │
│                                                                      │
│  TOTAL INGREDIENTS NEEDED PER PRODUCT = 6                            │
│  TOTAL INGREDIENTS FOR 10 PRODUCTS = 60                              │
│                                                                      │
└──────────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────────┐
│              PRODUCT EXECUTION STRUCTURE                             │
├──────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  ProductExecution[1]  ProductExecution[2]  ...  ProductExecution[10] │
│  (Product 1 of 10)    (Product 2 of 10)           (Product 10 of 10) │
│  │                    │                            │                 │
│  ├─StepExecution[1]   ├─StepExecution[1]          ├─StepExecution[1]│
│  │ (Kneader 1)        │ (Kneader 1)               │ (Kneader 1)      │
│  │ status=DONE        │ status=IN_PROGRESS        │ status=PENDING   │
│  │ ingredientsAdded=3 │ ingredientsAdded=2        │ ingredientsAdded=0
│  │                    │                            │                 │
│  ├─StepExecution[2]   ├─StepExecution[2]          └─...              │
│  │ (Kneader 2)        │ (Kneader 2)                                  │
│  │ status=DONE        │ status=PENDING                               │
│  │                    │                                              │
│  ├─StepExecution[3]   └─...                                          │
│  │ (Mixer 1)                                                         │
│  │ status=PENDING                                                    │
│  │                                                                   │
│  ├─StepExecution[4]                                                  │
│  │ (Mixer 2)                                                         │
│  │ status=PENDING                                                    │
│  │                                                                   │
│  └─FinalProduct[1]                                                   │
│    QR: PROD-BATCH001-001                                             │
│    completedAt: 2025-11-20 10:30:00                                  │
│                                                                      │
└──────────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────────┐
│                WEIGHING PHASE (Product 1)                            │
├──────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  ONE_BY_ONE weighing (QR printed as weight is reached):              │
│                                                                      │
│  Step 1, Ingredient 1 (Polymer, 10kg)                                │
│  ├─ Screen shows: "Weigh Polymer 10kg, Bin#: BIN-001"                │
│  ├─ Bin BIN-001 opens automatically                                  │
│  ├─ Worker takes material, weighs on machine                         │
│  ├─ Weight reaches 10kg → QR PRINTED automatically                   │
│  ├─ Worker sticks QR on bag                                          │
│  ├─ Worker scans QR                                                  │
│  └─ Create: WeighedBag                                               │
│     ├─ qrId: WB-BATCH001-P1-001                                      │
│     ├─ productExecutionId: 1                                         │
│     ├─ batchStepId: 1, batchIngredientId: 1                          │
│     ├─ weight: 10.0 kg                                               │
│     ├─ inwardQrCodeId: 42 (traced to source)                         │
│     └─ status: CREATED → SCANNED                                     │
│                                                                      │
│  Step 1, Ingredient 2 (Filler, 5kg)                                  │
│  ├─ Screen shows: "Weigh Filler 5kg, Bin#: BIN-002"                  │
│  ├─ Bin BIN-002 opens automatically                                  │
│  ├─ Worker weighs... QR printed → sticks → scans                     │
│  └─ Create: WeighedBag (for ingredient 2)                            │
│                                                                      │
│  Step 1, Ingredient 3 (Activator, 2kg)                               │
│  ├─ Screen shows: "Weigh Activator 2kg, Bin#: BIN-003"               │
│  ├─ Bin BIN-003 opens                                                │
│  ├─ Worker weighs... QR printed → sticks → scans                     │
│  └─ Create: WeighedBag (for ingredient 3)                            │
│                                                                      │
│  AFTER ALL INGREDIENTS WEIGHED FOR PRODUCT 1:                        │
│  └─ ProductExecution[1].status = WEIGHING_COMPLETED                  │
│     WeighedBags created for this product:                            │
│     ├─ WB-BATCH001-P1-001 (Polymer)                                  │
│     ├─ WB-BATCH001-P1-002 (Filler)                                   │
│     ├─ WB-BATCH001-P1-003 (Activator)                                │
│     └─ (+ same for remaining steps)                                  │
│                                                                      │
│  MOVE TO PRODUCT 2:                                                  │
│  └─ Repeat weighing for ProductExecution[2]                          │
│                                                                      │
│  ═══════════════════════════════════════════════════════════════     │
│                                                                      │
│  BULK weighing (All QRs printed upfront):                            │
│                                                                      │
│  Step 1: Print all 60 QRs (10 products × 6 ingredients)              │
│  ├─ All 60 labeled bags ready                                        │
│  │                                                                   │
│  ├─ Worker scans any QR: WB-BATCH001-P1-001                          │
│  ├─ Screen: "Weigh Polymer (10kg), Bin#: BIN-001"                    │
│  ├─ Bin BIN-001 opens                                                │
│  ├─ Worker weighs and marks as done                                  │
│  ├─ Create: WeighedBag (inwardQrCodeId tracked)                      │
│  │                                                                   │
│  ├─ Scans next QR: WB-BATCH001-P1-002                                │
│  ├─ Screen: "Weigh Filler (5kg), Bin#: BIN-002"                      │
│  ├─ Bin BIN-002 opens → Worker weighs → marked done                  │
│  │                                                                   │
│  ├─ Continue until all 60 bags weighed (in any order worker chooses) │
│  │                                                                   │
│  └─ More flexible workflow: worker can jump between ingredients      │
│                                                                      │
└──────────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────────┐
│              EXECUTION PHASE (Product 1, Step 1)                     │
├──────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  StepExecution[1] (Kneader Step 1 for Product 1)                     │
│  status: PENDING → IN_PROGRESS → DONE                                │
│                                                                      │
│  Step Details Shown:                                                 │
│  ├─ Step Type: KNEADER                                               │
│  ├─ Sequence: 1 of 4 kneader steps                                   │
│  ├─ Parameters: Temp=80°C, Pressure=5bar, RPM=50, Time=300sec        │
│  └─ Ingredients (in sequence):                                       │
│     ├─ 1. Polymer (10kg) - Bin#: BIN-001                             │
│     ├─ 2. Filler (5kg) - Bin#: BIN-002                               │
│     └─ 3. Activator (2kg) - Bin#: BIN-003                            │
│                                                                      │
│  Execution Flow:                                                     │
│                                                                      │
│  Ingredient 1 - POLYMER:                                             │
│  ├─ Screen: "Add Polymer (10kg) to KNEADER"                          │
│  ├─ Worker scans WeighedBag QR: WB-BATCH001-P1-001                   │
│  ├─ System verifies:                                                 │
│  │  ├─ ✓ Correct Ingredient? (Polymer == Polymer)                    │
│  │  ├─ ✓ Correct Quantity? (10kg)                                    │
│  │  └─ ✓ Correct Sequence? (1st of 3 in step)                        │
│  ├─ Create: ExecutionScan                                            │
│  │  ├─ qrId: WB-BATCH001-P1-001                                      │
│  │  ├─ productExecutionId: 1                                         │
│  │  ├─ batchStepId: 1                                                │
│  │  ├─ batchIngredientId: 1 (Polymer)                                │
│  │  ├─ sequenceInStep: 1                                             │
│  │  └─ scannedAt: 2025-11-20 10:05:00                                │
│  ├─ Bin BIN-001 OPENS (PLC command from software)                    │
│  ├─ Worker takes bag, adds to KNEADER bin                            │
│  ├─ Set WeighedBag.addedToBinAt = now()                              │
│  ├─ Update: BinAssignment[1].currentQuantity += 10kg                 │
│  ├─ Update: StepExecution[1].ingredientsAdded = 1                    │
│  └─ Next ingredient...                                               │
│                                                                      │
│  Ingredient 2 - FILLER:                                              │
│  ├─ Screen: "Add Filler (5kg) to KNEADER"                            │
│  ├─ Worker scans: WB-BATCH001-P1-002                                 │
│  ├─ System verifies → ExecutionScan recorded                         │
│  ├─ Bin BIN-002 opens → Worker adds to KNEADER                       │
│  ├─ Update: BinAssignment[2].currentQuantity += 5kg                  │
│  ├─ Update: StepExecution[1].ingredientsAdded = 2                    │
│  └─ Next ingredient...                                               │
│                                                                      │
│  Ingredient 3 - ACTIVATOR:                                           │
│  ├─ Screen: "Add Activator (2kg) to KNEADER"                         │
│  ├─ Worker scans: WB-BATCH001-P1-003                                 │
│  ├─ System verifies → ExecutionScan recorded                         │
│  ├─ Bin BIN-003 opens → Worker adds to KNEADER                       │
│  ├─ Update: BinAssignment[3].currentQuantity += 2kg                  │
│  └─ Update: StepExecution[1].ingredientsAdded = 3                    │
│                                                                      │
│  ALL INGREDIENTS ADDED:                                              │
│  ├─ StepExecution[1].ingredientsAdded (3) == ingredientsExpected (3) │
│  ├─ Software sends PLC: Parameters (80°C, 5bar, 50RPM, 300sec)       │
│  ├─ PLC starts KNEADER process                                       │
│  ├─ Process runs for 300 seconds                                     │
│  ├─ After completion: StepExecution[1].status = DONE                 │
│  └─ MOVE TO NEXT STEP (ProductExecution[1], StepExecution[2])        │
│                                                                      │
└──────────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────────┐
│           PRODUCT COMPLETION & BATCH COMPLETION                      │
├──────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  After all steps for Product 1 completed:                            │
│  ├─ StepExecution[4].status = DONE                                   │
│  ├─ ProductExecution[1].executionCompletedAt = now()                 │
│  ├─ ProductExecution[1].status = PRODUCT_COMPLETED                   │
│  ├─ Generate final product QR                                        │
│  └─ Create: FinalProduct                                             │
│     ├─ batchId: 1                                                    │
│     ├─ productExecutionId: 1                                         │
│     ├─ productSequence: 1                                            │
│     ├─ qrId: PROD-BATCH001-001                                       │
│     ├─ binId: "BIN-001" (where final product is)                     │
│     └─ completedAt: 2025-11-20 10:45:00                              │
│                                                                      │
│  Worker sticks final product QR on rubber batch                      │
│                                                                      │
│  ═══════════════════════════════════════════════════════════════     │
│                                                                      │
│  MOVE TO PRODUCT 2, 3, ... 10 (Repeat entire process)                │
│                                                                      │
│  ═══════════════════════════════════════════════════════════════     │
│                                                                      │
│  After all 10 products completed:                                    │
│  ├─ ALL ProductExecutions have status = PRODUCT_COMPLETED            │
│  ├─ Batch.status = COMPLETED                                         │
│  ├─ Generate batch completion QR                                     │
│  ├─ Create batch report with:                                        │
│  │  ├─ Total products: 10                                            │
│  │  ├─ Completed: 10                                                 │
│  │  ├─ Total execution time                                          │
│  │  ├─ All final product QRs: PROD-BATCH001-001 to ...010            │
│  │  ├─ Material consumption report                                   │
│  │  ├─ Step execution details                                        │
│  │  └─ All ExecutionScans (QR verification trail)                    │
│  └─ Batch marked as ready for dispatch                               │
│                                                                      │
└──────────────────────────────────────────────────────────────────────┘
```

---

## Traceability Chain Example

```
INWARD MATERIAL → OUTWARD → PRODUCTION WEIGHING → EXECUTION → FINAL PRODUCT
│                 │         │                     │            │
└─InwardEntry     └─Out     └─WeighedBag         └─Execution  └─Final
  materialName     ward      qrId                 Scan         Product
  "ABC Material"   Entry     "WB-BATCH001-P1-001" qrId         qrId
  quantity=100kg   quantity  weight=10kg          "WB-..."     "PROD-..."
  bagWeight=10kg   20kg      productExecution=1   scanned=...  sequence=1
  │                issued    inwardQrCode=42                   binId=BIN-001
  │                          (points back to)                  completedAt=...
  └─InwardQrCode
    qrId="INV-MAT-001"  (Bag #1 from inward)
    state: CREATED → ISSUED → CONSUMED
    scannedAtOutward=...
    scannedAtProduction=...
    consumedAt=...
    ↓
    (TRACEABILITY: Original bag → weighed bag → execution scan → final product)
```

---

## Key Statistics Dashboard

### For a Batch of 10 Products with Recipe Having 6 Ingredients per Product

```
WEIGHING PHASE:
  Total bags to weigh: 10 products × 6 ingredients = 60 bags
  QRs to generate: 60 (each bag gets a unique QR)
  WeighedBag records: 60

  Timeline (SEQUENTIAL):
    - Product 1: 6 bags weighed (5-10 mins)
    - Product 2: 6 bags weighed (5-10 mins)
    - ... continue for all 10
    - Total: ~60-100 mins for weighing phase

EXECUTION PHASE:
  ProductExecution records: 10
  StepExecution records: 10 × 4 steps = 40
  ExecutionScans records: 60 (one per ingredient)
  Final product QRs: 10

TRACEABILITY:
  - Each final product can be traced to:
    • All weighed bags used (60 bags)
    • All material sources (InwardQrCode references)
    • All verification scans (ExecutionScans)
    • Exact execution timeline
    • Parameters applied (temp, pressure, RPM, time)
```

---

## Status Transitions

### Batch Status

```
CREATED → WEIGHING → EXECUTING → COMPLETED
```

### ProductExecution Status

s

```
CREATED
  ↓
WEIGHING_IN_PROGRESS (when first ingredient weighed)
  ↓
WEIGHING_COMPLETED (when all ingredients weighed)
  ↓
STEP_IN_PROGRESS (when first ingredient added to mixer)
  ↓
STEP_COMPLETED (when step finished)
  ↓ (repeat for each step)
  ↓
PRODUCT_COMPLETED (when final step done)
```

### StepExecution Status

```
PENDING → IN_PROGRESS → DONE
```

### WeighedBag Status

```
CREATED → SCANNED → CONSUMED
```

### QrState (InwardQrCode)

```
CREATED (after inward, in inventory)
  ↓
ISSUED (scanned at outward, leaving inventory)
  ↓
CONSUMED (scanned at production, added to bin)
```

---

## Important Constraints

1. **One product at a time**: Must complete all ingredients for Product 1 before weighing Product 2
2. **One step at a time per product**: Must complete Step 1 for Product 1 before starting Step 2
3. **Sequential ingredient addition**: Must add ingredients in sequence order within a step
4. **QR verification**: Every ingredient must be scanned before being added to bin
5. **Unique product sequence**: Each batch cannot have duplicate product sequence numbers
6. **Unique step execution**: Each product can have only one execution per step
