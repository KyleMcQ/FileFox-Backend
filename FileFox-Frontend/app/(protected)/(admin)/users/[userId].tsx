import { useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import api from "../../../../src/api/apiClient";

type User = {
  id: string;
  name: string;
  email: string;
  role: string;
  status: string;
};

export default function UserDetails() {
  const { userId } = useLocalSearchParams<{ userId: string }>();

  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUser();
  }, [userId]);

  const loadUser = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/admin/users/${userId}`);
      setUser(res.data);
    } catch (err) {
      console.log("Failed to load user:", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#FF8C42" />
      </View>
    );
  }

  if (!user) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>User not found</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>User Details</Text>

      <View style={styles.card}>
        <Text style={styles.label}>Name</Text>
        <Text style={styles.value}>{user.name}</Text>

        <Text style={styles.label}>Email</Text>
        <Text style={styles.value}>{user.email}</Text>

        <Text style={styles.label}>Role</Text>
        <Text style={styles.value}>{user.role}</Text>

        <Text style={styles.label}>Status</Text>
        <Text
          style={[
            styles.status,
            user.status === "active" ? styles.active : styles.disabled,
          ]}
        >
          {user.status}
        </Text>
      </View>
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
    marginBottom: 20,
  },

  card: {
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 12,
  },

  label: {
    fontSize: 12,
    color: "#666",
    marginTop: 10,
  },

  value: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111",
  },

  status: {
    fontSize: 12,
    padding: 6,
    borderRadius: 6,
    marginTop: 5,
    alignSelf: "flex-start",
  },

  active: {
    backgroundColor: "#DCFCE7",
    color: "#16A34A",
  },

  disabled: {
    backgroundColor: "#FEE2E2",
    color: "#DC2626",
  },
});