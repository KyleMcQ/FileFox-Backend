import { useEffect, useState } from "react";
import {
    Alert,
    Image,
    Modal,
    Pressable,
    StyleSheet,
    Text,
    TextInput
} from "react-native";
import PrimaryButton from "../../components/primaryButton";
import api from "../../src/api/apiClient";

export default function MfaSetupModal({
  visible,
  onClose,
  onSuccess,
}: {
  visible: boolean;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [manualKey, setManualKey] = useState("");
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(true);

  // Load MFA setup when modal opens
  useEffect(() => {
    if (!visible) return;

    const load = async () => {
      setLoading(true);
      try {
        const res = await api.post("/auth/mfa/setup");

        setQrCode(res.data.qrCodeUrl);
        setManualKey(res.data.manualKey);
      } catch (err) {
        console.log("MFA SETUP ERROR:", err);
        Alert.alert("Error", "Failed to load MFA setup");
        onClose();
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [visible]);

  const verify = async () => {
    if (code.length < 6) {
      Alert.alert("Invalid Code", "Enter 6-digit code");
      return;
    }

    try {
      await api.post("/auth/mfa/verify-setup", { code });

      Alert.alert("Success", "MFA Enabled");

      setCode("");
      onSuccess(); // continue login flow
    } catch (err) {
      console.log("VERIFY ERROR:", err);
      Alert.alert("Error", "Invalid code");
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Pressable style={styles.modal} onPress={() => {}}>
          <Text style={styles.title}>Set up MFA</Text>

          {loading ? (
            <Text>Loading...</Text>
          ) : (
            <>
              {qrCode && (
                <Image source={{ uri: qrCode }} style={styles.qr} />
              )}

              <Text style={styles.label}>Manual Key</Text>
              <Text selectable style={styles.key}>
                {manualKey}
              </Text>

              <Text style={styles.label}>Enter 6-digit code</Text>
              <TextInput
                value={code}
                onChangeText={setCode}
                keyboardType="number-pad"
                maxLength={6}
                style={styles.input}
              />

              <PrimaryButton title="Enable MFA" onPress={verify} />
            </>
          )}
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "center",
    padding: 20,
  },

  modal: {
    backgroundColor: "#fff",
    borderRadius: 15,
    padding: 20,
  },

  title: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 15,
    textAlign: "center",
  },

  qr: {
    width: 180,
    height: 180,
    alignSelf: "center",
    marginBottom: 15,
  },

  label: {
    fontWeight: "600",
    marginTop: 10,
  },

  key: {
    backgroundColor: "#f3f3f3",
    padding: 10,
    borderRadius: 8,
    marginTop: 5,
  },

  input: {
    backgroundColor: "#f3f3f3",
    padding: 12,
    borderRadius: 10,
    marginTop: 10,
    marginBottom: 15,
    textAlign: "center",
  },
});