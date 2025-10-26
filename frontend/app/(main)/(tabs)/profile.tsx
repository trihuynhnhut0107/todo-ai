import { View, Text, Button, Touchable, TouchableOpacity } from "react-native";
import React from "react";
import useAuthStore from "@/store/auth.store";
import {
  Agenda,
  // DateData,
  // AgendaEntry,
  // AgendaSchedule,
} from "react-native-calendars";
const profile = () => {
    const {logout} = useAuthStore()
  return (
    <Agenda/>
    // <View>
    //   <TouchableOpacity onPress={logout}>
    //     <Text>Logout</Text>
    //   </TouchableOpacity>
    // </View>
  );
};

export default profile;
