import { router, useFocusEffect } from "expo-router";
import React, { useCallback, useState } from "react";
import { FlatList, Pressable, StyleSheet, Text } from "react-native";
import api from "../../../../src/api/apiClient";

export default function Files() {
  const [files, setFiles] = useState<any[]>([]);

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
    <FlatList
      data={files}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => (
        <Pressable
          onPress={() =>
            router.push(`/(protected)/(user)/files/${item.id}`)
          }
        >
          <Text>{item.fileName}</Text>
        </Pressable>
      )}
    />
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