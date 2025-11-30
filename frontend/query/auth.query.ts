import { signIn, signUp } from "@/services/auth";
import { registerAndSavePushToken } from "@/services/notification";
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

export const useSignIn = () => {
  const setUser = useAuthStore((s) => s.setUser);
  const setIsAuthenticated = useAuthStore((s) => s.setIsAuthenticated);

  const mutation = useMutation({
    mutationFn: (payload: SignInPayload) => signIn(payload),
    onSuccess: (user) => {
      if (user) {
        setUser(user);
        setIsAuthenticated(true);
        showMessage({ message: "Signed in!", type: "success" });

        // Register for push notifications after successful login
        registerAndSavePushToken().catch((err) => {
          console.warn("Failed to register push notifications:", err);
        });
      } else {
        showMessage({ message: "Sign in failed", type: "danger" });
      }
    },
    onError: (err: any) => {
      const message =
        err?.message || err?.response?.data?.message || "Sign in failed";
      showMessage({ message, type: "danger" });
    },
  });

  // Some components expect `isPending` naming — expose it as alias of isLoading
  const m: any = mutation;
  return { ...m, isPending: m.isLoading ?? m.isPending ?? false };
};

export const useSignUp = () => {
  const setUser = useAuthStore((s) => s.setUser);
  const setIsAuthenticated = useAuthStore((s) => s.setIsAuthenticated);

  const mutation = useMutation({
    mutationFn: (payload: SignUpPayload) => signUp(payload),
    onSuccess: (user) => {
      if (user) {
        setUser(user);
        setIsAuthenticated(true);
        showMessage({ message: "Account created!", type: "success" });

        // Register for push notifications after successful signup
        registerAndSavePushToken().catch((err) => {
          console.warn("Failed to register push notifications:", err);
        });
      } else {
        showMessage({ message: "Sign up failed", type: "danger" });
      }
    },
    onError: (err: any) => {
      const message =
        err?.message || err?.response?.data?.message || "Sign up failed";
      showMessage({ message, type: "danger" });
    },
  });

  const m2: any = mutation;
  return { ...m2, isPending: m2.isLoading ?? m2.isPending ?? false };
};

export default {} as any;
