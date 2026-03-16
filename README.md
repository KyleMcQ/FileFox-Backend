# FileFox-Backend

FileFox-Backend is a secure, client-side encrypted file storage API. All files are encrypted before they reach the server, ensuring maximum privacy.

## How to Test Using Swagger UI

Follow these steps to test the API flow from registration to file retrieval.

### 1. Register a New User
1. Open the Swagger UI (usually at `https://localhost:5026/swagger/index.html` in development).
2. Locate the **`POST /auth/register`** endpoint.
3. Click **"Try it out"**.
4. Enter a JSON body with `userName`, `email`, and `password`.
5. Click **"Execute"**.
6. On success, you will receive a `201 Created` response containing your initial JWT token.

### 2. Login
If you already have an account:
1. Locate the **`POST /auth/login`** endpoint.
2. Click **"Try it out"**.
3. Enter your `email` and `password`.
4. Click **"Execute"**.
5. Copy the `accessToken` from the response body.

### 3. Authorize Swagger UI
1. Scroll to the top of the Swagger page and click the **"Authorize"** button (padlock icon).
2. In the **"Value"** text box, paste the `accessToken` you copied.
3. Click **"Authorize"** and then **"Close"**.
   - *Note: You do NOT need to type "Bearer " anymore; the UI handles it for you.*

### 4. Upload a File

#### Option A: Direct Upload (Simple)
1. Locate **`POST /files/upload`**.
2. Click **"Try it out"**.
3. Use the file picker to select a file.
4. Click **"Execute"**.
5. Copy the returned `fileId`.

#### Option B: Chunked Upload (Encrypted Flow)
1. **Initialize**: Call **`POST /files/init`** with the encrypted manifest header and filename. Copy the returned `fileId`.
2. **Upload Chunks**: Call **`PUT /files/{id}/chunks/{index}`** for each chunk.
   - Set `{id}` to your `fileId`.
   - Set `{index}` starting from 0.
   - Provide the binary data in the request body.
3. **Complete**: Call **`POST /files/{id}/complete`** to finalize the upload.

### 5. Retrieve a File
1. **List Files**: Call **`GET /files`** to see all your uploaded files and their IDs.
2. **Get Metadata**: Call **`GET /files/{id}`** to get details about a specific file.
3. **Download Manifest**: Call **`GET /files/{id}/manifest`** to retrieve the encrypted manifest.
4. **Download Chunks**: Call **`GET /files/{id}/chunks/{index}`** to retrieve the encrypted data chunks.

## Security
- **Authentication**: JWT Bearer tokens are required for all file operations.
- **Authorization**: Users can only access their own files.
- **Encryption**: Files are expected to be encrypted client-side. The backend only stores ciphertext.
