import { Stack } from "expo-router";
import { useAuth } from "../src/hooks/useAuth";

export default function RootLayout() {
  const { loading } = useAuth();

  if (loading) return null;

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(auth)" />
      <Stack.Screen name="(protected)" />
      <Stack.Screen name="modal" />
    </Stack>
  );
}