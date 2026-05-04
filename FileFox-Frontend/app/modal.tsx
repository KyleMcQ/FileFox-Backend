import { View, Text, Button } from "react-native";
import { router } from "expo-router";

export default function Modal() {
  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#000000aa" }}>
      <View style={{ padding: 20, backgroundColor: "white", borderRadius: 10 }}>
        <Text>Quick Action Modal</Text>

        <Button title="Close" onPress={() => router.back()} />
      </View>
    </View>
  );
}