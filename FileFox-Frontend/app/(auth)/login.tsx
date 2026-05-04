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

      if (!res?.accessToken) {
        Alert.alert("Login failed");
        return;
      }

      // 1. store token first
      await setSession(res.accessToken, res.refreshToken);

      // 2. force API to use new token immediately
      const me = await api.get("/auth/me");

      // 3. overwrite user in context (THIS FIXES DRAWER)
      await setSession(
        res.accessToken,
        res.refreshToken,
        me.data
      );

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
  },
});