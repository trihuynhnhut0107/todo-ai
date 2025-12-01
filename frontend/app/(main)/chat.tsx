import BubbleMessage from "@/components/UI/Chat/BubbleMessage";
import TypingBubble from "@/components/UI/Chat/TypingBubble";
import {
  getAIMessage2,
  getCachedSession,
  getOrCreateSession
} from "@/services/chat";
import useAuthStore from "@/store/auth.store";
import { useMessageStore } from "@/store/message.store";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { Link } from "expo-router";
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

import {
  ExpoSpeechRecognitionModule,
  useSpeechRecognitionEvent,
} from "expo-speech-recognition";
import { set } from "date-fns";

const ChatScreen = () => {
  const inputRef = React.useRef<TextInput>(null);
  const [isResponding, setIsResponding] = useState(false);
  const [message, setMessage] = useState("");

  const user = useAuthStore((state) => state.user);

  const messages = useMessageStore((state) => state.messages);
  const addMessage = useMessageStore((state) => state.addMessage);

  const [recognizing, setRecognizing] = useState(false);
  const [transcript, setTranscript] = useState("");

  useEffect(() => {
    const showSub = Keyboard.addListener("keyboardDidShow", () => {});
    const hideSub = Keyboard.addListener("keyboardDidHide", () => {});
    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  useEffect(() => {
    let mounted = true;
    async function initSession() {
      if (!user?.id) return;
      console.log("Initializing chat session for user:", user.id);
      const cached = getCachedSession();
      if (cached && cached.userId === user.id) {
        console.log("Using cached chat session:", cached);
        return;
      }
      try {
        const session = await getOrCreateSession(user.id);
        console.log("Created chat session:", session);
      } catch (err) {
        console.warn("Failed to create chat session:", err);
      }
    }
    initSession();
    return () => {
      mounted = false;
    };
  }, [user?.id]);

  const handleSendMessage = () => {
    if (message.trim() === "") return;
    setIsResponding(true);
    addMessage(message.trim(), user?.id || null);
    getAIMessage2({
      sessionId: getCachedSession()?.id || "",
      senderId: user?.id || "",
      content: message.trim(),
      senderType: "user",
      metadata: {
        additionalProp1: "string",
        additionalProp2: "string",
        additionalProp3: "string",
      },
    }).then((response) => {
      console.log("AI response:", response);
      addMessage(response.content, null);
      setIsResponding(false);
    });
    setMessage("");
  };

  useSpeechRecognitionEvent("start", () => {setRecognizing(true);setTranscript("");});
  useSpeechRecognitionEvent("end", () => {setRecognizing(false);setMessage(transcript);});
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
      lang: "vi-VN", // đổi sang tiếng Việt
      interimResults: true, // nhận partial text
      continuous: false,   // false nếu muốn tự stop sau khi nói xong
    });
  };

  // --- Stop Speech Recognition ---
  const handleStop = () => {
    ExpoSpeechRecognitionModule.stop();
  };

  return (
    <View className="flex-1 bg-white">
      <StatusBar barStyle="light-content" />
      <LinearGradient
        pointerEvents="none"
        colors={["rgba(255, 120, 70, 0.5)", "rgba(255, 120, 70, 0.1)"]}
        style={StyleSheet.absoluteFillObject}
        locations={[0, 0.6]}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 0.8 }}
      />
      <LinearGradient
        pointerEvents="none"
        colors={["rgba(255, 100, 100, 0.3)", "transparent"]}
        style={StyleSheet.absoluteFillObject}
        locations={[0, 1]}
        start={{ x: 0.8, y: 0 }}
        end={{ x: 0.5, y: 0.7 }}
      />
      {/* KAV là cha bọc toàn bộ nội dung cần điều chỉnh */}
      <KeyboardAvoidingView
        className="flex-1"
        // SỬA LỖI 1: Chỉ định behavior cho Android
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        // SỬA LỖI 2: Bỏ keyboardVerticalOffset={500}
        // Thêm offset nếu có header CỐ ĐỊNH, ở đây header cuộn theo nên không cần
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 0}
      >
        {/* View này chứa toàn bộ nội dung (header, list, input) */}
        <View className="flex-1 p-5">
          {/* Nền Gradient (vẫn dùng absolute) */}

          {/* Nút Close (vẫn dùng absolute, điều chỉnh top) */}
          <Link
            href={"/"}
            push
            className="absolute bg-black/20 left-6 rounded-full p-2 z-10 top-10"
          >
            <Ionicons name="close" size={22} color="white" />
          </Link>

          {messages.length === 0 && (
            <View className="flex-1">
              <View className="items-center justify-center mt-12 mb-4">
                <View className="bg-white rounded-full w-14 h-14 items-center justify-center mb-3 shadow-md">
                  <Ionicons name="sparkles-sharp" size={32} color="#FF6347" />
                </View>
                <Text className="text-4xl font-bold text-white">Hey, Eva!</Text>
                <Text className="text-4xl font-bold text-white ">
                  How can I <Text className="text-red-500">help you?</Text>
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
              data={messages}
              renderItem={({ item }) => (
                <BubbleMessage author={item.author} message={item.text} />
              )}
              keyExtractor={(_, index) => index.toString()}
              className="flex-1 mt-24" // SỬA LỖI 3: Thêm flex-1 để lấp đầy không gian
              showsVerticalScrollIndicator={false}
              extraData={isResponding}
              ListFooterComponent={() =>
                isResponding ? <TypingBubble /> : null
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
              />
              <TouchableOpacity
                className="bg-red-500 rounded-full w-10 h-10 items-center justify-center"
                onPress={() => handleSendMessage()}
              >
                {message.trim() === "" ? (
                  recognizing ? <Ionicons name="mic-off" size={20} color="white" onPress={handleStop} /> : <Ionicons name="mic" size={20} color="white" onPress={handleStart} />
                ) : (
                  <Ionicons name="send" size={20} color="white" />
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
};

export default ChatScreen;
