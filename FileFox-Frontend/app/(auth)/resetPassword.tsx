import { router, useLocalSearchParams } from "expo-router";
import { useState } from "react";
import { Alert, Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import api from "../../src/api/apiClient";
import PrimaryButton from "../../components/primaryButton";

export default function ResetPassword() {
  const { token: initialToken } = useLocalSearchParams<{ token?: string }>();

  const [token, setToken] = useState(initialToken || "");
  const [newPassword, setNewPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleReset = async () => {
    if (!token || !newPassword) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }

    setLoading(true);
    try {
      await api.post("/auth/reset-password", { token, newPassword });
      Alert.alert("Success", "Password reset successfully. You can now login.");
      router.replace("/(auth)/login");
    } catch (err: any) {
      Alert.alert("Error", err.response?.data?.error || "Reset failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Reset Password</Text>
      <Text style={styles.subtitle}>Enter the token and your new password</Text>

      <TextInput
        placeholder="Reset Token"
        value={token}
        onChangeText={setToken}
        style={styles.input}
        autoCapitalize="none"
        placeholderTextColor="#999"
      />

      <TextInput
        placeholder="New Password"
        value={newPassword}
        onChangeText={setNewPassword}
        style={styles.input}
        secureTextEntry
        placeholderTextColor="#999"
      />

      <PrimaryButton title={loading ? "Resetting..." : "Reset Password"} onPress={handleReset} />

      <Pressable style={styles.linkButton} onPress={() => router.push("/(auth)/login")}>
        <Text style={styles.linkText}>Back to Login</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFE7D1",
    justifyContent: "center",
    padding: 25,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 10,
    color: "#333",
  },
  subtitle: {
    fontSize: 14,
    textAlign: "center",
    marginBottom: 30,
    color: "#666",
  },
  input: {
    backgroundColor: "#fff",
    padding: 14,
    borderRadius: 10,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#FFD2A6",
    fontSize: 16,
  },
  linkButton: {
    marginTop: 20,
  },
  linkText: {
    color: "#FF8C42",
    textAlign: "center",
    fontWeight: "500",
  },
});
