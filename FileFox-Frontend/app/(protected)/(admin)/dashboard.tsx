import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import api from "../../../src/api/apiClient";

export default function AdminDashboard() {
  const [user, setUser] = useState<any>(null);
  const [stats, setStats] = useState<any>({
    users: 0,
    sessions: 0,
    logs: 0,
    alerts: 0,
  });

  const [activity, setActivity] = useState<string[]>([]);

  const hour = new Date().getHours();

  const greeting =
    hour < 12
      ? "Good morning"
      : hour < 18
      ? "Good afternoon"
      : "Good evening";

  useEffect(() => {
    async function load() {
      try {
        const me = await api.get("/auth/me");
        setUser(me.data);

        const res = await api.get("/admin/dashboard");
        setStats(res.data.stats);
        setActivity(res.data.activity);
      } catch (err) {
        console.log(err);
      }
    }

    load();
  }, []);

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>
        {greeting}, {user?.name || "Admin"}
      </Text>

      <Text style={styles.subtitle}>
        System overview and admin controls
      </Text>

      {/* STATS */}
      <View style={styles.row}>
        <View style={styles.card}>
          <View style={styles.iconRow}>
            <Ionicons name="people-outline" size={18} color="white" />
            <Text style={styles.cardTitle}>Users</Text>
          </View>
          <Text style={styles.cardValue}>{stats.users}</Text>
        </View>

        <View style={styles.card}>
          <View style={styles.iconRow}>
            <MaterialIcons name="security" size={18} color="white" />
            <Text style={styles.cardTitle}>Active Sessions</Text>
          </View>
          <Text style={styles.cardValue}>{stats.sessions}</Text>
        </View>
      </View>

      <View style={styles.row}>
        <View style={styles.card}>
          <View style={styles.iconRow}>
            <MaterialIcons name="history" size={18} color="white" />
            <Text style={styles.cardTitle}>Logs</Text>
          </View>
          <Text style={styles.cardValue}>{stats.logs}</Text>
        </View>

        <View style={styles.card}>
          <View style={styles.iconRow}>
            <Ionicons name="warning-outline" size={18} color="white" />
            <Text style={styles.cardTitle}>Alerts</Text>
          </View>
          <Text style={styles.cardValue}>{stats.alerts}</Text>
        </View>
      </View>

      {/* ACTIVITY */}
      <Text style={styles.sectionTitle}>System Activity</Text>

      <View style={styles.listCard}>
        {activity.map((a, i) => (
          <Text key={i} style={styles.item}>• {a}</Text>
        ))}
      </View>

      {/* ACTIONS */}
      <Text style={styles.sectionTitle}>Admin Actions</Text>

      <View style={styles.actionRow}>
        <Pressable
          style={styles.actionBtn}
          onPress={() => router.push("/(protected)/(admin)/users")}
        >
          <Ionicons name="people-outline" size={16} color="white" />
          <Text style={styles.actionText}>Users</Text>
        </Pressable>

        <Pressable
          style={styles.actionBtn}
          onPress={() => router.push("/(protected)/(admin)/adminLogs")}
        >
          <MaterialIcons name="history" size={16} color="white" />
          <Text style={styles.actionText}>Logs</Text>
        </Pressable>

        <Pressable
          style={styles.actionBtn}
          onPress={() => router.push("/(protected)/(user)/files/fileAccess")}
        >
          <Ionicons name="lock-closed-outline" size={16} color="white" />
          <Text style={styles.actionText}>Access</Text>
        </Pressable>
      </View>
    </ScrollView>
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
    marginTop: 20,
    color: "#333",
  },
  subtitle: {
    fontSize: 14,
    color: "#666",
    marginBottom: 20,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  card: {
    flex: 1,
    backgroundColor: "#FF8C42",
    padding: 15,
    borderRadius: 12,
    marginHorizontal: 5,
  },
  cardTitle: {
    color: "white",
    fontSize: 14,
  },
  cardValue: {
    color: "white",
    fontSize: 22,
    fontWeight: "bold",
    marginTop: 5,
  },
  sectionTitle: {
    marginTop: 20,
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
  },
  listCard: {
    backgroundColor: "white",
    padding: 15,
    borderRadius: 12,
    marginTop: 10,
  },
  item: {
    fontSize: 14,
    marginBottom: 5,
    color: "#444",
  },
  actionRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: 10,
  },
  actionBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#FF8C42",
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 10,
    marginRight: 8,
    marginBottom: 8,
  },
  actionText: {
    color: "white",
    fontWeight: "600",
  },
  iconRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 5,
  },
});