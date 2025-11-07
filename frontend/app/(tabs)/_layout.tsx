// import { images } from "@/constants";
import useAuthStore from "@/store/auth.store";
import { TabBarIconProps } from "@/type";
import { Ionicons } from "@expo/vector-icons";
import cn from "clsx";
import { BlurView } from "expo-blur";
import { Redirect, Tabs } from "expo-router";
import React from "react";
import { Image, Text, View } from "react-native";

const TabBarIcon = ({
  focused,
  icon,
  acactive_icon,
  title,
}: TabBarIconProps) => (
  <View className={"tab-icon"}>
    <View className="flex items-center mt-2">
      {focused ? (
        <Ionicons name={acactive_icon} size={24} color="orangered" />
      ) : (
        <Ionicons name={icon} size={24} color="black" />
      )}
    </View>

    <Text className={cn("text-xs font-bold", focused ? "text-orange-700" : "")}>
      {title}
    </Text>
  </View>
);

export default function TabLayout() {
  const { isAuthenticated } = useAuthStore();

//   if (!isAuthenticated) return <Redirect href="/sign-in" />;

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
          position: "absolute",
          //   bottom: 40,
          backgroundColor: "rgba(255,255,255,0.6)",
          //   borderTopWidth: 0,
          //   elevation: 5,
        },
        tabBarBackground: () => (
          <BlurView
            intensity={50}
            tint="light"
            style={{
              flex: 1,
            }}
          />
        ),
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
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
              title="Search"
              icon="calendar-clear-outline"
              acactive_icon="calendar-clear"
              focused={focused}
            />
          ),
        }}
      />
      {/* <Tabs.Screen
        name="cart"
        options={{
          title: "Cart",
          tabBarIcon: ({ focused }) => (
            <TabBarIcon title="Cart" icon="notifications-outline" acactive_icon="notifications-sharp" focused={focused} />
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
      /> */}
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
}
