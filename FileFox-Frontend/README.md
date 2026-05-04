# FileFox-Frontend

A secure file storage and sharing mobile application built with **React Native** and **Expo**.

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (LTS)
- [Expo Go](https://expo.dev/client) app on your iOS/Android device OR an emulator/simulator.

### Installation

1. Navigate to the frontend directory:
   ```bash
   cd FileFox-Frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npx expo start
   ```

4. Scan the QR code with your device or press `i` for iOS simulator or `a` for Android emulator.

## ⚙️ Configuration

### API Endpoint

To point the application to your backend, modify the `baseURL` in `src/api/apiClient.ts`:

```typescript
const api = axios.create({
  baseURL: "https://localhost:7227", // Default API URL
});
```

> **Note for Mobile Devices:** `localhost` refers to the phone itself. If you are running the app on a physical device, you must use your computer's local IP address (e.g., `http://192.168.1.5:7227`) and ensure the backend is listening on all interfaces.

## 🔒 Security & Encryption

FileFox-Frontend implements robust end-to-end encryption to ensure your data remains private.

### Encryption Flow

1.  **User Keys**: Upon registration, an **RSA-OAEP 2048** key pair is generated. The private key is encrypted using **AES-256-GCM** with a key derived from your password via **PBKDF2** (100,000 iterations) before being stored on the server.
2.  **File Encryption**: When you perform a "Secure Upload", a unique **AES-256** key is generated for that file.
3.  **Key Wrapping**: The file key is wrapped (encrypted) with your RSA public key.
4.  **Chunked Storage**: The file is split into 1MB chunks, and each chunk is encrypted with the file key using AES-GCM. Each chunk is stored with its own unique IV.
5.  **Secure Download**: During download, your private key is decrypted using your password, then used to unwrap the file key, which finally decrypts each chunk for reassembly.

## 🎨 Styling

The application uses a consistent "Peach/Orange" theme:
- **Background**: `#FFE7D1`
- **Primary Action**: `#FF8C42`
- **Text**: `#333333`

All screens have been standardized to adhere to this visual identity.

## 🛠️ Tech Stack

- **Framework**: Expo / React Native
- **Navigation**: Expo Router
- **Cryptography**: node-forge
- **HTTP Client**: Axios
- **Persistence**: Expo SecureStore
