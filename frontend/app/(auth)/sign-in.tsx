import { Link } from "expo-router";
import { useContext } from "react";
import { Text, View } from "react-native";
import { modalContext } from "./_layout";
import CustomInput from "@/components/Input/CustomInput";
import CustomButton from "@/components/Input/CustomButton";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { useSignIn } from "@/query/auth.query";

export const schema = z.object({
  email: z.string().email().min(1, "Please enter email"),
  password: z.string().min(1, "Please enter password"),
});

const SignIn = () => {
  const { setOpen } = useContext(modalContext);
  const { mutate: signIn, isPending } = useSignIn(()=>setOpen("signIn"));

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  async function onSubmit(data: any) {
    signIn({ email: data.email, password: data.password });
  }

  return (
    <View className="gap-5 rounded-lg px-5 bg-surface backdrop:blur-sm p-4 ">
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
        title="Sign in"
        isLoading={isPending}
        onPress={handleSubmit(onSubmit)}
      />

      <Text className="base-regular text-center text-text-tertiary">
        {"Don't have an account? "}
        <Link
          href={"/sign-up"}
          className="base-bold text-primary font-bold"
        >
          Sign up
        </Link>
      </Text>
    </View>
  );
};

export default SignIn;
