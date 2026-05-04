import { AntDesign } from "@expo/vector-icons";
import { useNavigation } from "expo-router";
import { Pressable } from "react-native";

export default function MenuButton() {
    const navigation = useNavigation<any>();

    return (
        <Pressable
            onPress={() => navigation.openDrawer()}
            style={{ padding: 12 }}
        >
        <AntDesign name="bars" size={24} color="white" />
        </Pressable>
    );
}