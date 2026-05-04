import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import { FlatList, Pressable, StyleSheet, Text, View } from "react-native";
import api from "../../../../src/api/apiClient";

export default function AdminUsers() {
  const [users, setUsers] = useState<any[]>([]);

  useEffect(() => {
    load();
  }, []);

  async function load() {
    try {
      const res = await api.get("/admin/users");
      setUsers(res.data);
    } catch (err) {
      console.log(err);
    }
  }

  const toggleStatus = async (id: string) => {
    await api.patch(`/admin/users/${id}/toggle`);
    load();
  };

  const changeRole = async (id: string) => {
    await api.patch(`/admin/users/${id}/role`);
    load();
  };

  const deleteUser = async (id: string) => {
    await api.delete(`/admin/users/${id}`);
    load();
  };

  const viewUser = (user: any) => {
    router.push({
      pathname: "/(protected)/(admin)/users/[userId]",
      params: { userId: user.id },
    });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Manage Users</Text>
      <Text style={styles.subtitle}>Admin control panel</Text>

      <FlatList
        data={users}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={{ flex: 1 }}>
              <Text style={styles.name}>{item.name}</Text>
              <Text style={styles.email}>{item.email}</Text>

              <View style={styles.row}>
                <Text style={styles.tag}>{item.role.toUpperCase()}</Text>

                <Text
                  style={[
                    styles.status,
                    item.status === "active" ? styles.active : styles.disabled,
                  ]}
                >
                  {item.status}
                </Text>
              </View>
            </View>

            <View style={styles.actions}>
              <Pressable onPress={() => viewUser(item)}>
                <Ionicons name="eye-outline" size={20} color="#FF8C42" />
              </Pressable>

              <Pressable onPress={() => changeRole(item.id)}>
                <Ionicons name="swap-horizontal" size={20} color="#3B82F6" />
              </Pressable>

              <Pressable onPress={() => toggleStatus(item.id)}>
                <Ionicons name="ban-outline" size={20} color="#F59E0B" />
              </Pressable>

              <Pressable onPress={() => deleteUser(item.id)}>
                <Ionicons name="trash-outline" size={20} color="#EF4444" />
              </Pressable>
            </View>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FFE7D1", padding: 20 },
  title: { fontSize: 26, fontWeight: "bold" },
  subtitle: { fontSize: 13, color: "#666", marginBottom: 15 },

  card: {
    flexDirection: "row",
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 12,
    marginBottom: 10,
  },

  name: { fontSize: 16, fontWeight: "bold" },
  email: { fontSize: 12, color: "#666", marginBottom: 6 },

  row: { flexDirection: "row", gap: 8 },

  tag: {
    fontSize: 10,
    backgroundColor: "#FF8C42",
    color: "#fff",
    padding: 6,
    borderRadius: 6,
  },

  status: { fontSize: 10, padding: 6, borderRadius: 6 },
  active: { backgroundColor: "#DCFCE7", color: "#16A34A" },
  disabled: { backgroundColor: "#FEE2E2", color: "#DC2626" },

  actions: { flexDirection: "row", gap: 12 },
});