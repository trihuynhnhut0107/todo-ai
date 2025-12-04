
import { Stack } from "expo-router";


export default function GroupsLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: {
          backgroundColor: "transparent",
        },
        animation:"none"
      }}
    />
  );
}
