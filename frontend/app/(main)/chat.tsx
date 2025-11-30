import BubbleMessage from "@/components/UI/Chat/BubbleMessage";
import TypingBubble from "@/components/UI/Chat/TypingBubble";
import { getAIMessage } from "@/services/chat";
import useAuthStore from "@/store/auth.store";
import { useMessageStore } from "@/store/message.store";
import { useThemeStore } from "@/store/theme.store";
import { Ionicons } from "@expo/vector-icons";
import { add } from "date-fns";
import { LinearGradient } from "expo-linear-gradient";
import { Link, router } from "expo-router";
import { useLocalSearchParams, useSearchParams } from "expo-router/build/hooks";
import React, { useEffect, useState } from "react";
import {
  FlatList,
  Keyboard,
  KeyboardAvoidingView,
  Platform, // Thêm StatusBar
  ScrollView, // Thêm SafeAreaView
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const ChatScreen = () => {
  const inputRef = React.useRef<TextInput>(null);
  const { query } = useLocalSearchParams();
  const [isResponding, setIsResponding] = useState(false);
  const [message, setMessage] = useState("");
  const { theme } = useThemeStore();
  const user = useAuthStore((state) => state.user);

  const messages = useMessageStore((state) => state.messages);
  const addMessage = useMessageStore((state) => state.addMessage);

  // useEffect của bạn để theo dõi keyboard (isKeyboardVisible) không cần thiết
  // vì KeyboardAvoidingView sẽ tự xử lý, nhưng cứ để đó nếu bạn cần
  useEffect(() => {
    const showSub = Keyboard.addListener("keyboardDidShow", () => {});
    const hideSub = Keyboard.addListener("keyboardDidHide", () => {});
    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  useEffect(() => {
    if (query && typeof query === "string" && query.trim() !== "") {
      // Send the query as the first message
      setIsResponding(true);
      addMessage(query.trim(), user?.id || null);
      getAIMessage(query.trim()).then((response) => {
        addMessage(response.response, null);
        setIsResponding(false);
      });
    }
  }, [query]);

  const handleSendMessage = () => {
    if (message.trim() === "") return;
    setIsResponding(true);
    addMessage(message.trim(), user?.id || null);
    getAIMessage(message.trim()).then((response) => {
      addMessage(response.response, null);
      setIsResponding(false);
    });
    setMessage("");
  };

  return (
    <View className="flex-1 ">
      <KeyboardAvoidingView
        className="flex-1 mt-4"
        // SỬA LỖI 1: Chỉ định behavior cho Android
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        // SỬA LỖI 2: Bỏ keyboardVerticalOffset={500}
        // Thêm offset nếu có header CỐ ĐỊNH, ở đây header cuộn theo nên không cần
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 0}
      >
        {/* View này chứa toàn bộ nội dung (header, list, input) */}
        <SafeAreaView className="flex-1 p-4 bg-background rounded-t-3xl">
          {/* Nền Gradient (vẫn dùng absolute) */}
          <>
            {/* Layer 1: Soft warm orange glow */}
            <LinearGradient
              colors={
                theme === "dark"
                  ? ["rgba(0, 0, 0, 0.3)", "rgba(0, 0, 0, 0.05)"]
                  : ["rgba(255, 160, 110, 0.4)", "rgba(255, 200, 170, 0.1)"]
              }
              style={StyleSheet.absoluteFill}
              locations={[0, 0.7]}
              start={{ x: 0.5, y: 0.8 }}
              end={{ x: 0.5, y: 0 }}
            />

            {/* Layer 2: Soft pink-lavender glow top-right */}
            <LinearGradient
              colors={
                theme === "dark"
                  ? ["rgba(0, 0, 0, 0.2)", "rgba(0, 0, 0, 0)"]
                  : ["rgba(255, 150, 160, 0.25)", "rgba(230, 210, 250, 0.05)"]
              }
              style={StyleSheet.absoluteFill}
              locations={[0, 1]}
              start={{ x: 0.8, y: 0.7 }}
              end={{ x: 0.5, y: 0 }}
            />
          </>
          {/* Nút Close (vẫn dùng absolute, điều chỉnh top) */}
          <TouchableOpacity
            onPress={() => router.back()}
            className="absolute bg-black/20 top-4 left-4 rounded-full p-2 z-10"
          >
            <Ionicons name="close" size={22} color="white" />
          </TouchableOpacity>

          {messages.length === 0 && (
            <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
              <View className="items-center justify-center mt-12 mb-4">
                <View className="bg-white rounded-full w-14 h-14 items-center justify-center mb-3 shadow-md">
                  <Ionicons name="sparkles-sharp" size={32} color="#FF6347" />
                </View>
                <Text className="text-4xl font-bold text-text">
                  Hey, {user?.name}!
                </Text>
                <Text className="text-2xl font-bold text-text-secondary ">
                  How can I <Text className="text-red-500">help you?</Text>
                </Text>
              </View>

              {/* Thẻ 1: Appointment book */}
              <TouchableOpacity
                className="bg-surface p-4 rounded-2xl flex-row items-center mb-4 shadow-sm shadow-black/10"
                style={{ elevation: 3 }} // elevation cho shadow Android
              >
                <View className="bg-purple-100 p-3 rounded-lg mr-4">
                  <Ionicons name="calendar-outline" size={24} color="#8A2BE2" />
                </View>
                <View className="flex-1">
                  <Text className="font-bold text-text text-base">
                    Appointment book
                  </Text>
                  <Text className="text-gray-500 text-sm text-text-secondary">
                    Book an appointment with ease & stay organized
                  </Text>
                </View>
              </TouchableOpacity>

              {/* Thẻ 2: Meds reminder */}
              <TouchableOpacity
                className="bg-surface p-4 rounded-2xl flex-row items-center mb-4 shadow-sm shadow-black/10"
                style={{ elevation: 3 }}
              >
                <View className="bg-purple-100 p-3 rounded-lg mr-4">
                  <Ionicons name="alarm-outline" size={24} color="#8A2BE2" />
                </View>
                <View className="flex-1">
                  <Text className="font-bold text-text text-base">
                    Meds reminder
                  </Text>
                  <Text className="text-gray-500 text-sm text-text-secondary">
                    Set timely reminders to take your medication
                  </Text>
                </View>
              </TouchableOpacity>

              {/* Thẻ 3: Add to to-do list */}
              <TouchableOpacity
                className="bg-surface p-4 rounded-2xl flex-row items-center mb-4 shadow-sm shadow-black/10"
                style={{ elevation: 3 }}
              >
                <View className="bg-blue-100 p-3 rounded-lg mr-4">
                  <Ionicons name="list-outline" size={24} color="#007AFF" />
                </View>
                <View className="flex-1">
                  <Text className="font-bold text-base text-text">
                    Add to to-do list
                  </Text>
                  <Text className="text-gray-500 text-sm text-text-secondary">
                    Quickly add tasks to your to-do list
                  </Text>
                </View>
              </TouchableOpacity>
            </ScrollView>
          )}

          {messages.length > 0 && (
            <FlatList
              data={messages}
              renderItem={({ item }) => (
                <BubbleMessage author={item.author} message={item.text} />
              )}
              keyExtractor={(_, index) => index.toString()}
              className="flex-1" // SỬA LỖI 3: Thêm flex-1 để lấp đầy không gian
              showsVerticalScrollIndicator={false}
              extraData={isResponding}
              ListFooterComponent={() =>
                isResponding ? <TypingBubble /> : null
              }
            />
          )}

          {/* Thanh Input (nằm ở cuối KAV) */}
          <View className="bg-transparent">
            <View
              className="bg-surface rounded-full border-2 border-border flex-row items-center p-2 shadow-2xl shadow-black/20"
              style={{ elevation: 10 }}
            >
              <TextInput
                ref={inputRef}
                className="flex-1 text-text pl-4 text-base"
                placeholder="Type a message..."
                placeholderTextColor="#9CA3AF"
                value={message}
                onChangeText={setMessage}
                returnKeyType="send"
              />
              <TouchableOpacity
                className="bg-primary rounded-full w-10 h-10 items-center justify-center"
                onPress={() => handleSendMessage()}
              >
                {message.trim() === "" ? (
                  <Ionicons name="mic-outline" size={22} color="white" />
                ) : (
                  <Ionicons name="send" size={20} color="white" />
                )}
              </TouchableOpacity>
            </View>
          </View>
        </SafeAreaView>
      </KeyboardAvoidingView>
    </View>
  );
};

export default ChatScreen;
