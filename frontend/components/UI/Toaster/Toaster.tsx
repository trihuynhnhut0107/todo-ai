import { View, Text, TouchableOpacity, Pressable } from "react-native";
import React from "react";
import FlashMessage, {
  hideMessage,
  MessageOptions,
} from "react-native-flash-message";
import useThemeColor from "@/hooks/useThemeColor";
import { Ionicons } from "@expo/vector-icons";

const Toaster = () => {
  const colors = useThemeColor();
  return (
    <FlashMessage
      position="top"
      floating
      duration={4000}
      MessageComponent={(props: MessageOptions) => {
        // Type-safe message handling
        const message = props.message as
          | string
          | { message?: string; type?: string; description?: string };

        const messageText =
          typeof message === "string"
            ? message
            : message?.message || props.description || "Notification";

        const messageType =
          typeof message === "string"
            ? "info"
            : message?.type || props.type || "info";

        // Icon and color configuration based on type
        const getIconAndColor = () => {
          switch (messageType) {
            case "danger":
            case "error":
              return {
                iconName: "close-circle" as const,
                color: colors.error,
                title: "Error",
              };
            case "success":
              return {
                iconName: "checkmark-circle" as const,
                color: colors.success,
                title: "Success",
              };
            case "warning":
              return {
                iconName: "warning" as const,
                color: "#FF9500",
                title: "Warning",
              };
            case "info":
            default:
              return {
                iconName: "information-circle" as const,
                color: "#007AFF",
                title: "Info",
              };
          }
        };

        const { iconName, color: iconColor, title } = getIconAndColor();

        return (
          <Pressable
            onPress={() => {
              if (messageType === "danger") hideMessage();
            }}
            style={{
              gap: 4,
              backgroundColor: colors.card,
              borderWidth: 1.5,
              borderColor:
                messageType === "danger" ? colors.error : colors.success,
              padding: 8,
              borderRadius: 8,
              marginHorizontal: 16,
              marginTop: 50,
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.25,
              shadowRadius: 3.84,
              elevation: 5,
            }}
          >
            <View
              style={{ flexDirection: "row", alignItems: "center", gap: 8 }}
            >
              <Ionicons name={iconName} size={20} color={iconColor} />
              <Text
                style={{
                  color:
                    messageType === "danger" ? colors.error : colors.success,
                  fontSize: 14,
                  fontWeight: "600",
                }}
              >
                {messageType === "danger" ? "Error" : "Success"}
              </Text>
            </View>
            <Text
              style={{
                color: colors["text-secondary"],
                fontSize: 12,
                textAlign: "justify",
              }}
            >
              {messageText}
            </Text>
          </Pressable>
        );
      }}
    />
  );
};

export default Toaster;
