import { Feather, Ionicons, MaterialIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import api from "../../../src/api/apiClient";
import { useAuth } from "../../../src/hooks/useAuth";

export default function Home() {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    files: 0,
    shared: 0,
    requests: 0,
    activity: 0,
  });

  useEffect(() => {
    async function load() {
      try {
        const res = await api.get("/dashboard/stats");
        setStats(res.data);
      } catch (err) {
        console.log(err);
      }
    }

    load();
  }, []);

  const greeting =
    new Date().getHours() < 12
      ? "Good morning"
      : new Date().getHours() < 18
      ? "Good afternoon"
      : "Good evening";

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>
        {greeting}, {user?.userName || "User"}
      </Text>

      <Text style={styles.subtitle}>
        Here’s what’s happening with your files
      </Text>

      <View style={styles.row}>
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Files</Text>
          <Text style={styles.cardValue}>{stats.files}</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Shared</Text>
          <Text style={styles.cardValue}>{stats.shared}</Text>
        </View>
      </View>

      <View style={styles.row}>
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Requests</Text>
          <Text style={styles.cardValue}>{stats.requests}</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Activity</Text>
          <Text style={styles.cardValue}>{stats.activity}</Text>
        </View>
      </View>

      <Text style={styles.sectionTitle}>Quick Actions</Text>

      <View style={styles.actionRow}>
        <Pressable style={styles.actionBtn} onPress={() => router.push("/(protected)/(user)/files/filesList")}>
          <Feather name="upload" size={16} color="white" />
          <Text style={styles.actionText}>Upload</Text>
        </Pressable>

        <Pressable style={styles.actionBtn} onPress={() => router.push("/(protected)/(user)/files/filesList")}>
          <Ionicons name="folder-outline" size={16} color="white" />
          <Text style={styles.actionText}>Files</Text>
        </Pressable>

        <Pressable style={styles.actionBtn} onPress={() => router.push("/(protected)/(user)/activity")}>
          <MaterialIcons name="history" size={16} color="white" />
          <Text style={styles.actionText}>Activity</Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FFE7D1", padding: 20 },
  title: { fontSize: 26, fontWeight: "bold", marginTop: 20 },
  subtitle: { fontSize: 14, marginBottom: 20 },

  row: { flexDirection: "row", justifyContent: "space-between", marginBottom: 10 },

  card: {
    flex: 1,
    backgroundColor: "#FF8C42",
    padding: 15,
    borderRadius: 12,
    marginHorizontal: 5,
  },

  cardTitle: { color: "white" },
  cardValue: { color: "white", fontSize: 22, fontWeight: "bold" },

  sectionTitle: { marginTop: 20, fontSize: 16, fontWeight: "bold" },

  actionRow: { flexDirection: "row", flexWrap: "wrap", marginTop: 10 },

  actionBtn: {
    backgroundColor: "#FF8C42",
    padding: 10,
    borderRadius: 10,
    margin: 5,
  },

  actionText: { color: "white", fontWeight: "600" },
});