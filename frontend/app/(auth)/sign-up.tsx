
import { signUp } from "@/services/auth";
import useAuthStore from "@/store/auth.store";
import { Link } from "expo-router";
import React, { useContext, useState } from "react";
import { Alert, Text, View } from "react-native";
import { modalContext } from "./_layout";
import CustomButton from "@/components/CustomButton";
import CustomInput from "@/components/CustomInput";

const SignUp = () => {
  const { setOpen } = useContext(modalContext);
  const { fetchAuthenticatedUser } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", password: "" });

  async function Submit() {
    const { name, email, password } = form;
    if (!name || !email || !password)
      return Alert.alert("Error", "Please enter valid name, email or password");
    setLoading(true);

    try {
      await signUp( name, email, password );
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
        label="Full Name"
        value={form.name}
        onChangeText={(text) => setForm((prev) => ({ ...prev, name: text }))}
        placeholder="Enter your full name"
      />
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
      <CustomButton title="Sign up" isLoading={loading} onPress={Submit} />

      <Text className="base-regular text-gray-100 text-center">
        Already have an account?{" "}
        <Link href={"/sign-in"} className="base-bold text-primary">
          Sign in
        </Link>
      </Text>
    </View>
  );
};

export default SignUp;