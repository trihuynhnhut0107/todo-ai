import React, { useEffect } from "react";
import { View, Animated } from "react-native";

type TypingProps = {
  author?: string;
};

const TypingBubble: React.FC<TypingProps> = ({ author = "ai" }) => {
  const dot1 = React.useRef(new Animated.Value(0.3)).current;
  const dot2 = React.useRef(new Animated.Value(0.3)).current;
  const dot3 = React.useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    const a1 = Animated.loop(
      Animated.sequence([
        Animated.timing(dot1, { toValue: 1, duration: 350, useNativeDriver: true }),
        Animated.timing(dot1, { toValue: 0.3, duration: 350, useNativeDriver: true }),
      ])
    );
    const a2 = Animated.loop(
      Animated.sequence([
        Animated.delay(150),
        Animated.timing(dot2, { toValue: 1, duration: 350, useNativeDriver: true }),
        Animated.timing(dot2, { toValue: 0.3, duration: 350, useNativeDriver: true }),
      ])
    );
    const a3 = Animated.loop(
      Animated.sequence([
        Animated.delay(300),
        Animated.timing(dot3, { toValue: 1, duration: 350, useNativeDriver: true }),
        Animated.timing(dot3, { toValue: 0.3, duration: 350, useNativeDriver: true }),
      ])
    );

    a1.start();
    a2.start();
    a3.start();

    return () => {
      a1.stop();
      a2.stop();
      a3.stop();
    };
  }, [dot1, dot2, dot3]);

  const dotColor = author === "user" ? "#fff" : "#374151";

  return (
    <View className={`max-w-[70%] mb-3 p-3 rounded-lg bg-gray-200 self-start rounded-bl-none`}>
      <View style={{ flexDirection: "row", width: 36, justifyContent: "space-between", alignItems: "center" }}>
        <Animated.View style={{ width: 6, height: 6, borderRadius: 6, backgroundColor: dotColor, opacity: dot1 }} />
        <Animated.View style={{ width: 6, height: 6, borderRadius: 6, backgroundColor: dotColor, opacity: dot2 }} />
        <Animated.View style={{ width: 6, height: 6, borderRadius: 6, backgroundColor: dotColor, opacity: dot3 }} />
      </View>
    </View>
  );
};

export default TypingBubble;