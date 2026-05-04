import { Stack, useRouter, useSegments } from "expo-router";
import { useEffect } from "react";
import { AuthProvider } from "../src/context/authContext";
import { useAuth } from "../src/hooks/useAuth";

function RouterGuard() {
  const { accessToken, loading } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;

    const inAuthGroup = segments[0] === "(auth)";
    const inProtectedGroup = segments[0] === "(protected)";

    if (!accessToken && inProtectedGroup) {
      router.replace("/(auth)/login");
    }

    if (accessToken && inAuthGroup) {
      router.replace("/(protected)/(user)/home");
    }
  }, [accessToken, segments, loading]);

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(auth)" />
      <Stack.Screen name="(protected)" />
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <RouterGuard />
    </AuthProvider>
  );
}