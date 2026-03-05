# QR Scanning Debug Guide

## Console Logs Added ✅

### Frontend Logs (Browser Console - F12)

```
========== 🔍 QR SCAN INITIATED ==========
📱 QR Input Value: INW-00001-0001
📦 Outward ID: 5
⏱️  Timestamp: 2026-02-07T14:30:00.000Z

📝 Input changed: I
📝 Input length: 1
📝 Input changed: IN
📝 Input length: 2
...

🔑 KEY PRESSED: Enter
⏎ ENTER key detected - triggering scan

📤 API Request Payload: { outwardId: 5, qrId: 'INW-00001-0001' }

📨 API Response Received: {
  message: "QR INW-00001-0001 scanned successfully",
  scannedBags: 1,
  totalBags: 5,
  status: "Pending"
}

✅ Scan Successful - Bags: 1/5, Status: Pending

🏁 Scan operation completed
========== END QR SCAN ==========
```

### Backend Logs (Terminal - npm run start:dev)

```
========== 📱 QR SCAN REQUEST RECEIVED ==========
🔍 Scanning QR: INW-00001-0001
📦 For Outward ID: 5
⏱️  Backend Timestamp: 2026-02-07T14:30:00.123Z

🔎 Looking up outward entry...
✅ Outward found: { id: 5, materialName: 'Rubber' }

🔎 Looking up QR code...
✅ QR found: { qrId: 'INW-00001-0001', state: 'CREATED', inwardId: 1 }

🔍 Validating QR state...
✅ Material match verified: Rubber

🔄 Updating QR state to ISSUED...
✅ QR state updated to ISSUED

🔢 Counting scanned bags...
📊 Scan count: 1/5

🔄 Updating outward status to: Pending

✅ Outward updated successfully
========== END QR SCAN ==========
```

## Testing Steps

### 1. **Check Input Capture**

- Open browser DevTools (F12)
- Go to **Console** tab
- Open outward page, click QR scan button
- Type a QR ID manually
- **Look for:** `📝 Input changed: INW-00001-0001`

**If NOT appearing:**

- ❌ Input field is not capturing keystrokes
- Check if modal is actually open
- Check if input has focus (autoFocus should work)

### 2. **Check API Call**

- Type QR ID
- Press **Enter**
- **Look for:** `📤 API Request Payload:`

**If NOT appearing:**

- ❌ handleScan() not triggering
- Check if Enter key detection works: `🔑 KEY PRESSED: Enter`
- Check if input validation passes: `✅ QR input validation passed`

### 3. **Check API Response**

- After API Request appears
- **Look for:** `📨 API Response Received:`

**If NOT appearing:**

- ❌ API call failed or didn't reach backend
- Check **Network** tab for failed request
- Status should be 200-299 for success
- Status 4xx = error on your side
- Status 5xx = backend error

### 4. **Check Backend Processing**

- Open terminal running backend (npm run start:dev)
- Scan QR in frontend
- **Look for:** `========== 📱 QR SCAN REQUEST RECEIVED ==========`

**If NOT appearing:**

- ❌ Request never reached backend
- Check API URL is correct: `/outward/scan-qr`
- Check backend is running (should see "Listening on port 3000")

### 5. **Check Database Update**

- Open Prisma Studio: `npx prisma studio`
- Go to **InwardQrCode** table
- Find your QR ID
- Check the `state` column:
  - **Before scan:** `CREATED`
  - **After scan:** `ISSUED`

**If NOT changed:**

- ❌ Database transaction failed
- Check backend terminal for errors
- Check if outwardId in request matches real outward entry

### 6. **Check Frontend Update**

- After successful scan
- **Look for:** `✅ Scan Successful - Bags: 1/5, Status: Pending`
- Modal should update progress bar
- Toast notification should appear

**If NOT appearing:**

- ❌ Response processing failed
- Check for errors: `❌ API CALL FAILED:`
- Look at error details in console

## Error Scenarios to Test

### QR Not Found

```
❌ API CALL FAILED: ...
Error Details: { status: 400, data: { message: 'Invalid QR code - no such bag exists' } }
```

### QR Already Scanned

```
Error Details: { status: 400, data: { message: 'This bag is already scanned for outward dispatch' } }
```

### Material Mismatch

```
Error Details: { status: 400, data: { message: 'This QR belongs to Material X, but this outward is for Material Y' } }
```

## Debug Checklist

| Step                | Frontend Log                | Backend Log                     | Expected |
| ------------------- | --------------------------- | ------------------------------- | -------- |
| 1. Input captured   | `📝 Input changed:`         | -                               | ✅       |
| 2. Key pressed      | `🔑 KEY PRESSED: Enter`     | -                               | ✅       |
| 3. API sent         | `📤 API Request Payload:`   | -                               | ✅       |
| 4. Backend received | -                           | `🔍 Scanning QR:`               | ✅       |
| 5. QR found         | -                           | `✅ QR found:`                  | ✅       |
| 6. State valid      | -                           | `🔍 Validating QR state...`     | ✅       |
| 7. Material match   | -                           | `✅ Material match verified:`   | ✅       |
| 8. Updated DB       | -                           | `✅ QR state updated to ISSUED` | ✅       |
| 9. Response sent    | `📨 API Response Received:` | -                               | ✅       |
| 10. UI updated      | `✅ Scan Successful -`      | -                               | ✅       |

## Real-time Monitoring

Open 3 windows:

1. **Browser DevTools** (F12 → Console)
2. **Backend Terminal** (npm run start:dev)
3. **Prisma Studio** (http://localhost:5555)

Then scan a QR and watch all three update in real-time!
