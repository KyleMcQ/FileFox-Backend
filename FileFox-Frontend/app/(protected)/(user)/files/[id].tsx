import * as FileSystem from "expo-file-system";
import { router, useLocalSearchParams } from "expo-router";
import { useKeys } from "../../../../src/hooks/useKeys";
import * as Sharing from "expo-sharing";
import React, { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    Pressable,
    StyleSheet,
    Text,
    View,
} from "react-native";
import api from "../../../../src/api/apiClient";
import { useAuth } from "../../../../src/hooks/useAuth";
import { unwrapFileKey, decryptData } from "../../../../src/crypto/encryption";
import { Buffer } from "buffer";

export default function FileView() {
  const { id } = useLocalSearchParams();
  const fileId = Array.isArray(id) ? id[0] : id;

  const { password } = useAuth();
  const { keys } = useKeys();

  const [file, setFile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);

  const loadFile = async () => {
    try {
      const res = await api.get(`/files/${fileId}`);
      setFile(res.data);
    } catch (err) {
      console.log(err);
      Alert.alert("Error", "Failed to load file");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (fileId) loadFile();
  }, [fileId]);

  const download = async (secure: boolean = false) => {
    if (!fileId) return;

    setDownloading(true);

    try {
      const fileUri =
        (FileSystem.documentDirectory || "") +
        (file?.fileName ?? "downloaded-file");

      if (secure) {
        if (!keys || !password) {
          Alert.alert("Error", "Encryption keys not available. Please re-login.");
          return;
        }

        const wrappedKey = file.wrappedKeys?.[0];
        if (!wrappedKey) {
          Alert.alert("Error", "No wrapped key found for secure download");
          return;
        }

        const fileKey = unwrapFileKey(wrappedKey, keys.privateKey);

        const decryptedChunks: ArrayBuffer[] = [];
        let i = 0;
        while (true) {
          try {
            const res = await api.get(`/files/${fileId}/chunks/${i}`, {
              responseType: "arraybuffer",
            });
            const combined = Buffer.from(res.data);

            const iv = combined.slice(0, 12);
            const encrypted = combined.slice(12);

            const decrypted = await decryptData(encrypted, iv, fileKey);
            decryptedChunks.push(decrypted);
            i++;
          } catch (e: any) {
            if (e.response?.status === 404 && i > 0) break;
            throw e;
          }
        }

        const totalLength = decryptedChunks.reduce((acc, c) => acc + c.byteLength, 0);
        const finalBuffer = new Uint8Array(totalLength);
        let offset = 0;
        for (const chunk of decryptedChunks) {
          finalBuffer.set(new Uint8Array(chunk), offset);
          offset += chunk.byteLength;
        }

        await FileSystem.writeAsStringAsync(
          fileUri,
          Buffer.from(finalBuffer).toString("base64"),
          { encoding: "base64" as any }
        );
      } else {
        const downloadResumable = FileSystem.createDownloadResumable(
          `${api.defaults.baseURL}/files/${fileId}/download`,
          fileUri
        );

        const result = await downloadResumable.downloadAsync();
        if (!result?.uri) throw new Error("Download failed");
      }

      const canShare = await Sharing.isAvailableAsync();
      if (canShare) {
        await Sharing.shareAsync(fileUri);
      } else {
        Alert.alert("Download complete", "File saved locally");
      }
    } catch (e) {
      console.log("DOWNLOAD ERROR:", e);
      Alert.alert("Download failed");
    } finally {
      setDownloading(false);
    }
  };

  const deleteFile = async () => {
    Alert.alert("Delete file?", "This cannot be undone.", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            await api.delete(`/files/${fileId}`);
            router.replace("/(protected)/(user)/files/filesList");
          } catch (err) {
            console.log(err);
            Alert.alert("Error", "Delete failed");
          }
        },
      },
    ]);
  };

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#FF8C42" />
      </View>
    );
  }

  if (!file) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Text>File not found</Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, padding: 20, backgroundColor: "#FFE7D1" }}>
      <Text style={{ fontSize: 22, fontWeight: "bold", marginBottom: 10 }}>
        {file.fileName}
      </Text>

      <Text style={{ marginBottom: 20, color: "#666" }}>
        {file.contentType}
      </Text>

      <Pressable
        onPress={() => download(false)}
        disabled={downloading}
        style={[styles.button, downloading && { opacity: 0.6 }]}
      >
        <Text style={styles.buttonText}>
          {downloading ? "Downloading..." : "Direct Download"}
        </Text>
      </Pressable>

      <Pressable
        onPress={() => download(true)}
        disabled={downloading}
        style={[styles.button, { backgroundColor: "#10B981" }, downloading && { opacity: 0.6 }]}
      >
        <Text style={styles.buttonText}>
          {downloading ? "Downloading..." : "Secure Download"}
        </Text>
      </Pressable>

      <Pressable
        onPress={deleteFile}
        style={{
          backgroundColor: "#EF4444",
          padding: 14,
          borderRadius: 10,
        }}
      >
        <Text style={{ color: "#fff", textAlign: "center", fontWeight: "600" }}>
          Delete
        </Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FFE7D1", padding: 20 },
  title: { fontSize: 22, fontWeight: "bold", marginBottom: 10 },
  button: {
    backgroundColor: "#FF8C42",
    padding: 14,
    borderRadius: 10,
    marginBottom: 10,
  },
  buttonText: {
    color: "#fff",
    textAlign: "center",
    fontWeight: "600",
  },
});