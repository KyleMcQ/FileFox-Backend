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

## AWS RDS SQL Server Setup

This project uses Amazon RDS for SQL Server for persistent storage of metadata and encrypted file blobs. Follow these steps to set it up:

### 1. Create an RDS Instance
1. Log in to your **AWS Management Console**.
2. Navigate to **RDS** and click **"Create database"**.
3. Choose **"Standard create"**.
4. Engine options: **Microsoft SQL Server**.
5. Edition: **SQL Server Express** (Free Tier eligible).
6. Templates: **Free tier** (if applicable).
7. Settings:
   - **DB instance identifier**: `filefox-db`
   - **Master username**: `admin`
   - **Master password**: *Choose a strong password*
8. Connectivity:
   - **Public access**: **Yes** (if you want to access it from outside AWS VPC, ensure security groups allow port 1433).
   - **VPC security group**: Create new or choose existing. Ensure it allows inbound traffic on port **1433**.
9. Click **"Create database"**.

### 2. Configure Connection String
1. Once the RDS instance is "Available", click on it to see the **Endpoint**.
2. Open `appsettings.json` in the root of the project.
3. Update the `DefaultConnection` string:
   ```json
   "ConnectionStrings": {
     "DefaultConnection": "Server=YOUR_RDS_ENDPOINT,1433;Database=FileFoxDb;User Id=admin;Password=YOUR_PASSWORD;TrustServerCertificate=True"
   }
   ```
   - Replace `YOUR_RDS_ENDPOINT` with the endpoint from the AWS console.
   - Replace `YOUR_PASSWORD` with the master password you set.

### 3. Run the Application
The application is configured to automatically create the database schema on startup using `db.Database.EnsureCreated()`. No manual migrations are required for the initial setup.

### 4. Troubleshooting Connection Issues
If the application fails to start with a database connection error:
- **No such host is known**: Double-check the `Server` address in your connection string. It should match the Endpoint provided in the AWS Console.
- **Connection Timed Out**: Ensure your AWS RDS Security Group allows inbound traffic on port `1433`. If you are running locally, you may need to add your public IP address to the allowed list.
- **SSL/TLS errors**: Ensure `TrustServerCertificate=True` is included in the connection string if you are using self-signed certificates or RDS default certificates without installing them locally.
- **Foreign Key / NULL Errors**: If you encounter errors like `Cannot insert the value NULL into column 'FileRecordId'`, it means your database schema was created before the recent update. Since we use `EnsureCreated()`, you must **drop the `AuditLogs` table** (or the entire database) and restart the application to let it recreate the schema correctly.

## Security
- **Authentication**: JWT Bearer tokens are required for all file operations.
- **Authorization**: Users can only access their own files.
- **Encryption**: Files are expected to be encrypted client-side. The backend only stores ciphertext.
- **Metadata Encryption**: Clients can now provide `EncryptedMetadata` during file initialization. This field is stored as ciphertext on the server, ensuring even file-related metadata is private.
- **MFA Recovery**: When setting up MFA, the server provides 10 single-use recovery codes. These codes are hashed (using BCrypt) before being stored. Use the `POST /auth/login/recovery` endpoint if you lose access to your TOTP device.
- **File Recovery**: The `RecoveryWrappedKey` field allows storing a file key wrapped with a recovery public key, providing a secondary way to access files if primary keys are lost.
- **Rate Limiting**: API endpoints are protected by rate limiting. The `auth` endpoints are limited to 10 requests per minute, and other `api` endpoints are limited to 100 requests per minute.
- **Security Headers**: The API uses security headers (HSTS, CSP, etc.) to harden the server against common web attacks.
- **Auditing**: Critical actions like logins and file deletions are logged for security auditing.

## Deployment to AWS (API Only)

The following instructions describe how to host the **FileFox API** on AWS using **AWS App Runner**. This process involves turning your code into a "Docker Image," saving it to AWS, and then telling AWS to run it.

### 1. Prerequisites
1. **AWS Account**: You need an active AWS account.
2. **Docker Desktop**: [Download and install](https://www.docker.com/products/docker-desktop/) it. Ensure it is running.
3. **AWS CLI**: [Download and install](https://aws.amazon.com/cli/) the Command Line Interface.
4. **AWS RDS SQL Server**: Follow the "AWS RDS SQL Server Setup" section above to create your database first.

### 2. Step-by-Step: Prepare and Push your Docker Image
Docker allows you to package your app into an "image" that runs the same way everywhere.

1. **Open your Terminal**: Open PowerShell or Command Prompt in the root folder of this project (`FileFox-Backend`).
2. **Build the Image**: Run this command to create the image locally:
   ```bash
   docker build -t filefox-api .
   ```
3. **Create an ECR Repository**:
   - Go to the **AWS Console** and search for **ECR** (Elastic Container Registry).
   - Click **"Create repository"**.
   - Name it `filefox-api` and click **"Create"**.
4. **Login to AWS via Terminal**:
   - In ECR, click on your new `filefox-api` repository.
   - Click the **"View push commands"** button at the top right.
   - Copy the first command (it starts with `aws ecr get-login-password...`) and paste it into your terminal. This "logs" your terminal into AWS.
5. **Tag and Push**:
   - Follow the remaining 3 commands shown in the "View push commands" window. They will look like this (replace `YOUR_ACCOUNT_ID` and `YOUR_REGION` with your actual info):
     ```bash
     # Tag your image for AWS
     docker tag filefox-api:latest YOUR_ACCOUNT_ID.dkr.ecr.YOUR_REGION.amazonaws.com/filefox-api:latest

     # Push the image to AWS
     docker push YOUR_ACCOUNT_ID.dkr.ecr.YOUR_REGION.amazonaws.com/filefox-api:latest
     ```

### 3. Step-by-Step: Deploy with AWS App Runner
App Runner is the easiest way to run your Docker image on AWS.

1. **Open App Runner**: In the AWS Console, search for **AWS App Runner**.
2. **Create Service**: Click **"Create service"**.
3. **Source**:
   - Repository type: **Container registry**.
   - Provider: **Amazon ECR**.
   - Container image: Click **"Browse"** and select your `filefox-api` image and the `latest` tag.
   - Deployment settings: Choose **"Automatic"** if you want AWS to redeploy every time you push a new image.
4. **Service Configuration**:
   - **Service name**: `filefox-api-service`.
   - **Port**: Change this to **`8080`**. (This is important! Our app is configured to use port 8080).
5. **Environment Variables**: Under "Configuration", find "Environment variables" and add these keys:
   - `ConnectionStrings__DefaultConnection`: *Paste your full RDS connection string here*.
   - `Jwt__Key`: *Type a long, secret random string (at least 32 characters)*.
   - `Jwt__Issuer`: `FileFoxProduction`
   - `Jwt__Audience`: `FileFoxProductionAudience`
6. **Review & Deploy**: Click **"Next"**, then **"Create & Deploy"**. It will take a few minutes.

### 4. Important: Security Groups (Database Connection)
If your App Runner service cannot connect to your RDS database (it might "Time Out"), you need to tell the database to allow traffic from App Runner:
1. Go to **RDS** -> **Databases** -> Click your database (`filefox-db`).
2. Under **Connectivity & security**, click the link under **VPC security groups**.
3. Go to the **Inbound rules** tab and click **"Edit inbound rules"**.
4. Add a rule:
   - **Type**: MSSQL (Port 1433).
   - **Source**: `0.0.0.0/0` (Note: This is the easiest for beginners but less secure. For better security, research "AWS VPC Connectors").
5. Click **"Save rules"**.

### 5. Frontend Configuration
Once the API is hosted, update your local or hosted frontend application (e.g., the React Demo in the `Dummy Website/` folder) to point to the new App Runner URL.
