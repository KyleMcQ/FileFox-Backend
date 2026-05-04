import { Ionicons } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import { FlatList, Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import api from "../../../src/api/apiClient";

type Activity = {
  id: string;
  type: "file" | "upload" | "access" | "system" | "login";
  title: string;
  message: string;
  time: string;
};

export default function AdminLogs() {
  const [mode, setMode] = useState<"all" | "notifications" | "logs">("all");
  const [search, setSearch] = useState("");
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadLogs() {
      try {
        const res = await api.get("/admin/logs");
        setActivities(res.data);
      } catch (err) {
        console.error("Failed to load logs", err);
      } finally {
        setLoading(false);
      }
    }

    loadLogs();
  }, []);

  const filtered = activities
    .filter((item) => {
      if (mode === "notifications") {
        return ["file", "upload", "access", "system"].includes(item.type);
      }
      if (mode === "logs") {
        return item.type === "login";
      }
      return true;
    })
    .filter((item) =>
      item.title.toLowerCase().includes(search.toLowerCase()) ||
      item.message.toLowerCase().includes(search.toLowerCase())
    );

  const getIcon = (type: Activity["type"]) => {
    switch (type) {
      case "file":
        return "folder-outline";
      case "upload":
        return "cloud-upload-outline";
      case "access":
        return "lock-open-outline";
      case "system":
        return "notifications-outline";
      case "login":
        return "log-in-outline";
      default:
        return "alert-circle-outline";
    }
  };

  return (
    <View style={styles.container}>

      <Text style={styles.title}>Admin Logs</Text>

      <View style={styles.searchBox}>
        <Ionicons name="search" size={18} color="#888" />
        <TextInput
          placeholder="Search activity..."
          value={search}
          onChangeText={setSearch}
          style={styles.searchInput}
          placeholderTextColor="#999"
        />
      </View>

      <View style={styles.tabs}>
        {["all", "notifications", "logs"].map((t) => (
          <Pressable
            key={t}
            onPress={() => setMode(t as any)}
            style={[styles.tab, mode === t && styles.activeTab]}
          >
            <Text style={[styles.tabText, mode === t && styles.activeTabText]}>
              {t.toUpperCase()}
            </Text>
          </Pressable>
        ))}
      </View>

      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 20 }}
        ListEmptyComponent={
          !loading ? (
            <Text style={{ textAlign: "center", marginTop: 20, color: "#666" }}>
              No logs found
            </Text>
          ) : null
        }
        renderItem={({ item }) => (
          <View style={styles.card}>

            <View style={styles.iconWrap}>
              <Ionicons
                name={getIcon(item.type)}
                size={20}
                color="#FF8C42"
              />
            </View>

            <View style={styles.textBox}>
              <Text style={styles.cardTitle}>{item.title}</Text>
              <Text style={styles.cardMessage}>{item.message}</Text>
            </View>

            <Text style={styles.time}>{item.time}</Text>

          </View>
        )}
      />
    </View>
  );
}

/* STYLES (UNCHANGED) */
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
    marginBottom: 10,
  },

  searchBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    paddingHorizontal: 12,
    borderRadius: 12,
    marginBottom: 15,
    height: 45,
  },

  searchInput: {
    flex: 1,
    marginLeft: 8,
  },

  tabs: {
    flexDirection: "row",
    marginBottom: 15,
    gap: 10,
  },

  tab: {
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 20,
    backgroundColor: "#fff",
  },

  activeTab: {
    backgroundColor: "#FF8C42",
  },

  tabText: {
    fontSize: 12,
    color: "#444",
    fontWeight: "600",
  },

  activeTabText: {
    color: "#fff",
  },

  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 12,
    marginBottom: 10,
  },

  iconWrap: {
    width: 32,
    alignItems: "center",
    justifyContent: "center",
  },

  textBox: {
    flex: 1,
    marginLeft: 10,
  },

  cardTitle: {
    fontSize: 15,
    fontWeight: "bold",
    color: "#111",
  },

  cardMessage: {
    fontSize: 13,
    color: "#666",
    marginTop: 2,
  },

  time: {
    fontSize: 12,
    color: "#9CA3AF",
    marginLeft: 10,
  },
});