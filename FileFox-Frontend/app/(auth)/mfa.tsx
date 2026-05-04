import { router, useLocalSearchParams, useRootNavigationState } from "expo-router";
import { useEffect, useState } from "react";
import { Alert, Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import api from "../../src/api/apiClient";
import { useAuth } from "../../src/hooks/useAuth";

export default function MFA() {
  const { mfaToken } = useLocalSearchParams<{ mfaToken: string }>();
  const rootNavigationState = useRootNavigationState();

  const { setSession } = useAuth();

  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);

  // ✅ FIX: wait for router to be mounted
  useEffect(() => {
    const timeout = setTimeout(() => {
      if (!mfaToken) {
        router.replace("/(auth)/login");
      }
    }, 50);

    return () => clearTimeout(timeout);
  }, [mfaToken]);

  const verify = async () => {
    if (!mfaToken) return;

    if (code.length !== 6) {
      Alert.alert("Error", "Enter 6-digit code");
      return;
    }

    try {
      setLoading(true);

      const res = await api.post("/auth/login/mfa", {
        code,
        mfaToken,
      });

      await setSession(res.data.AccessToken, res.data.RefreshToken);

      router.replace("/(protected)/(user)/home");
    } catch (err) {
      console.log(err);
      Alert.alert("Invalid MFA code");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>MFA Verification</Text>

      <TextInput
        style={styles.input}
        placeholder="Enter 6-digit code"
        value={code}
        onChangeText={setCode}
        keyboardType="number-pad"
        maxLength={6}
      />

      <Pressable style={styles.button} onPress={verify}>
        <Text style={styles.buttonText}>
          {loading ? "Verifying..." : "Verify"}
        </Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FFE7D1", justifyContent: "center", padding: 25 },
  title: { fontSize: 28, fontWeight: "bold", textAlign: "center", marginBottom: 30 },
  input: { backgroundColor: "#fff", padding: 14, borderRadius: 10, marginBottom: 12, borderWidth: 1, borderColor: "#FFD2A6", textAlign: "center", letterSpacing: 4 },
  button: { backgroundColor: "#FF8C42", padding: 14, borderRadius: 10, alignItems: "center" },
  buttonText: { color: "#fff", fontWeight: "600" }
});