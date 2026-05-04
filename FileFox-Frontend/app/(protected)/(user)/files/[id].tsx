import * as FileSystem from "expo-file-system";
import { router, useLocalSearchParams } from "expo-router";
import * as Sharing from "expo-sharing";
import React, { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    Pressable,
    Text,
    View,
} from "react-native";
import api from "../../../../src/api/apiClient";

export default function FileView() {
  const { id } = useLocalSearchParams();
  const fileId = Array.isArray(id) ? id[0] : id;

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

  const download = async () => {
    if (!fileId) return;

    setDownloading(true);

    try {
      const fileUri =
        FileSystem.documentDirectory +
        (file?.fileName ?? "downloaded-file");

      const downloadResumable = FileSystem.createDownloadResumable(
        `${api.defaults.baseURL}/files/${fileId}/download`,
        fileUri
      );

      const result = await downloadResumable.downloadAsync();

      if (!result?.uri) throw new Error("Download failed");

      const canShare = await Sharing.isAvailableAsync();

      if (canShare) {
        await Sharing.shareAsync(result.uri);
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
        onPress={download}
        disabled={downloading}
        style={{
          backgroundColor: "#FF8C42",
          padding: 14,
          borderRadius: 10,
          marginBottom: 10,
          opacity: downloading ? 0.6 : 1,
        }}
      >
        <Text style={{ color: "#fff", textAlign: "center", fontWeight: "600" }}>
          {downloading ? "Downloading..." : "Download"}
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