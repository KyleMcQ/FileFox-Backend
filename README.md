# FileFox Backend

FileFox is a secure, client-side encrypted file storage service. This repository contains the backend API built with .NET 8, designed to handle encrypted file chunks and metadata while ensuring that the server never has access to the plaintext content of the files.

## Features

- **Client-Side Encryption:** Files are encrypted on the client before being uploaded. The backend only stores ciphertext and encrypted metadata.
- **Chunked Uploads:** Supports uploading large files in smaller, manageable chunks.
- **JWT Authentication:** Secure access to API endpoints using JSON Web Tokens with support for refresh tokens and token rotation.
- **Multi-Factor Authentication (MFA):** Enhanced security with TOTP-based MFA.
- **Secure Key Management:** Users can register and manage their public/private key pairs for secure file sharing and recovery.
- **Audit Logging:** Tracks important actions and security events.

## Architecture

The project follows a clean architecture approach:

- **Core:** Contains domain models and interfaces.
- **Infrastructure:** Implements persistence (EF Core, SQL Server), external services (Local Blob Storage), and cross-cutting concerns (Authorization, Middleware, Extensions).
- **Controllers:** Exposes the API endpoints.

## API Usage

### Authentication

- `POST /auth/register`: Register a new user.
- `POST /auth/login`: Initial login step. Returns an MFA token if MFA is enabled.
- `POST /auth/login/mfa`: Second login step for MFA-enabled users.
- `POST /auth/refresh`: Refresh an expired access token using a refresh token.

### File Management

- `POST /files/init`: Initialize a chunked upload.
- `PUT /files/{id}/chunks/{index}`: Upload a file chunk.
- `POST /files/{id}/complete`: Finalize a chunked upload.
- `POST /files/upload`: Direct upload of a single file blob.

### Key Management

- `POST /keys/register`: Register a new user key pair.
- `GET /keys/me`: Retrieve the current user's active key pair.
- `GET /keys/public/{userId}`: Get a user's public key.

## Getting Started

### Prerequisites

- .NET 8 SDK
- SQL Server (LocalDB)

### Setup

1. Clone the repository.
2. Update the connection string in `appsettings.json` if necessary.
3. Apply database migrations:
   ```bash
   dotnet ef database update
   ```
4. Run the application:
   ```bash
   dotnet run
   ```

## Testing

Run the unit tests using the following command:
```bash
dotnet test
```
