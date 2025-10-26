import CustomButton from "@/components/CustomButton";

import { signIn } from "@/services/auth";
import useAuthStore from "@/store/auth.store";

import { Link } from "expo-router";
import React, { useContext, useState } from "react";
import { Alert, Text, View } from "react-native";
import { modalContext } from "./_layout";
import CustomInput from "@/components/CustomInput";

const SignIn = () => {
  const { setOpen } = useContext(modalContext);
  const { fetchAuthenticatedUser } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ email: "", password: "" });

  async function Submit() {
    const { email, password } = form;
    if (!email || !password)
      return Alert.alert("Error", "Please enter valid email or password");
    setLoading(true);

    try {
      await signIn(email, password);
      setOpen(true);
    } catch (error: any) {
      Alert.alert("Error", error.message);
    } finally {
      setLoading(false);
    }
  }
  return (
    <View className="gap-10 rounded-lg px-5 ">
      <CustomInput
        label="Email"
        value={form.email}
        onChangeText={(text) => setForm((prev) => ({ ...prev, email: text }))}
        placeholder="Enter your email"
      />
      <CustomInput
        label="Password"
        value={form.password}
        onChangeText={(text) =>
          setForm((prev) => ({ ...prev, password: text }))
        }
        placeholder="Enter your password"
        secureTextEntry={true}
      />
      <CustomButton title="Sign in" isLoading={loading} onPress={Submit} />

      <Text className="base-regular text-gray-100 text-center">
        Don't have an account?{" "}
        <Link href={"/sign-up"} className="base-bold text-primary">
          Sign up
        </Link>
      </Text>
    </View>
  );
};

export default SignIn;