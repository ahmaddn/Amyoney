# Amyoney 🌿

> **Intelligent Personal Finance & Budgeting Assistant**  
> A mobile-first, cross-platform financial companion built with Expo, React Native, TypeScript, and Firebase. Amyoney combines mindful budgeting, smart receipt scanning, and seamless offline-first capability with a modern fintech aesthetic.

---

## 🌟 Key Features

### 1. 📊 Holistic Overview & Dynamic Net Worth Tracking
- **Real-Time Cash Flow**: Live summary of total net balance, monthly income, monthly expenses, and net savings rate.
- **Spending Pacing Engine**: Intelligent calculations that analyze month-to-date spending vs. daily safe spending limits to prevent budget overdrafts.
- **Account & Multi-Wallet Support**: Manage Cash, Bank accounts, and E-Wallets with instant transfer and mutation logs.

### 2. 🧾 Smart Receipt Scanner (OCR)
- **Automatic Receipt Parsing**: Capture a photo with your device camera or upload a receipt from your photo library.
- **Intelligent Field Extraction**: Automatically extracts the transaction total, date, merchant note, and matches the expense category in seconds.

### 3. 🎯 Envelope Budgeting & Expense Caps
- **Category-Based Budgets**: Allocate explicit monthly ceilings for groceries, dining, utilities, entertainment, and more.
- **Visual Progress Trackers**: Precision 4px progress indicators with color transitions alerting you before you exceed spending limits.
- **Smart Recalibration**: Allocate budgets using exact nominal currency or a percentage of your total monthly income.

### 4. 💰 Goal Savings & Debt Management (Receivables/Payables)
- **Dream Goals**: Create customizable financial targets with percentage progress bars and deadline tracking.
- **Debt & Loan Ledger**: Log money borrowed or lent with contact names, due dates, settlement logs, and repayment status badges.

### 5. 🎨 Bespoke Theme Presets & Instant Currency Conversion
- **Curated Fintech Color Palettes**:
  - 🌲 **Emerald Forest**: Deep pine green accented with vibrant lime.
  - 💎 **Royal Sapphire**: Classic navy blue paired with sky accents.
  - 🌑 **Midnight Obsidian**: Sleek graphite black with gold amber accents.
  - 🧱 **Nordic Terracotta**: Warm earthy terracotta and burnt orange tones.
- **Dynamic Favicon & System Bar Synchronization**: Browser tabs and mobile status bars dynamically mirror the active theme preset and logo base64 favicon.
- **Multi-Currency Support**: Real-time reactive formatting across IDR (Rp), USD ($), EUR (€), SGD (S$), and JPY (¥).

### 6. ☁️ Real-time Cloud Firestore & Offline-First Mode
- **Guest Mode (Offline SQLite)**: Full-featured local operation without requiring an account.
- **Cloud Firestore Synchronization**: Instant bidirectional sync when signed in with Firebase Authentication.
- **Smart Reconnection Prompt**: Automatically detects network transitions from offline to online and prompts the user to sync pending changes.

### 7. 🔔 Notifications & Crystal Feedback
- **Daily Budgeting Reminders**: Configurable local notifications scheduled at 20:00 to keep you accountable.
- **Crystal Audio Confirmation**: Haptic and harmonic sound cues on successful transaction entries.

---

## 🛠️ Technology Stack

- **Framework**: Expo SDK 54 / React Native (Continuous Native Generation)
- **Routing**: Expo Router (File-based navigation)
- **State & Theme**: React Context API with dynamic tokens
- **Database & Sync**:
  - Local: SQLite (`expo-sqlite`) & Web Local Storage fallback
  - Cloud: Firebase Authentication & Google Cloud Firestore
- **Animations**: `react-native-reanimated` & `expo-symbols` / `@expo/vector-icons`
- **OCR Engine**: Tesseract.js / Client-side pattern recognition

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18 or higher recommended)
- `npm` or `bun`

### Installation
```bash
# 1. Clone the repository
git clone https://github.com/your-username/Amyoney.git
cd Amyoney

# 2. Install dependencies
npm install

# 3. Start Expo development server
npx expo start
```

Press `w` in the terminal to launch the web client, or scan the QR code with Expo Go / a Development Build on your Android or iOS device.

---

## 🔐 Firebase Authentication & Google Sign-In Setup

If you encounter `Firebase: Error (auth/unauthorized-domain)` when attempting to sign in with Google or email on the web, follow these steps:

1. Open the [Firebase Console](https://console.firebase.google.com/).
2. Select your project: **`amyoney-app`**.
3. In the left sidebar, navigate to **Build** → **Authentication**.
4. Click on the **Settings** tab at the top.
5. In the **Authorized domains** list, click **Add domain**.
6. Add the following hostnames:
   - `localhost`
   - `127.0.0.1`
   - *(Optional)* Any custom domain or IP address you use during development (e.g. `192.168.x.x`).
7. Save your settings and refresh the application page.

---

## 📋 Available Scripts

| Command | Purpose |
| :--- | :--- |
| `npx expo start` | Starts the Metro bundler dev server |
| `npx tsc --noEmit` | Runs full TypeScript static typecheck |
| `npx eslint .` | Runs ESLint analysis across codebase |
| `npx expo-doctor` | Validates dependencies and Expo SDK compatibility |

---

## 📝 License
This project is licensed under the [MIT License](LICENSE).
