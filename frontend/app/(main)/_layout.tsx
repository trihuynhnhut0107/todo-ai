import { View, Text, StatusBar, KeyboardAvoidingView } from "react-native";
import React from "react";
import useAuthStore from "@/store/auth.store";
import { Redirect, Slot } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { StyleSheet } from "react-native";

const mainLayout = () => {
  const { isAuthenticated } = useAuthStore();

  if (!isAuthenticated) return <Redirect href="/sign-in" />;

  return (
    <SafeAreaView edges={["top"]} className="flex-1">
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
        colors={["rgba(255, 100, 100, 0.3)", "white"]}
        style={StyleSheet.absoluteFill}
        locations={[0, 1]} // Mờ nhanh hơn
        // Hướng: Từ trên-phải (x: 0.8) chéo xuống
        start={{ x: 0.8, y: 0 }}
        end={{ x: 0.5, y: 0.7 }}
      />
      <Slot />
    </SafeAreaView>
  );
};

export default mainLayout;
