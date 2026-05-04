# 📁 FileFox Frontend

A mobile frontend for **FileFox**, a file management and sharing system built with **React Native (Expo)** and **Expo Router**.

This app allows users to upload, view, download, and delete files through a modern mobile UI connected to a backend API.

---

## 🚀 Tech Stack

- React Native (Expo SDK 54)
- Expo Router (file-based navigation)
- TypeScript
- Axios (API communication)
- Expo File System
- Expo Sharing

---

## 📦 Features

- 📂 View uploaded files
- ⬇️ Download files to device
- 🔗 Share downloaded files
- 🗑️ Delete files
- 🔄 Real-time API integration
- 📱 Mobile-first UI

---

## 📁 Project Structure
FileFox-Frontend/
├── app/ # Expo Router screens
│ └── (protected)/
│ └── (user)/
│ └── files/
├── src/
│ └── api/
│ └── apiClient.ts
├── assets/
├── app.json
├── tsconfig.json
└── package.json


---

## 🛠️ Setup Instructions

### 1. Clone the repository

```bash
git clone <your-repo-url>
cd FileFox-Frontend

npm install

npx expo install expo-file-system expo-sharing expo-router expo-constants expo-linking expo-secure-store

npx expo start
