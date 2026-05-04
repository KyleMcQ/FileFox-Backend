import { Redirect } from "expo-router";
import { useAuth } from "../src/hooks/useAuth";

export default function Index() {
  const { accessToken, loading } = useAuth();

  if (loading) return null;

  if (!accessToken) {
    return <Redirect href="/(auth)/login" />;
  }

  return <Redirect href="/(protected)/(user)/home" />;
}
