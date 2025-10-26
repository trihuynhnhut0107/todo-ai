import { View, Text, Button, Touchable, TouchableOpacity } from "react-native";
import React from "react";
import useAuthStore from "@/store/auth.store";

const profile = () => {
    const {logout} = useAuthStore()
  return (
    <View>
      <TouchableOpacity onPress={logout}>
        <Text>Logout</Text>
      </TouchableOpacity>
    </View>
  );
};

export default profile;
