import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { Link, useRouter } from "expo-router";
import React from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const ChatScreen = () => {
  const router = useRouter();
  return (
    <SafeAreaView className="flex-1 bg-transparent p-5">
      <TouchableOpacity
        onPress={() => router.back()} className="absolute left-6 bg-black/20 rounded-full p-2 z-10">
        <Ionicons name="close" size={22} color="white" />
      </TouchableOpacity>

      {/* Logo */}

      <View
        className="bg-white rounded-full w-14 h-14 items-center justify-center mt-20 mb-3  shadow-md"
      >
        {/* Thay bằng logo của bạn, ở đây dùng icon sparkles */}
        <Ionicons name="sparkles-sharp" size={32} color="#FF6347" />
      </View>

      {/* Chữ chào mừng */}
      <Text className="text-4xl font-bold text-white">Hey, Eva!</Text>
      <Text className="text-4xl font-bold text-white ">
        How can I <Text className="text-red-500">help you?</Text>
      </Text>

      {/* 2. PHẦN NỘI DUNG (CÁC THẺ) */}
      <ScrollView className="pt-6" showsVerticalScrollIndicator={false}>
        {/* Thẻ 1: Appointment book */}
        <TouchableOpacity
          className="bg-white p-4 rounded-2xl flex-row items-center mb-4 shadow-sm shadow-black/10"
          style={{ elevation: 3 }} // elevation cho shadow Android
        >
          <View className="bg-purple-100 p-3 rounded-lg mr-4">
            <Ionicons name="calendar-outline" size={24} color="#8A2BE2" />
          </View>
          <View className="flex-1">
            <Text className="font-bold text-base">Appointment book</Text>
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
            <Text className="font-bold text-base">Add to to-do list</Text>
            <Text className="text-gray-500 text-sm">
              Quickly add tasks to your to-do list
            </Text>
          </View>
        </TouchableOpacity>

        {/* Khoảng trống ảo để cuộn không bị che bởi thanh bottom bar */}
        <View className="h-24" />
      </ScrollView>

      {/* 3. THANH BOTTOM BAR (NỔI) */}
      <View className="absolute bottom-10 left-0 right-0 px-6 py-4 bg-transparent">
        <View
          className="bg-white rounded-full flex-row items-center p-2 shadow-2xl shadow-black/20"
          style={{ elevation: 10 }} // Shadow mạnh cho Android
        >
          <Text className="flex-1 text-gray-400 pl-4 text-base">
            Ask anything about your health?
          </Text>
          <TouchableOpacity className="bg-red-500 rounded-full w-10 h-10 items-center justify-center">
            <Ionicons name="mic" size={24} color="white" />
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default ChatScreen;
