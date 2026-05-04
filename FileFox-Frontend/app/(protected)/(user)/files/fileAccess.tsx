import { FlatList, StyleSheet, Text, View, ActivityIndicator } from "react-native";
import { useEffect, useState } from "react";
import api from "../../../../src/api/apiClient";

export default function FileAccess() {
  const [sharedFiles, setSharedFiles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await api.get("/shared-files");
        setSharedFiles(res.data);
      } catch (err) {
        console.log("Failed to load shared files:", err);
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  return (
    <View style={{ flex: 1, backgroundColor: "#FFE7D1", padding: 20 }}>
      <Text style={{ fontSize: 22, fontWeight: "bold" }}>File Access</Text>

      {loading ? (
        <ActivityIndicator size="large" color="#FF8C42" />
      ) : (
        <FlatList
          data={sharedFiles}
          keyExtractor={(i) => i.id}
          renderItem={({ item }) => (
            <View style={{ backgroundColor: "#fff", padding: 10, marginVertical: 5 }}>
              <Text>{item.fileName}</Text>
            </View>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFE7D1",
    padding: 20,
  },

  title: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#111",
  },

  subtitle: {
    fontSize: 14,
    color: "#666",
    marginBottom: 15,
  },

  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "white",
    padding: 15,
    borderRadius: 12,
    marginBottom: 10,
  },

  fileName: {
    fontSize: 15,
    fontWeight: "bold",
    color: "#111",
  },

  sharedWith: {
    fontSize: 13,
    color: "#555",
    marginTop: 2,
  },

  lastAccessed: {
    fontSize: 12,
    color: "#888",
    marginTop: 2,
  },

  statusBox: {
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 10,
  },

  statusText: {
    fontSize: 11,
    fontWeight: "600",
    marginTop: 2,
    textTransform: "capitalize",
  },
});