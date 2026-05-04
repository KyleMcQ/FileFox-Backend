import * as ImagePicker from "expo-image-picker";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import api from "../../../src/api/apiClient";

type UserState = {
  name: string;
  email: string;
  role: string;
  avatar: string | null;
  mfaEnabled?: boolean;
};

export default function Account() {
  const [user, setUser] = useState<UserState | null>(null);
  const [loading, setLoading] = useState(true);

  // MFA STATE
  const [showMfaSetup, setShowMfaSetup] = useState(false);
  const [mfaCode, setMfaCode] = useState("");
  const [qrUri, setQrUri] = useState<string | null>(null);
  const [mfaSecret, setMfaSecret] = useState<string | null>(null);
  const [settingUp, setSettingUp] = useState(false);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const res = await api.get("/auth/me");
        setUser(res.data);
      } catch (err) {
        console.log("Failed to load user:", err);
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, []);

  /* ================= PROFILE ================= */

  const pickImage = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permission.granted) {
      Alert.alert("Permission required", "Allow photo access");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled && user) {
      setUser({ ...user, avatar: result.assets[0].uri });
    }
  };

  const handleSave = async () => {
    if (!user) return;

    try {
      await api.put("/auth/me", {
        name: user.name,
        email: user.email,
        avatar: user.avatar,
      });

      Alert.alert("Success", "Account updated");
    } catch (err) {
      console.log("UPDATE ERROR:", err);
      Alert.alert("Error", "Failed to update account");
    }
  };

  /* ================= MFA SETUP ================= */

  const openMfaSetup = async () => {
    try {
      setSettingUp(true);
      setShowMfaSetup(true);

      const res = await api.post("/auth/mfa/setup");

      // backend correct fields
      setQrUri(res.data.otpAuthUri);
      setMfaSecret(res.data.base32Secret);
    } catch (err) {
      console.log("MFA setup error:", err);
      Alert.alert("Error", "Failed MFA setup");
      setShowMfaSetup(false);
    } finally {
      setSettingUp(false);
    }
  };

  const verifyMfaSetup = async () => {
    if (mfaCode.length !== 6) {
      Alert.alert("Error", "Enter 6-digit code");
      return;
    }

    try {
      await api.post("/auth/mfa/verify", {
        code: mfaCode,
      });

      Alert.alert("Success", "MFA enabled");

      setUser((u) => (u ? { ...u, mfaEnabled: true } : u));

      setShowMfaSetup(false);
      setMfaCode("");
      setQrUri(null);
      setMfaSecret(null);
    } catch (err) {
      console.log("VERIFY ERROR:", err);
      Alert.alert("Error", "Invalid MFA code");
    }
  };

  /* ================= UI ================= */

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
        <Text>Failed to load user</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Account Settings</Text>

      {/* AVATAR */}
      <View style={styles.avatarContainer}>
        <Pressable onPress={pickImage} style={styles.avatarWrapper}>
          <View style={styles.avatar}>
            {user.avatar ? (
              <Image source={{ uri: user.avatar }} style={styles.avatarImage} />
            ) : (
              <Text style={styles.initial}>{user.name?.charAt(0)}</Text>
            )}
          </View>
          <Text style={styles.changeText}>Change Photo</Text>
        </Pressable>
      </View>

      {/* INPUTS */}
      <TextInput
        style={styles.input}
        value={user.name}
        onChangeText={(t) => setUser({ ...user, name: t })}
      />

      <TextInput
        style={styles.input}
        value={user.email}
        onChangeText={(t) => setUser({ ...user, email: t })}
      />

      {/* MFA STATUS */}
      <Text style={{ marginBottom: 10 }}>
        MFA: {user.mfaEnabled ? "Enabled" : "Disabled"}
      </Text>

      <Pressable
        style={[
          styles.button,
          { backgroundColor: user.mfaEnabled ? "#666" : "#111827" },
        ]}
        onPress={openMfaSetup}
        disabled={user.mfaEnabled}
      >
        <Text style={styles.buttonText}>
          {user.mfaEnabled ? "MFA Enabled" : "Enable MFA"}
        </Text>
      </Pressable>

      <Pressable style={[styles.button, { marginTop: 10 }]} onPress={handleSave}>
        <Text style={styles.buttonText}>Save Changes</Text>
      </Pressable>

      {/* MFA MODAL */}
      <Modal visible={showMfaSetup} transparent animationType="slide">
        <View style={styles.modalBg}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>MFA Setup</Text>

            {settingUp ? (
              <ActivityIndicator size="large" color="#FF8C42" />
            ) : (
              <>
                {qrUri && (
                  <Image
                    source={{ uri: qrUri }}
                    style={{ width: 180, height: 180, alignSelf: "center" }}
                  />
                )}

                <Text style={styles.modalText}>
                  Scan QR in Authenticator App
                </Text>

                <TextInput
                  value={mfaCode}
                  onChangeText={setMfaCode}
                  placeholder="6-digit code"
                  keyboardType="number-pad"
                  maxLength={6}
                  style={styles.input}
                />

                <Pressable style={styles.button} onPress={verifyMfaSetup}>
                  <Text style={styles.buttonText}>Verify</Text>
                </Pressable>

                <Pressable onPress={() => setShowMfaSetup(false)}>
                  <Text style={styles.cancelText}>Cancel</Text>
                </Pressable>
              </>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
}

/* ================= STYLES ================= */

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

  avatarContainer: {
    alignItems: "center",
    marginBottom: 20,
  },

  avatarWrapper: {
    alignItems: "center",
  },

  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "#ccc",
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
  },

  avatarImage: {
    width: "100%",
    height: "100%",
  },

  initial: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#fff",
  },

  changeText: {
    marginTop: 8,
    color: "#FF8C42",
  },

  input: {
    backgroundColor: "#fff",
    padding: 12,
    borderRadius: 10,
    marginBottom: 10,
  },

  button: {
    backgroundColor: "#FF8C42",
    padding: 14,
    borderRadius: 10,
    alignItems: "center",
  },

  buttonText: {
    color: "#fff",
    fontWeight: "bold",
  },

  modalBg: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    padding: 20,
  },

  modalBox: {
    backgroundColor: "white",
    padding: 20,
    borderRadius: 15,
  },

  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 10,
  },

  modalText: {
    marginTop: 10,
    fontSize: 12,
    textAlign: "center",
  },

  cancelText: {
    textAlign: "center",
    marginTop: 10,
    color: "#FF8C42",
  },
});