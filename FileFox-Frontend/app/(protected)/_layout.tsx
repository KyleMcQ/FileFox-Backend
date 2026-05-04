import { Feather, Ionicons, MaterialIcons } from "@expo/vector-icons";
import { DrawerContentScrollView, DrawerItem } from "@react-navigation/drawer";
import { router } from "expo-router";
import { Drawer } from "expo-router/drawer";
import { Pressable, StyleSheet, Text, View } from "react-native";

import MenuButton from "../../components/menuButton";
import { useAuth } from "../../src/hooks/useAuth";

export default function ProtectedLayout() {
  const { logoutUser, user } = useAuth();

  const isAdmin = user?.role?.toLowerCase() === "admin";

  return (
    <Drawer
      screenOptions={{
        headerTitle: "FileFox",
        headerStyle: { backgroundColor: "#F59E0B" },
        headerTintColor: "#fff",
        headerLeft: () => <MenuButton />,
        drawerStyle: { backgroundColor: "#FFF7ED" },
        drawerActiveBackgroundColor: "#FF8C42",
        drawerActiveTintColor: "#fff",
        drawerInactiveTintColor: "#374151",
      }}
      drawerContent={(props) => (
        <DrawerContentScrollView {...props}>
          {/* PROFILE */}
          <View style={styles.profile}>
            <View style={styles.avatar} />

            {/* FIXED: correct casing + fallback */}
            <Text style={styles.name}>
              {user?.userName ?? "Guest"}
            </Text>

            <Text style={styles.email}>
              {user?.email ?? ""}
            </Text>
          </View>

          {/* USER SECTION */}
          <Text style={styles.section}>USER</Text>

          <DrawerItem
            label="Dashboard"
            icon={({ color, size }) => (
              <Ionicons name="home-outline" size={size} color={color} />
            )}
            onPress={() => router.push("/(protected)/(user)/home")}
          />

          <DrawerItem
            label="My Files"
            icon={({ color, size }) => (
              <Ionicons name="folder-outline" size={size} color={color} />
            )}
            onPress={() =>
              router.push("/(protected)/(user)/files/filesList")
            }
          />

          <DrawerItem
            label="Activity"
            icon={({ color, size }) => (
              <Ionicons name="notifications-outline" size={size} color={color} />
            )}
            onPress={() => router.push("/(protected)/(user)/activity")}
          />

          <DrawerItem
            label="My Account"
            icon={({ color, size }) => (
              <Ionicons name="person-outline" size={size} color={color} />
            )}
            onPress={() => router.push("/(protected)/(user)/account")}
          />

          <DrawerItem
            label="File Access"
            icon={({ color, size }) => (
              <Feather name="lock" size={size} color={color} />
            )}
            onPress={() =>
              router.push("/(protected)/(user)/files/fileAccess")
            }
          />

          {/* ADMIN SECTION */}
          {isAdmin && (
            <>
              <Text style={styles.section}>ADMIN</Text>

              <DrawerItem
                label="Dashboard"
                icon={({ color, size }) => (
                  <Ionicons name="speedometer-outline" size={size} color={color} />
                )}
                onPress={() =>
                  router.push("/(protected)/(admin)/dashboard")
                }
              />

              <DrawerItem
                label="Users"
                icon={({ color, size }) => (
                  <Ionicons name="people-outline" size={size} color={color} />
                )}
                onPress={() =>
                  router.push("/(protected)/(admin)/users")
                }
              />

              <DrawerItem
                label="System Logs"
                icon={({ color, size }) => (
                  <MaterialIcons name="bug-report" size={size} color={color} />
                )}
                onPress={() =>
                  router.push("/(protected)/(admin)/adminLogs")
                }
              />
            </>
          )}

          {/* LOGOUT */}
          <View style={styles.logoutWrap}>
            <Pressable
              style={styles.logoutBtn}
              onPress={async () => {
                await logoutUser();
                router.replace("/(auth)/login");
              }}
            >
              <Text style={{ color: "#fff", fontWeight: "600" }}>
                Logout
              </Text>
            </Pressable>
          </View>
        </DrawerContentScrollView>
      )}
    />
  );
}

/* ================= STYLES ================= */

const styles = StyleSheet.create({
  profile: {
    padding: 20,
    alignItems: "center",
    borderBottomWidth: 1,
    borderColor: "#FED7AA",
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#FF8C42",
    marginBottom: 10,
  },
  name: {
    fontSize: 18,
    fontWeight: "bold",
  },
  email: {
    fontSize: 13,
    color: "#6B7280",
  },
  section: {
    marginTop: 15,
    marginLeft: 15,
    fontSize: 12,
    fontWeight: "bold",
    color: "#9CA3AF",
  },
  logoutWrap: {
    marginTop: 20,
    paddingHorizontal: 20,
  },
  logoutBtn: {
    backgroundColor: "#EF4444",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
  },
});