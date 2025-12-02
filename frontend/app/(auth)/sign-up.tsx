import { signIn, signUp } from "@/services/auth";
import useAuthStore from "@/store/auth.store";
import { Link } from "expo-router";
import React, { useContext, useState } from "react";
import { Alert, Text, View } from "react-native";
import { modalContext } from "./_layout";
import CustomButton from "@/components/Input/CustomButton";
import CustomInput from "@/components/Input/CustomInput";

import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { useSignUp } from "@/query/auth.query";

export const schema = z.object({
  name: z.string().min(1, "Please enter name"),
  email: z
    .string()
    .min(1, "Please enter email")
    .email("Please enter a valid email"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

const SignUp = () => {
  const { setOpen } = useContext(modalContext);
  const { mutate: signUp, isPending } = useSignUp(() => setOpen("signUp"));
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  async function onSubmit(data: any) {
    signUp({ name: data.name, email: data.email, password: data.password });
  }
  return (
    <View className="gap-5 rounded-lg px-5 bg-surface backdrop:blur-sm p-4 ">
      <Controller
        control={control}
        name="name"
        render={({ field }) => (
          <View>
            <CustomInput
              label="Full Name"
              value={field.value}
              onChangeText={field.onChange}
              error={!!errors.name}
            />
            <Text className="text-red-500">{errors.name?.message}</Text>
          </View>
        )}
      />
      <Controller
        control={control}
        name="email"
        render={({ field }) => (
          <View>
            <CustomInput
              label="Email"
              value={field.value}
              onChangeText={field.onChange}
              error={!!errors.email}
            />
            <Text className="text-red-500">{errors.email?.message}</Text>
          </View>
        )}
      />
      <Controller
        control={control}
        name="password"
        render={({ field }) => (
          <View>
            <CustomInput
              label="Password"
              value={field.value}
              onChangeText={field.onChange}
              error={!!errors.password}
              secureTextEntry
            />
            <Text className="text-red-500">{errors.password?.message}</Text>
          </View>
        )}
      />
      <CustomButton
        title="Sign up"
        isLoading={isPending}
        onPress={handleSubmit(onSubmit)}
      />

      <Text className="base-regular text-center text-text-tertiary">
        Already have an account?{" "}
        <Link href={"/sign-in"} className="base-bold text-orange-500">
          Sign in
        </Link>
      </Text>
    </View>
  );
};

export default SignUp;
