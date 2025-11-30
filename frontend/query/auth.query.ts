import { signIn, signUp } from "@/services/auth";
import { useMutation } from "@tanstack/react-query";
import { showMessage } from "react-native-flash-message";
import useAuthStore from "@/store/auth.store";

type SignInPayload = {
  email: string;
  password: string;
};

type SignUpPayload = {
  name: string;
  email: string;
  password: string;
};

export const useSignIn = (callback: any) => {
  const mutation = useMutation({
    mutationFn: (payload: SignInPayload) => signIn(payload),
    onSuccess: (user) => {
      if (user) {
        callback && callback();
      } else {
        showMessage({ message: "Sign in failed", type: "danger" });
      }
    },
  });

  // Some components expect `isPending` naming — expose it as alias of isLoading
  const m: any = mutation;
  return { ...m, isPending: m.isLoading ?? m.isPending ?? false };
};

export const useSignUp = (callback: any) => {

  const mutation = useMutation({
    mutationFn: (payload: SignUpPayload) => signUp(payload),
    onSuccess: (user) => {
      if (user) {
        callback && callback();
      } else {
        showMessage({ message: "Sign up failed", type: "danger" });
      }
    },
  });

  const m2: any = mutation;
  return { ...m2, isPending: m2.isLoading ?? m2.isPending ?? false };
};

export default {} as any;
