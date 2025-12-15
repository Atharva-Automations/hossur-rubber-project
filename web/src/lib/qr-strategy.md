// src/lib/qr-strategy.md

# QR Code Strategy - Independent QR Generation

## Overview

Each QR code is **independent and unique** to its lifecycle stage. There is NO relationship between inward QRs and production weighing QRs.

## QR Code Lifecycle

### Stage 1: INWARD QR (Incoming Materials)

- **Generated**: When material enters warehouse during inward process
- **Format**: `INV-[BATCH_ID]-[BAG_NO]` e.g., `INV-MAT-001-01`
- **Stored On**: Physical bag label
- **Lifespan**: From warehouse entry to production scan (outward)
- **Status Flow**: CREATED → ISSUED → CONSUMED
- **After Use**: Bag is discarded, QR is no longer used

### Stage 2: WEIGHING BAG QR (Production Preparation)

- **Generated**: During batch weighing phase at production
- **Independent**: BRAND NEW QR, no link to inward QR
- **Format**: `WB-[BATCH_ID]-[PRODUCT_NO]-[INGREDIENT_NO]` e.g., `WB-BATCH001-P01-001`
- **Stored On**: New label stuck during weighing
- **Lifespan**: From weighing through execution
- **Status Flow**: CREATED → SCANNED → CONSUMED
- **Triggers**:
  - ONE_BY_ONE: Generated when weight reaches target
  - BULK: Generated upfront before weighing starts
- **Contains Info**: Product sequence, ingredient, quantity

### Stage 3: FINAL PRODUCT QR (After Processing)

- **Generated**: When product completes all steps
- **Format**: `PROD-[BATCH_ID]-[PRODUCT_SEQUENCE]` e.g., `PROD-BATCH001-001`
- **Stored On**: Final rubber product label
- **Contains Info**: Batch ID, product number, completion timestamp

### Stage 4: BATCH COMPLETION QR (Batch Summary)

- **Generated**: When entire batch is completed
- **Format**: `BATCH-[BATCH_ID]-COMPLETE` e.g., `BATCH-BATCH001-COMPLETE`
- **Contains Info**: Batch ID, all final product QRs, timestamp

## Data Model Impact

### InwardQrCode

```
- qrId: INV-MAT-001-01 (INWARD ONLY)
- state: CREATED → ISSUED → CONSUMED
- scannedAtOutward: DateTime when taken from inventory
- consumedAt: DateTime when added to bin
- NO relation to WeighedBag
```

### WeighedBag

```
- qrId: WB-BATCH001-P01-001 (WEIGHING ONLY - NEW/INDEPENDENT)
- productExecutionId: Links to specific product in batch
- batchStepId, batchIngredientId: Links to what's being weighed
- NO inwardQrCodeId field (removed the traceability link)
- inwardQrCode: DO NOT USE
```

### ExecutionScan

```
- qrId: WB-BATCH001-P01-001 (Scanning WeighedBag QR)
- Verifies: Correct ingredient at correct sequence
- Updates: Bin quantities, step progress
```

### FinalProduct

```
- qrId: PROD-BATCH001-001 (FINAL ONLY - NEW)
- productExecutionId, batchId
- No link to any prior QRs
```

## Why Independent QRs?

1. **Physical Reality**: Inward bags are thrown away after outward scan
2. **Traceability**: Production QRs are the authoritative record for execution
3. **Flexibility**: Material source doesn't need to be tracked through production
4. **Simplicity**: Each QR only tracks its own lifecycle
5. **Compliance**: Each stage has independent verification and scanning

## Traceability Alternative

If material source traceability is needed later:

- Store relationship at OUTWARD stage: `OutwardEntry → InwardQrCode mapping`
- When production batch is created: `Batch → OutwardEntries → InwardQrCodes`
- Production doesn't need to know material source directly

## Implementation Notes

✅ Keep `InwardQrCode` model as-is
✅ WeighedBag gets brand new QR generation
✅ Remove `inwardQrCodeId` from WeighedBag if it exists
✅ Each QR is independent, no foreign keys between QR types
✅ Traceability is through entity relationships, not QR relationships
