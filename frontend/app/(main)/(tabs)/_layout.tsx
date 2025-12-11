// import { images } from "@/constants";
import useThemeColor from "@/hooks/useThemeColor";
import { TabBarIconProps } from "@/type";
import { Ionicons } from "@expo/vector-icons";
import { Link, Tabs } from "expo-router";

import {
  View,
} from "react-native";

const TabBarIcon = ({
  focused,
  icon,
  acactive_icon,
  title,
}: TabBarIconProps) => {
  const color = useThemeColor();
  return (
    <View className={"flex items-center  w-[100px]"}>
      {focused ? (
        <Ionicons name={acactive_icon} size={28} color={color.primary} />
      ) : (
        <Ionicons name={icon} size={28} color={color.primary} />
      )}

     
    </View>
  );
};

const TabLayout = () => {
  const color = useThemeColor();
  return (
    <Tabs
      screenOptions={{
        animation: "shift",
        headerShown: false,
        tabBarShowLabel: false,
        sceneStyle: {
          backgroundColor: "transparent",
        },
        tabBarStyle: {
          height:50,
          backgroundColor: color.surface,
          borderTopWidth: 0,
          //   borderRadius: 20,
          //   overflow: "hidden",
          //   marginHorizontal: 20,
          //   height: 100,
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
        name="groups"
        options={{
          title: "Groups",
          tabBarIcon: ({ focused }) => (
            <TabBarIcon
              title="Groups"
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
            <Link href={"/(main)/chat"}>
              <TabBarIcon
                title="Chat"
                icon="sparkles-outline"
                acactive_icon="sparkles"
                focused={focused}
              />
            </Link>
            // <View className="absolute rounded-full p-2 mb-4 bg-surface">
            //   <Pressable
            //     className="bg-primary w-16 h-16 rounded-full items-center justify-center "
            //     onPress={() => {
            //       navigate("/(main)/chat"); // programmatic navigation
            //     }}
            //   >
            //     <Ionicons name="sparkles-sharp" size={32} color="white" />
            //   </Pressable>
            // </View>
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
    </Tabs>
  );
};

export default TabLayout;
