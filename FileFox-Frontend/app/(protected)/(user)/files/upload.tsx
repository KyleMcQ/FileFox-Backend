import * as DocumentPicker from "expo-document-picker";
import React, { useState } from "react";
import {
  Alert,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import api from "../../../../src/api/apiClient";
import {
  encryptData,
  generateFileKey,
  wrapFileKey,
  importPublicKey,
} from "../../../../src/crypto/encryption";
import { Buffer } from "buffer";

const CHUNK_SIZE = 1024 * 1024;

export default function FileUpload({ onUploadSuccess, keys }: any) {
  const [file, setFile] = useState<any>(null);
  const [extraMetadata, setExtraMetadata] = useState("");
  const [uploading, setUploading] = useState(false);

  const handlePickFile = async () => {
    const result = await DocumentPicker.getDocumentAsync({
      copyToCacheDirectory: true,
    });

    if (result.canceled) return;

    const asset = result.assets[0];

    setFile({
      uri: asset.uri,
      name: asset.name ?? "file",
      size: asset.size ?? 0,
      type: asset.mimeType ?? "application/octet-stream",
    });
  };

  const handleDirectUpload = async () => {
    if (!file) return;

    setUploading(true);

    try {
      const formData = new FormData();

      formData.append("file", {
        uri: file.uri,
        name: file.name,
        type: file.type,
      } as any);

      if (extraMetadata) {
        formData.append("encryptedMetadata", btoa(extraMetadata));
      }

      formData.append("recoveryWrappedKey", "TEMP_KEY");

      await api.post("/files/upload", formData);

      Alert.alert("Success", "Uploaded");

      setFile(null);
      setExtraMetadata("");
      onUploadSuccess();
    } catch (e) {
      console.log("DIRECT ERROR:", e);
      Alert.alert("Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const handleSecureUpload = async () => {
    if (!file || !keys) return;

    setUploading(true);

    try {
      const fileKey = generateFileKey();
      const pubKey = importPublicKey(keys.publicKey);

      const wrappedFileKey = wrapFileKey(fileKey, pubKey);

      const init = await api.post("/files/init", {
        encryptedFileName: file.name,
        encryptedMetadata: extraMetadata ? Buffer.from(extraMetadata).toString("base64") : null,
        wrappedFileKey,
        recoveryWrappedKey: "SIMULATED_RECOVERY_KEY_WRAPPED",
        chunkSize: CHUNK_SIZE,
        totalSize: file.size,
        contentType: file.type,
      });

      const fileId = init.data.fileId;

      const response = await fetch(file.uri);
      const arrayBuffer = await response.arrayBuffer();

      const totalChunks = Math.ceil(arrayBuffer.byteLength / CHUNK_SIZE);

      for (let i = 0; i < totalChunks; i++) {
        const start = i * CHUNK_SIZE;
        const end = Math.min(arrayBuffer.byteLength, start + CHUNK_SIZE);

        const chunk = arrayBuffer.slice(start, end);

        const { encrypted, iv } = await encryptData(chunk, fileKey);

        const payload = Buffer.concat([
          Buffer.from(iv, "binary"),
          Buffer.from(encrypted, "binary")
        ]);

        await api.put(`/files/${fileId}/chunks/${i}`, payload, {
          headers: { "Content-Type": "application/octet-stream" }
        });
      }

      await api.post(`/files/${fileId}/complete`);

      Alert.alert("Success", "Secure upload done");

      setFile(null);
      setExtraMetadata("");
      onUploadSuccess();
    } catch (e) {
      console.log("SECURE ERROR:", e);
      Alert.alert("Upload failed");
    } finally {
      setUploading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Pressable onPress={handlePickFile} style={styles.pickBtn}>
        <Text style={styles.btnText}>
          {file ? file.name : "Choose File"}
        </Text>
      </Pressable>

      <TextInput
        value={extraMetadata}
        onChangeText={setExtraMetadata}
        placeholder="Metadata"
        style={styles.input}
      />

      <Pressable onPress={handleDirectUpload} style={styles.directBtn}>
        <Text style={styles.btnText}>Direct Upload</Text>
      </Pressable>

      <Pressable onPress={handleSecureUpload} style={styles.secureBtn}>
        <Text style={styles.btnText}>Secure Upload</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FFE7D1", padding: 20 },
  pickBtn: { backgroundColor: "#FF8C42", padding: 12, borderRadius: 10 },
  input: { backgroundColor: "#fff", padding: 10, marginTop: 10 },
  directBtn: { backgroundColor: "#6366F1", padding: 14, marginTop: 10 },
  secureBtn: { backgroundColor: "#10B981", padding: 14, marginTop: 10 },
  btnText: { color: "#fff", textAlign: "center" },
});