import { CustomDateTimePickerProps } from "@/type";
import { format } from "date-fns";
import { useState } from "react";
import { View, Text, TouchableOpacity } from "react-native";
import DateTimePickerModal from "react-native-modal-datetime-picker";
import cn from "clsx";

const CustomDateTimePicker = ({
  label,
  value,
  onChange,
  error,
}: CustomDateTimePickerProps) => {
  const dateValue = value ?? new Date();
  const [openDate, setOpenDate] = useState(false);
  const [openTime, setOpenTime] = useState(false);

  return (
    <View className="w-full">
      {label && (
        <Text
          className={cn(
            "text-base text-start w-full font-quicksand-medium text-text-secondary pl-2",
            openDate || (openTime && "!text-orange-500 "),
            error && "text-red-500"
          )}
        >
          {label}
        </Text>
      )}
      {/* Button: pick date */}
      <View
        className={cn(
          "rounded-lg w-full text-base border-2 leading-5 flex-row flex-wrap gap-2 justify-between",
          openDate || openTime ? "border-primary" : "border-border",
          error && "border-red-500"
        )}
      >
        <TouchableOpacity
          onPress={() => setOpenDate(true)}
          className="rounded-md flex-1 p-3"
        >
          <Text className="text-text text-center ">
            {value ? format(dateValue, "dd MMM yyyy") : "No date selected"}
          </Text>
        </TouchableOpacity>

        {/* Button: pick time */}
        <TouchableOpacity
          onPress={() => setOpenTime(true)}
          className={cn(
            "border-l-2 p-3",
            openDate || openTime ? "border-primary" : "border-border",
            error && "border-red-500"
          )}
        >
          <Text className="text-text">
            {value ? format(dateValue, "hh:mm a") : "No time selected"}
          </Text>
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
