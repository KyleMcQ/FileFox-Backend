import { router } from "expo-router";
import { useState } from "react";
import { Alert, Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import api from "../../src/api/apiClient";
import {
  generateUserKeyPair,
  exportPublicKey,
  exportEncryptedPrivateKey,
} from "../../src/crypto/encryption";

export default function Register() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const register = async () => {
    try {
      if (!username || !email || !password || !confirmPassword) {
        Alert.alert("Error", "Please fill in all fields");
        return;
      }

      if (password !== confirmPassword) {
        Alert.alert("Error", "Passwords do not match");
        return;
      }

      if (password.length < 6) {
        Alert.alert("Error", "Password must be at least 6 characters");
        return;
      }

      setLoading(true);

      await api.post("/auth/register", {
        username: username.trim(),
        email: email.trim().toLowerCase(),
        password,
      });

      // Login to register keys
      const loginRes = await api.post("/auth/login", {
        email: email.trim().toLowerCase(),
        password,
      });

      const token = loginRes.data.accessToken;

      // Generate and register keys
      const keyPair = await generateUserKeyPair();
      const publicKey = exportPublicKey(keyPair.publicKey);
      const encryptedPrivateKey = await exportEncryptedPrivateKey(
        keyPair.privateKey,
        password
      );

      await api.post(
        "/keys/register",
        {
          algorithm: "RSA-OAEP",
          publicKey,
          encryptedPrivateKey,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      Alert.alert("Success", "Account and encryption keys created successfully");

      router.replace("/(auth)/login");
    } catch (err: any) {
      console.log(
        "REGISTER ERROR:",
        err?.response?.data || err.message || err
      );

      const message =
        err?.response?.data?.errors?.$?.[0] ||
        err?.response?.data?.message ||
        "Registration failed";

      Alert.alert("Error", message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Register</Text>

      <TextInput
        placeholder="Username"
        value={username}
        onChangeText={setUsername}
        style={styles.input}
        placeholderTextColor="#999"
        autoCapitalize="none"
      />

      <TextInput
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        style={styles.input}
        placeholderTextColor="#999"
        keyboardType="email-address"
        autoCapitalize="none"
      />

      <TextInput
        placeholder="Password"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
        style={styles.input}
        placeholderTextColor="#999"
      />

      <TextInput
        placeholder="Confirm Password"
        secureTextEntry
        value={confirmPassword}
        onChangeText={setConfirmPassword}
        style={styles.input}
        placeholderTextColor="#999"
      />

      <Pressable
        style={[styles.primaryButton, loading && { opacity: 0.6 }]}
        onPress={register}
        disabled={loading}
      >
        <Text style={styles.primaryText}>
          {loading ? "Creating account..." : "Register"}
        </Text>
      </Pressable>

      <Text
        style={styles.linkText}
        onPress={() => router.push("/(auth)/login")}
      >
        Already have an account? Login
      </Text>
    </View>
  );
}

/* ================= STYLES ================= */

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
    marginBottom: 30,
    color: "#333",
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

  primaryButton: {
    backgroundColor: "#FF8C42",
    padding: 14,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 10,
  },

  primaryText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },

  linkText: {
    textAlign: "center",
    marginTop: 20,
    color: "#FF8C42",
    fontWeight: "500",
  },
});