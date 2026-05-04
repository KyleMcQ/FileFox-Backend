import { router, useFocusEffect } from "expo-router";
import React, { useCallback, useState } from "react";
import { FlatList, Pressable, StyleSheet, Text, View } from "react-native";
import api from "../../../../src/api/apiClient";

export default function Files() {
  const [files, setFiles] = useState<any[]>([]);

  const greeting =
    new Date().getHours() < 12
      ? "Good morning"
      : new Date().getHours() < 18
      ? "Good afternoon"
      : "Good evening";

  const load = async () => {
    try {
      const res = await api.get("/files");
      setFiles(res.data || []);
    } catch (e) {
      console.log(e);
    }
  };

  useFocusEffect(
    useCallback(() => {
      load();
    }, [])
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Your Files</Text>

      <FlatList
        data={files}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => (
          <Pressable
            style={styles.card}
            onPress={() =>
              router.push(`/(protected)/(user)/files/${item.id}`)
            }
          >
            <View style={{ flex: 1 }}>
              <Text style={styles.fileName}>{item.fileName}</Text>
              <Text style={{ fontSize: 12, color: "#666" }}>
                {(item.length / 1024).toFixed(2)} KB • {new Date(item.uploadedAt).toLocaleDateString()}
              </Text>
            </View>
            <Text style={{ color: "#FF8C42", fontWeight: "bold" }}>View</Text>
          </Pressable>
        )}
        ListEmptyComponent={
          <Text style={{ textAlign: "center", marginTop: 20, color: "#666" }}>No files found.</Text>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FFE7D1", padding: 20 },
  title: { fontSize: 24, fontWeight: "bold", marginBottom: 15 },

  card: {
    flexDirection: "row",
    gap: 10,
    padding: 14,
    backgroundColor: "#fff",
    borderRadius: 12,
    marginBottom: 10,
    alignItems: "center",
  },

  fileName: {
    fontSize: 15,
    fontWeight: "600",
  },
});