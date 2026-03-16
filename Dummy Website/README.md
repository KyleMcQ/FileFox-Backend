# FileFox Dummy Website (PoC)

This is a proof-of-concept React website for the FileFox Backend. It demonstrates how to integrate with the API, specifically focusing on JWT authentication, MFA, and client-side encryption.

## Prerequisites

- **Node.js** (v18 or later recommended)
- **NPM** (v9 or later)
- **FileFox Backend** running on `http://localhost:5147` (Default)

## Getting Started

1.  **Navigate to the directory**:
    ```bash
    cd "Dummy Website"
    ```

2.  **Install dependencies**:
    ```bash
    npm install
    ```

3.  **Run the development server**:
    ```bash
    npm run dev
    ```

4.  **Open in Browser**:
    Visit `http://localhost:5173` (or the port shown in your terminal).

## Key Features Demonstrated

- **Authentication Flow**:
  - Registration and Login using JWT.
  - Automatic Token Rotation (Access + Refresh).
  - Multi-Factor Authentication (TOTP) Setup and Login.

- **Client-Side Cryptography**:
  - **User Keys**: Generates an RSA-OAEP 2048-bit key pair on the client. The private key is encrypted with PBKDF2 (derived from user password) before being stored on the server.
  - **File Encryption**: Uses AES-GCM 256-bit for file chunks.
  - **Key Wrapping**: The unique AES key for each file is wrapped with the user's RSA public key using RSA-OAEP.

- **File Operations**:
  - **Direct Upload/Download**: Demonstrates standard multipart and streaming endpoints.
  - **Secure Chunked Upload**: Logic for splitting files, encrypting chunks, and iterative uploading via `/init`, `/chunks`, and `/complete`.
  - **Secure Download**: Logic for fetching the wrapped key, metadata, and encrypted chunks, followed by client-side decryption and assembly into a downloadable file.

## Security Note

This is a **dummy website** intended for proof-of-concept purposes.
- The `userPassword` is stored in `localStorage` for convenience during the demo to avoid re-prompting for encryption tasks. In a production app, this should be handled in memory or session state.
- Error handling is basic and intended to show API responses.
