// import { images } from "@/constants";
import useAuthStore from "@/store/auth.store";
import { TabBarIconProps } from "@/type";
import { Ionicons } from "@expo/vector-icons";
import cn from "clsx";
import { BlurView } from "expo-blur";
import { Redirect, Tabs } from "expo-router";
import { navigate } from "expo-router/build/global-state/routing";
import React from "react";
import {
  Button,
  Image,
  Pressable,
  Text,
  Touchable,
  TouchableOpacity,
  View,
} from "react-native";

const TabBarIcon = ({
  focused,
  icon,
  acactive_icon,
  title,
}: TabBarIconProps) => (
  <View className={"flex items-center mt-4 w-[100px]"}>
    {focused ? (
      <Ionicons name={acactive_icon} size={24} color="orangered" />
    ) : (
      <Ionicons name={icon} size={24} color="black" />
    )}

    <Text className={cn("text-xs", focused ? "text-orange-500" : "")}>
      {title}
    </Text>
  </View>
);

const TabLayout = () => {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,
        tabBarStyle: {
          //   borderRadius: 20,
          //   overflow: "hidden",
          //   marginHorizontal: 20,
          //   height: 80,
          //   position: "absolute",
          //   bottom: 40,
          //   backgroundColor: "rgba(255,255,255,0.6)",
          //   borderTopWidth: 0,
          //   elevation: 5,
        },
        // tabBarBackground: () => (
        //   <BlurView
        //     intensity={50}
        //     tint="light"
        //     style={{
        //       flex: 1,
        //     }}
        //   />
        // ),
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          tabBarLabel: "Home",
          title: "Home",
          tabBarIcon: ({ focused }) => (
            <TabBarIcon
              title="Home"
              icon="home-outline"
              acactive_icon="home"
              focused={focused}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="calendar"
        options={{
          title: "Calendar",
          tabBarIcon: ({ focused }) => (
            <TabBarIcon
              title="Calendar"
              icon="calendar-clear-outline"
              acactive_icon="calendar-clear"
              focused={focused}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="chat_holder"
        options={{
          title: "",
          tabBarIcon: ({ focused }) => (
            <Pressable  
              className="absolute border-2 bg-white border-red-400 w-16 h-16 rounded-full items-center justify-center "
              onPress={() => {
                navigate("/(main)/chat"); // programmatic navigation
              }}
            >
              <Ionicons name="sparkles-sharp" size={32} color="#FF6347" />
            </Pressable>
          ),
        }}
      />
      <Tabs.Screen
        name="notification"
        options={{
          title: "Notification",
          tabBarIcon: ({ focused }) => (
            <TabBarIcon
              title="Notification"
              icon="notifications-outline"
              acactive_icon="notifications"
              focused={focused}
            />
          ),
          //   tabBarBadge: totalItems > 0 ? totalItems : undefined,
          //   tabBarBadgeStyle: {
          //     backgroundColor: "#FE8C00",
          //     color: "white",
          //     fontSize: 10,
          //     maxHeight: 16,
          //     maxWidth: 16,
          //     aspectRatio:1/1,
          //     transform: "translateY(10px), translateX(5px)",
          //   },
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ focused }) => (
            <TabBarIcon
              title="Profile"
              icon="person-circle-outline"
              acactive_icon="person-circle"
              focused={focused}
            />
          ),
        }}
      />
    </Tabs>
  );
};

export default TabLayout;
