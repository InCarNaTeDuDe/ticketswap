# TicketSwap — Indian Movie Tickets Safe Resale Platform

TicketSwap is a highly polished, interactive peer-to-peer escrow-backed ticket resale platform simulator specifically customized for Indian cinema theatre blocks. It integrates an active multi-persona sandbox simulator, high-fidelity secure transactional ledgers, live buyer-seller negotiate-and-verify chat rooms, and a dynamic admin control dashboard.

---

## 🎨 Visual Identity & Architecture

Created with **Vite**, **React 18**, **TypeScript**, and **Tailwind CSS**, the app's interfaces employ an ambient slate dark UI layout showcasing high-contrast components, micro-animations via `motion`, and standard vector icons (`lucide-react`). 

- **State Sync**: Features automatic client-side periodic polling to keep all concurrent chat rooms and listing boards dynamically synced with the server in real-time.
- **Session Restoration**: Persists custom-created users, active logged-in states, and sandbox persona bindings seamlessly using local browser cache buffers (`localStorage`) to bypass reload loss.

---

## 🔑 Authentication, Login, and Registration Flow

The platform utilizes a dynamic, local-state-backed verification layout:
1. **Interactive Form switcher**: Supports toggling between standard **Secure Credentials Verification Login** and **Instant Member Registration** tabs.
2. **Preset Quicksave Selectors**: For swift sandbox testing, includes immediate quick-login triggers for verified template personas (e.g., *Raghu* (buyer), *Maya* (seller), *Priya* (seller/admin)).
3. **Dynamic User Registration**: Generates clean, unique IDs (`user_17...`) and tags roles (buyer/seller) while auto-selecting descriptive high-quality avatars indexed from professional image pools.
4. **Session Persistence**: Stamped logins are cached through the `ticketswap_is_logged_in` cache key, maintaining structural state continuity on hard browser refreshes.
5. **Secure Signout (Logout)**: Centered conveniently on the glassmorphic header bar to immediately wipe current session keys (`localStorage.removeItem`), returning users safely to the entry credentials screen.

---

## 🗂️ Interactive Endpoints Directory (REST API reference)

### 🎬 1. Resale Listings Routing

#### `GET /api/listings`
- **Output**: Returns the array of current theater ticket listings offered on the marketplace.
- **Payload Schema**:
  ```json
  [
    {
      "id": "list_1",
      "movieName": "Jawan",
      "theatreName": "PVR Forum Mall, Bengaluru",
      "showtime": "2026-06-25T18:30:00",
      "originalPrice": 450,
      "sellingPrice": 300,
      "quantity": 2,
      "sellerId": "user_maya",
      "sellerName": "Maya Roy"
    }
  ]
  ```

#### `POST /api/listings`
- **Goal**: Register a new seat resale block onto the active feed.
- **Request Body**:
  ```json
  {
    "movieName": "Pushpa 2: The Rule",
    "theatreName": "Inox Megaplex, Mumbai",
    "showtime": "2026-06-28T21:00:00",
    "originalPrice": 600,
    "sellingPrice": 400,
    "quantity": 2,
    "sellerId": "user_171...",
    "sellerName": "John"
  }
  ```

#### `GET /api/listings/:id`
- **Output**: Returns a single listing context object.

#### `DELETE /api/listings/:id`
- **Goal**: Instantly remove/delist a resale entry.

---

### 💳 2. Wallets, Ledgers & Commission Metrics

Every user receives a virtual, statefully managed wallet inside the runtime memory.

#### `GET /api/wallets/:userId`
- **Output**: Retrieves active wallet status, balance, and transaction history cards.
- **Example Response**:
  ```json
  {
    "userId": "user_priya",
    "balance": 1500,
    "ledger": [
      {
        "id": "tx_init_1",
        "amount": 1500,
        "type": "CREDIT",
        "description": "Initial registration bonus credit",
        "userId": "user_priya",
        "timestamp": 1782200000000
      }
    ]
  }
  ```

#### `POST /api/wallets/:userId/refill`
- **Goal**: Inject mock currency (₹) to buy tickets.
- **Request Body**: `{"amount": 1000}`

#### `POST /api/wallets/:userId/withdraw`
- **Goal**: Liquidate earnings back to a private external bank structure.
- **Request Body**: `{"amount": 500}`

---

### 🛡️ 3. Safe Escrow & Reschedule Transactions

The core system supports a dual-mode transaction model designed to secure peer-to-peer handshakes.

- **CONNECT Mode** (Cheap: ₹5 platform commission fee) — Connects direct chats instantly, transferring communication credentials so peers meet on their own terms.
- **SAFE Mode** (Secure: ₹10 platform commission fee) — Locks funds inside an **Escrow Vault** securely on the backend server. Movie tickets must be digitally verified, and a secure **One-Time Passcode (OTP)** handshake must occur before funds are released.

#### `POST /api/transactions`
- **Goal**: Place buyer funds into holding state/escrow.
- **Body Context**:
  ```json
  {
    "listingId": "list_1",
    "buyerId": "user_raghu",
    "buyerName": "Raghu",
    "mode": "SAFE"
  }
  ```

#### `POST /api/transactions/:id/respond`
- **Goal**: Seller accepts or rejects the purchase invitation.
- **Body**: `{"action": "ACCEPT" | "DECLINE"}`

#### `POST /api/transactions/:id/timeout`
- **Goal**: Auto-cancel transactions exceeding safety thresholds.

#### `POST /api/transactions/:id/otp`
- **Goal**: Verifies OTC keys exchanged at physical booths or theater gates.
- **Body**:
  ```json
  {
    "otp": "4892",
    "role": "BUYER_INPUT_SELLER_OTP" | "SELLER_INPUT_BUYER_OTP",
    "userId": "user_buyer"
  }
  ```

#### `POST /api/transactions/:id/dispute`
- **Goal**: Freeze active escrow vault and raise alert flags for system admins to step in.
- **Body**: `{"reason": "Ticket screenshot has broken barcode", "userId": "...", "userName": "..."}`

#### `POST /api/transactions/:id/settle`
- **Goal**: Clean manual settlement of successful safe exchanges.

#### `POST /api/transactions/:id/cancel`
- **Goal**: Terminate transactional flow and immediately issue refunds back to the buyer ledger.

---

### 💬 4. Escrow Chat System and Chatbots

#### `GET /api/transactions/:id/messages`
- **Output**: Returns live message threads and virtual upload logs for ticket proofs.

#### `POST /api/transactions/:id/message`
- **Goal**: Send a message or upload high-resolution ticket PDFs/screenshots.
- **Body**: `{"senderId": "...", "text": "...", "attachment": "data:image/png;base64..."}`

#### `POST /api/ai/chat-reply`
- **Goal**: Generates immediate conversation responses automatically when speaking with mock characters. Powered by **Gemini models** server-side, simulating typical buyer/seller questions, bargain attempts, and dynamic verification feedback.

---

### 📊 5. Administrator Oversight Panel

#### `GET /api/admin/stats`
- **Goal**: Pull overview analytics for commissions, dispute volumes, active escrow holds, and overall listings.

#### `POST /api/admin/config`
- **Goal**: Tune platform fee rules, automated simulation check velocities, and safety parameters.

#### `POST /api/admin/resolve-dispute`
- **Goal**: Resolve conflicting trade reports manually. Escrowed amounts are arbitrated cleanly.
- **Body**: `{"transactionId": "...", "decision": "REFUND_BUYER" | "RELEASE_TO_SELLER"}`

---

## 🛠️ Maintenance & Dev Server Config

- To start the development node environment natively:
  ```bash
  npm run dev
  ```
- To build the application into production-ready compiled code:
  ```bash
  npm run build
  ```
- To run static type checks and code quality lints:
  ```bash
  npm run lint
  ```
