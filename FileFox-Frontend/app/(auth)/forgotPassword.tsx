import { router } from "expo-router";
import { useState } from "react";
import { Alert, Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import api from "../../src/api/apiClient";
import PrimaryButton from "../../components/primaryButton";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handleForgot = async () => {
    if (!email) {
      Alert.alert("Error", "Please enter your email");
      return;
    }

    setLoading(true);
    try {
      const res = await api.post("/auth/forgot-password", { email });
      Alert.alert("Success", "If an account exists, a reset link has been sent.");

      if (res.data.resetToken) {
        // For demo purposes, we show the token
        console.log("Reset Token:", res.data.resetToken);
        Alert.alert("Demo Mode", `Your reset token is: ${res.data.resetToken}`, [
          {
            text: "Continue to Reset",
            onPress: () => router.push({
              pathname: "/(auth)/resetPassword",
              params: { token: res.data.resetToken }
            })
          }
        ]);
      } else {
        router.push("/(auth)/resetPassword");
      }
    } catch (err) {
      Alert.alert("Error", "Request failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Forgot Password</Text>
      <Text style={styles.subtitle}>Enter your email to receive a reset token</Text>

      <TextInput
        placeholder="Email Address"
        value={email}
        onChangeText={setEmail}
        style={styles.input}
        keyboardType="email-address"
        autoCapitalize="none"
        placeholderTextColor="#999"
      />

      <PrimaryButton title={loading ? "Sending..." : "Send Reset Token"} onPress={handleForgot} />

      <Pressable style={styles.linkButton} onPress={() => router.back()}>
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
