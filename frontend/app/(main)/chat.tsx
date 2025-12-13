import BubbleMessage from "@/components/UI/Chat/BubbleMessage";
import TypingBubble from "@/components/UI/Chat/TypingBubble";
import { createSession, getAIMessage2 } from "@/services/chat";
import useAuthStore from "@/store/auth.store";
import { useMessageStore } from "@/store/message.store";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { Link, useLocalSearchParams } from "expo-router";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  FlatList,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  ExpoSpeechRecognitionModule,
  useSpeechRecognitionEvent,
} from "expo-speech-recognition";
import { useThemeStore } from "@/store/theme.store";

const ChatScreen = () => {
  const inputRef = React.useRef<TextInput>(null);
  const flatListRef = useRef<FlatList>(null);
  const [isResponding, setIsResponding] = useState(false);
  const [message, setMessage] = useState("");
  const [sessionId, setSessionId] = useState<string | null>(null);

  const user = useAuthStore((state) => state.user);

  const messages = useMessageStore((state) => state.messages);
  const addMessage = useMessageStore((state) => state.addMessage);
  const resetMessages = useMessageStore((state) => state.resetMessages);

  const [recognizing, setRecognizing] = useState(false);
  const [transcript, setTranscript] = useState("");

  const { theme } = useThemeStore();
  const { query } = useLocalSearchParams<{ query?: string }>();

  useEffect(() => {
    const showSub = Keyboard.addListener("keyboardDidShow", () => {});
    const hideSub = Keyboard.addListener("keyboardDidHide", () => {});
    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  useEffect(() => {
    async function initSession() {
      if (!user?.id) return;
      console.log("Initializing chat session for user:", user.id);
      resetMessages();
      try {
        const session = await createSession(user.id);
        setSessionId(session?.id || null);
        console.log("Created chat session:", session);
      } catch (err) {
        console.warn("Failed to create chat session:", err);
      }
    }
    initSession();
  }, [user?.id, resetMessages]);

  const scrollToBottom = () => {
    if (flatListRef.current) {
      flatListRef.current.scrollToEnd({ animated: true });
    }
  };

  const handleSendMessage = useCallback(
    (messageText?: string) => {
      const textToSend = messageText ?? message;
      if (textToSend.trim() === "" || isResponding) return;
      setIsResponding(true);
      addMessage(textToSend.trim(), user?.id || null);
      setTimeout(() => scrollToBottom(), 100);
      getAIMessage2({
        sessionId: sessionId || "",
        senderId: user?.id || "",
        content: textToSend.trim(),
        senderType: "user",
      }).then((response) => {
        console.log("AI response:", response);
        addMessage(response.content, null);
        setIsResponding(false);
      });
      setMessage("");
    },
    [message, isResponding, user?.id, sessionId, addMessage]
  );

  useSpeechRecognitionEvent("start", () => {
    setRecognizing(true);
    setTranscript("");
  });
  useSpeechRecognitionEvent("end", () => {
    setRecognizing(false);
    setMessage(transcript);
  });
  useSpeechRecognitionEvent("result", (event) => {
    setTranscript(event.results[0]?.transcript ?? "");
  });
  useSpeechRecognitionEvent("error", (event) => {
    console.log("Speech error:", event.error, event.message);
  });

  // --- Start Speech Recognition ---
  const handleStart = async () => {
    const result = await ExpoSpeechRecognitionModule.requestPermissionsAsync();
    if (!result.granted) {
      console.warn("Permissions not granted", result);
      return;
    }

    // Start speech recognition
    ExpoSpeechRecognitionModule.start({
      lang: "vi-VN",
      interimResults: true,
      continuous: false,
    });
  };

  // --- Stop Speech Recognition ---
  const handleStop = () => {
    ExpoSpeechRecognitionModule.stop();
  };

  useEffect(() => {
    if (query && sessionId) {
      handleSendMessage(query);
    }
  }, [query, sessionId, handleSendMessage]);

  return (
    <SafeAreaView edges={["top"]} className="flex-1 bg-background">
      <StatusBar barStyle="light-content" />
      <LinearGradient
        colors={
          theme === "dark"
            ? ["rgba(5, 12, 156, 0.3)", "rgba(5, 12, 156, 0.05)"] // Navy blue fade
            : ["rgba(53, 114, 239, 0.5)", "rgba(58, 190, 249, 0.1)"] // Blue to Sea fade
        }
        style={StyleSheet.absoluteFill}
        locations={[0, 0.6]}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 0.8 }}
      />
      {/* Layer 2: Lighter blue glow from top-right */}
      <LinearGradient
        colors={
          theme === "dark"
            ? ["rgba(53, 114, 239, 0.2)", "rgba(0, 0, 0, 0)"] // Medium blue fade
            : ["rgba(58, 190, 249, 0.4)", "rgba(167, 230, 255, 0)"] // Sea to Cold fade
        }
        style={StyleSheet.absoluteFill}
        locations={[0, 1]}
        start={{ x: 0.8, y: 0 }}
        end={{ x: 0.5, y: 0.7 }}
      />
      {/* KAV là cha bọc toàn bộ nội dung cần điều chỉnh */}
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === "ios" ? "padding" : "padding"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 20 : 20}
      >
        {/* View này chứa toàn bộ nội dung (header, list, input) */}
        <View className="flex-1 p-5">
          {/* Nền Gradient (vẫn dùng absolute) */}
          <Link
            href={"/"}
            push
            className="absolute bg-black/20 left-6 rounded-full p-2 z-10 "
          >
            <Ionicons name="close" size={22} color="white" />
          </Link>

          {messages.length === 0 && (
            <View className="flex-1">
              <View className="items-center justify-center mt-12 mb-4">
                <View className="bg-white rounded-full w-14 h-14 items-center justify-center mb-3 shadow-md">
                  <Ionicons
                    name="sparkles-sharp"
                    size={32}
                    color={theme === "dark" ? "#a78bfa" : "#3b82f6"} // #a78bfa = purple-400, #3b82f6 = blue-500
                  />
                </View>
                <Text className="text-4xl font-bold text-white">Hey, Eva!</Text>
                <Text className="text-4xl font-bold text-white ">
                  How can I{" "}
                  <Text
                    className={`${
                      theme === "dark" ? "text-purple-500" : "text-blue-500"
                    }`}
                  >
                    help you?
                  </Text>
                </Text>
              </View>

              <ScrollView className="pt-6" showsVerticalScrollIndicator={false}>
                {/* Thẻ 1: Appointment book */}
                <TouchableOpacity
                  className="bg-white p-4 rounded-2xl flex-row items-center mb-4 shadow-sm shadow-black/10"
                  style={{ elevation: 3 }} // elevation cho shadow Android
                >
                  <View className="bg-purple-100 p-3 rounded-lg mr-4">
                    <Ionicons
                      name="calendar-outline"
                      size={24}
                      color="#8A2BE2"
                    />
                  </View>
                  <View className="flex-1">
                    <Text className="font-bold text-base">
                      Appointment book
                    </Text>
                    <Text className="text-gray-500 text-sm">
                      Book an appointment with ease & stay organized
                    </Text>
                  </View>
                </TouchableOpacity>

                {/* Thẻ 2: Meds reminder */}
                <TouchableOpacity
                  className="bg-white p-4 rounded-2xl flex-row items-center mb-4 shadow-sm shadow-black/10"
                  style={{ elevation: 3 }}
                >
                  <View className="bg-purple-100 p-3 rounded-lg mr-4">
                    <Ionicons name="alarm-outline" size={24} color="#8A2BE2" />
                  </View>
                  <View className="flex-1">
                    <Text className="font-bold text-base">Meds reminder</Text>
                    <Text className="text-gray-500 text-sm">
                      Set timely reminders to take your medication
                    </Text>
                  </View>
                </TouchableOpacity>

                {/* Thẻ 3: Add to to-do list */}
                <TouchableOpacity
                  className="bg-white p-4 rounded-2xl flex-row items-center mb-4 shadow-sm shadow-black/10"
                  style={{ elevation: 3 }}
                >
                  <View className="bg-blue-100 p-3 rounded-lg mr-4">
                    <Ionicons name="list-outline" size={24} color="#007AFF" />
                  </View>
                  <View className="flex-1">
                    <Text className="font-bold text-base">
                      Add to to-do list
                    </Text>
                    <Text className="text-gray-500 text-sm">
                      Quickly add tasks to your to-do list
                    </Text>
                  </View>
                </TouchableOpacity>
              </ScrollView>
            </View>
          )}

          {messages.length > 0 && (
            <FlatList
              ref={flatListRef}
              data={messages}
              renderItem={({ item }) => (
                <BubbleMessage author={item.author} message={item.text} />
              )}
              keyExtractor={(_, index) => index.toString()}
              className="flex-1 mt-12"
              showsVerticalScrollIndicator={false}
              extraData={isResponding}
              ListFooterComponent={() =>
                isResponding ? <TypingBubble /> : null
              }
              onContentSizeChange={() =>
                flatListRef.current?.scrollToEnd({ animated: true })
              }
              onLayout={() =>
                flatListRef.current?.scrollToEnd({ animated: true })
              }
            />
          )}

          {/* Thanh Input (nằm ở cuối KAV) */}
          <View className="bg-transparent mt-2">
            <View
              className="bg-white rounded-full flex-row items-center p-2 shadow-2xl shadow-black/20"
              style={{ elevation: 10 }}
            >
              <TextInput
                ref={inputRef}
                className="flex-1 text-gray-800 pl-4 text-base"
                placeholder="Type a message..."
                placeholderTextColor="#9CA3AF"
                value={message}
                onChangeText={setMessage}
                returnKeyType="send"
                onSubmitEditing={() => handleSendMessage()}
              />
              <TouchableOpacity
                className={`${
                  theme === "dark" ? "bg-purple-500" : "bg-blue-500"
                } rounded-full w-10 h-10 items-center justify-center`}
                onPress={() => handleSendMessage()}
              >
                {message.trim() === "" ? (
                  recognizing ? (
                    <Ionicons
                      name="mic-off"
                      size={20}
                      color="white"
                      onPress={handleStop}
                    />
                  ) : (
                    <Ionicons
                      name="mic"
                      size={20}
                      color="white"
                      onPress={handleStart}
                    />
                  )
                ) : (
                  <Ionicons name="send" size={20} color="white" />
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default ChatScreen;
