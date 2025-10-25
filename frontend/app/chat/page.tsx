import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  StyleSheet,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { FontAwesome6, Ionicons } from "@expo/vector-icons";

const Header = () => (
  <View className="flex-row justify-between items-center p-5 ">
    <View className="flex-1 gap-2">
      <View className="flex-row items-center justify-between">
        <View className="flex-row items-center gap-2">
          <FontAwesome6
            name="calendar"
            size={20}
            color="rgba(255, 255, 255, 0.7)"
          />
          <Text className="text-md text-white/70">May 25, 2025</Text>
        </View>
        <View className="ml-4 flex-row gap-3">
          <View className="w-10 h-10 bg-white/30 rounded-full flex items-center justify-center">
            <FontAwesome6 name="bell" size={20} color="white" />
          </View>
          <View className="w-10 h-10 bg-white/30 rounded-full flex items-center justify-center">
            <FontAwesome6 name="bars" size={20} color="white" />
          </View>
        </View>
      </View>
      <Text className="text-5xl font-bold text-white">
        Good afternoon, Eva Smith!
      </Text>
    </View>
  </View>
);
const SearchBar = () => (
  <View className="bg-white/95 flex-row justify-between items-center p-4 rounded-full mx-5 my-4 shadow-sm">
    <Text className="text-gray-600">Ask anything about your health?</Text>
  </View>
);
// ------------------------------------

export default function HomeScreen() {
  return (
    // 1. View gốc có MÀU NỀN CỨNG (màu xám nhạt ở dưới)
    <View className="flex-1 bg-gray-50 ">
      <StatusBar barStyle="light-content" />

      {/* === PHẦN NỀN "GIẢ LẬP" MỜ NHÒE (MỚI) === */}

      {/* Lớp 1: Vầng sáng cam-đỏ chính */}
      <LinearGradient
        // Bắt đầu bằng màu cam MỜ, mờ dần sang TRONG SUỐT
        colors={["rgba(255, 120, 70, 0.5)", "rgba(255, 120, 70, 0.1)"]}
        style={StyleSheet.absoluteFill}
        // Vị trí: 0% là màu, 60% là trong suốt
        locations={[0, 0.6]}
        // Hướng: Từ trên (y: 0) xuống dưới (y: 0.8)
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 0.8 }}
      />

      {/* Lớp 2: Vầng sáng hồng nhẹ ở trên-phải */}
      <LinearGradient
        // Bắt đầu bằng màu hồng MỜ, mờ dần sang TRONG SUỐT
        colors={["rgba(255, 100, 100, 0.3)", "transparent"]}
        style={StyleSheet.absoluteFill}
        locations={[0, 1]} // Mờ nhanh hơn
        // Hướng: Từ trên-phải (x: 0.8) chéo xuống
        start={{ x: 0.8, y: 0 }}
        end={{ x: 0.5, y: 0.7 }}
      />
      {/* === KẾT THÚC PHẦN NỀN === */}

      {/* PHẦN 1: HEADER, SEARCH, TABS */}
      {/* Các component này phải đặt SAU các gradient
          để nó nằm BÊN TRÊN gradient */}
      <View className="pb-6">
        <Header />
        <SearchBar />
      </View>

      {/* PHẦN 2: NỘI DUNG TRẮNG BÊN DƯỚI */}
      <ScrollView
        className="flex-1 p-6 -mt-6"
        // 4. Thêm style này để đảm bảo ScrollView trong suốt
        style={{ backgroundColor: "transparent" }}
        contentContainerStyle={{ paddingBottom: 100 }}
      >
        {/* Mood Card (Simplified) */}
        <View className="bg-white p-4 rounded-xl shadow-sm mb-3 flex-row items-center gap-4">
          <FontAwesome6 name="face-smile-beam" size={30} color="rgba(255, 120, 70, 1)" />
          <View>
            <Text className="text-lg font-bold">Your mood</Text>
            <Text className="text-gray-600 mt-1">
              How are you feeling now? Grateful
            </Text>
          </View>
        </View>

        {/* Meds Card */}
        <View className="flex-1 bg-white p-4 rounded-xl shadow-sm mb-3">
          <Text className="font-semibold text-gray-500">Reminder</Text>
          <Text className="font-bold text-lg text-gray-800 mt-2">Học bài</Text>
          <Text className="text-gray-500">06:00 PM</Text>
          <View className="flex-row gap-2 mt-3">
            <TouchableOpacity className="flex-row items-center bg-green-100 p-2 rounded-full">
              <FontAwesome6 name="check-circle" size={12} color="green" />
              <Text className="text-green-800 ml-1 text-xs font-semibold">
                Took
              </Text>
            </TouchableOpacity>
            <TouchableOpacity className="flex-row items-center bg-yellow-100 p-2 rounded-full">
              <FontAwesome6 name="clock" size={12} color="#854d0e" />
              <Text className="text-yellow-800 ml-1 text-xs font-semibold">
                Snooze
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Appointment Card */}
        <View className="flex-1 bg-white p-4 rounded-xl shadow-sm mb-3">
          <Text className="font-semibold text-gray-500">Appointment</Text>
          <Text className="font-bold text-lg text-gray-800 mt-2">
            Dr. Erica
          </Text>
          <Text className="text-gray-500">Therapy - 02:00 PM</Text>
          <TouchableOpacity className="flex-row items-center bg-blue-100 p-2 rounded-full mt-3 self-start">
            <FontAwesome6 name="map" size={12} color="#1e40af" />
            <Text className="text-blue-800 ml-1 text-xs font-semibold">
              Get Directions
            </Text>
          </TouchableOpacity>
        </View>

        {/* To-do List */}
        <View className=" bg-white p-4 rounded-xl shadow-sm ">
          <View className="flex-row justify-between items-center">
            <Text className="text-lg font-bold">To-do list</Text>
          </View>
          <View className="mt-4 space-y-3">
            <View className="flex-row items-center">
              <View className="w-5 h-5 border-2 border-red-300 rounded-md mr-3" />
              <Text className="text-base text-gray-700">
                Schedule blood work
              </Text>
            </View>
            <View className="flex-row items-center">
              <View className="w-5 h-5 border-2 border-red-300 rounded-md mr-3" />
              <Text className="text-base text-gray-700">
                Pick up medication
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>

      <TouchableOpacity className="absolute bottom-8 right-6 border-2 border-red-400 w-16 h-16 rounded-full items-center justify-center ">
        <Ionicons name="sparkles-sharp" size={32} color="#FF6347" />
      </TouchableOpacity>
    </View>
  );
}
