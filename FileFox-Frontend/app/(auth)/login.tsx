import { router } from "expo-router";
import { useState } from "react";
import { Alert, StyleSheet, Text, View } from "react-native";

import Input from "../../components/input";
import PrimaryButton from "../../components/primaryButton";
import { useAuth } from "../../src/hooks/useAuth";
import api from "../../src/api/apiClient";

export default function Login() {
  const { login, setSession } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async () => {
    try {
      const res = await login(email, password);

      if (res.mfaRequired) {
        router.push({
          pathname: "/(auth)/mfa",
          params: { mfaToken: res.mfaToken, password },
        });
        return;
      }

      if (!res?.accessToken) {
        Alert.alert("Login failed");
        return;
      }

      // 1. store token and password first
      await setSession(res.accessToken, res.refreshToken, null, password);

      // 2. force API to use new token immediately
      const me = await api.get("/auth/me");

      // 3. overwrite user in context
      await setSession(res.accessToken, res.refreshToken, me.data, password);

      router.replace("/(protected)/(user)/home");
    } catch (err) {
      console.log(err);
      Alert.alert("Login failed");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Login</Text>

      <Input placeholder="Email" value={email} onChangeText={setEmail} />
      <Input
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />

      <PrimaryButton title="Login" onPress={handleLogin} />

      <Text
        style={styles.linkText}
        onPress={() => router.push("/(auth)/forgotPassword")}
      >
        Forgot Password?
      </Text>

      <Text
        style={styles.linkText}
        onPress={() => router.push("/(auth)/register")}
      >
        Don&apos;t have an account? Register
      </Text>
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
    marginBottom: 30,
    color: "#333",
  },
  linkText: {
    textAlign: "center",
    marginTop: 20,
    color: "#FF8C42",
    fontWeight: "500",
  },
});