import { CustomDateTimePickerProps } from "@/type";
import { format } from "date-fns";
import { useState } from "react";
import { View, Text, TouchableOpacity } from "react-native";
import DateTimePickerModal from "react-native-modal-datetime-picker";
import cn from "clsx";
import { Ionicons } from "@expo/vector-icons";
import useThemeColor from "@/hooks/useThemeColor";

const CustomDateTimePicker = ({
  label,
  value,
  onChange,
  error,
}: CustomDateTimePickerProps) => {
  const dateValue = value ?? new Date();
  const [openDate, setOpenDate] = useState(false);
  const [openTime, setOpenTime] = useState(false);
  const color = useThemeColor();

  return (
    <View className="flex-1">
      {/* Button: pick date */}
      <View
        className={cn(
          "rounded-xl w-full h-fit text-base border-2 leading-5 flex-col justify-between items-start  p-2 gap-1",
          openDate || openTime ? "border-primary" : "border-border",
          error && "border-red-500"
        )}
      >
        {label && (
          <Text
            className={cn(
              "text-base text-start w-full font-quicksand-medium text-text-secondary",
              openDate || (openTime && "!text-primary "),
              error && "text-red-500"
            )}
          >
            {label}
          </Text>
        )}
        <TouchableOpacity
          onPress={() => setOpenDate(true)}
          className="rounded-md h-fit w-full"
        >
          {value ? (
            <View>
              <Text className="text-text text-2xl text-start ">
                {format(dateValue, "E dd")}
              </Text>
              <Text className="text-text-tertiary text-start ">
                {format(dateValue, "MMM yyyy")}
              </Text>
            </View>
          ) : (
            <View className="items-center flex-row justify-between p-2 bg-surface rounded-lg w-full">
              <Ionicons
                name="calendar-clear-outline"
                size={24}
                color={color["text-secondary"]}
              />
              <Text className="text-text-secondary text-sm">Set date</Text>
            </View>
          )}
        </TouchableOpacity>

        {/* Button: pick time */}
        <TouchableOpacity
          onPress={() => setOpenTime(true)}
          className={"border-t-2 border-accent w-full pt-2"}
        >
          {value ? (
            <Text className="text-text text-xl">
              {format(dateValue, "hh:mm a")}
            </Text>
          ) : (
            <View className="items-center flex-row justify-between p-2 bg-surface rounded-lg w-full">
              <Ionicons
                name="time-outline"
                size={24}
                color={color["text-secondary"]}
              />
              <Text className="text-text-secondary text-sm">Set time</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      {/* Date Picker */}
      <DateTimePickerModal
        isVisible={openDate}
        mode="date"
        date={dateValue}
        onConfirm={(selectedDate) => {
          setOpenDate(false);
          const newDate = new Date(dateValue);
          newDate.setFullYear(selectedDate.getFullYear());
          newDate.setMonth(selectedDate.getMonth());
          newDate.setDate(selectedDate.getDate());
          onChange(newDate);
        }}
        onCancel={() => setOpenDate(false)}
      />

      {/* Time Picker */}
      <DateTimePickerModal
        isVisible={openTime}
        mode="time"
        date={dateValue}
        onConfirm={(selectedTime) => {
          setOpenTime(false);
          const newDate = new Date(dateValue);
          newDate.setHours(selectedTime.getHours());
          newDate.setMinutes(selectedTime.getMinutes());
          onChange(newDate);
        }}
        onCancel={() => setOpenTime(false)}
      />
    </View>
  );
};

export default CustomDateTimePicker;
