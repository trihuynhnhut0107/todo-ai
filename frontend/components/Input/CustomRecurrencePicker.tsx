import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  ScrollView,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import CustomDateTimePicker from "./CustomDateTimePicker";
import {
  RECURRENCE_PRESETS,
  Weekday,
  WEEKDAY_SHORT_LABELS,
  RecurrenceFrequency,
} from "@/enum/recurrence";
import { buildRRuleFromPreset, formatRecurrenceEndDate } from "@/lib/recurrence";

interface CustomRecurrencePickerProps {
  label?: string;
  value?: string; // RRULE string
  startDate: Date; // Event start date (for determining default day)
  onChange: (rrule: string | undefined) => void;
  error?: boolean;
}

const CustomRecurrencePicker: React.FC<CustomRecurrencePickerProps> = ({
  label = "Repeat",
  value,
  startDate,
  onChange,
  error,
}) => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedPreset, setSelectedPreset] = useState<string | undefined>();
  const [untilDate, setUntilDate] = useState<Date>(
    new Date(new Date().setFullYear(new Date().getFullYear() + 1)) // Default: 1 year from now
  );
  const [selectedDays, setSelectedDays] = useState<Weekday[]>([]);

  // Parse existing RRULE when value changes (for edit mode)
  useEffect(() => {
    if (value) {
      parseExistingRRule(value);
    } else {
      // Reset to defaults if no value
      setSelectedPreset(undefined);
      setSelectedDays([]);
      setUntilDate(new Date(new Date().setFullYear(new Date().getFullYear() + 1)));
    }
  }, [value]);

  const parseExistingRRule = (rrule: string) => {
    try {
      // Parse UNTIL
      const untilMatch = rrule.match(/UNTIL=(\d{8}T\d{6}Z)/);
      if (untilMatch) {
        const untilStr = untilMatch[1];
        const year = parseInt(untilStr.substring(0, 4));
        const month = parseInt(untilStr.substring(4, 6)) - 1;
        const day = parseInt(untilStr.substring(6, 8));
        const hour = parseInt(untilStr.substring(9, 11));
        const minute = parseInt(untilStr.substring(11, 13));
        const second = parseInt(untilStr.substring(13, 15));
        setUntilDate(new Date(year, month, day, hour, minute, second));
      }

      // Parse BYDAY
      const bydayMatch = rrule.match(/BYDAY=([A-Z,]+)/);
      if (bydayMatch) {
        const days = bydayMatch[1].split(",") as Weekday[];
        setSelectedDays(days);
      } else {
        setSelectedDays([]);
      }

      // Detect preset based on pattern
      if (rrule.includes("FREQ=DAILY")) {
        setSelectedPreset("daily");
      } else if (rrule.includes("FREQ=WEEKLY")) {
        if (rrule.includes("BYDAY=MO,TU,WE,TH,FR")) {
          setSelectedPreset("weekdays");
        } else if (rrule.includes("INTERVAL=2")) {
          setSelectedPreset("biweekly");
        } else {
          setSelectedPreset("weekly");
        }
      } else if (rrule.includes("FREQ=MONTHLY")) {
        if (rrule.includes("INTERVAL=2")) {
          setSelectedPreset("bimonthly");
        } else if (rrule.includes("INTERVAL=3")) {
          setSelectedPreset("quarterly");
        } else {
          setSelectedPreset("monthly");
        }
      } else if (rrule.includes("FREQ=YEARLY")) {
        setSelectedPreset("yearly");
      }
    } catch (error) {
      console.error("Error parsing RRULE:", error);
    }
  };

  // Parse current value to determine if recurrence is enabled
  const hasRecurrence = !!value;

  const handlePresetSelect = (presetValue: string) => {
    setSelectedPreset(presetValue);

    // For weekly/biweekly, pre-select the start date's day
    if (presetValue === "weekly" || presetValue === "biweekly") {
      const dayOfWeek = startDate.getDay();
      const weekdayMap: Weekday[] = [
        Weekday.SUNDAY,
        Weekday.MONDAY,
        Weekday.TUESDAY,
        Weekday.WEDNESDAY,
        Weekday.THURSDAY,
        Weekday.FRIDAY,
        Weekday.SATURDAY,
      ];
      setSelectedDays([weekdayMap[dayOfWeek]]);
    }
  };

  const handleApply = () => {
    if (!selectedPreset) {
      onChange(undefined);
      setIsModalVisible(false);
      return;
    }

    try {
      // Pass selectedDays for weekly/biweekly patterns
      const rrule = buildRRuleFromPreset(
        selectedPreset,
        untilDate,
        startDate,
        selectedDays.length > 0 ? selectedDays : undefined
      );
      onChange(rrule);
      setIsModalVisible(false);
    } catch (error) {
      console.error("Error building RRULE:", error);
    }
  };

  const handleRemoveRecurrence = () => {
    setSelectedPreset(undefined);
    onChange(undefined);
    setIsModalVisible(false);
  };

  const toggleDay = (day: Weekday) => {
    setSelectedDays((prev) => {
      if (prev.includes(day)) {
        return prev.filter((d) => d !== day);
      } else {
        return [...prev, day];
      }
    });
  };

  const getRecurrenceDisplayText = () => {
    if (!hasRecurrence) return "Does not repeat";

    // Parse basic info from RRULE string
    if (value?.includes("FREQ=DAILY")) return "Daily";
    if (value?.includes("FREQ=WEEKLY")) {
      if (value.includes("BYDAY=MO,TU,WE,TH,FR")) return "Weekdays (Mon-Fri)";
      if (value.includes("INTERVAL=2")) return "Bi-Weekly";
      return "Weekly";
    }
    if (value?.includes("FREQ=MONTHLY")) {
      if (value.includes("INTERVAL=2")) return "Bi-Monthly";
      if (value.includes("INTERVAL=3")) return "Quarterly";
      return "Monthly";
    }
    if (value?.includes("FREQ=YEARLY")) return "Yearly";

    return "Custom recurrence";
  };

  const weekdays: Weekday[] = [
    Weekday.SUNDAY,
    Weekday.MONDAY,
    Weekday.TUESDAY,
    Weekday.WEDNESDAY,
    Weekday.THURSDAY,
    Weekday.FRIDAY,
    Weekday.SATURDAY,
  ];

  return (
    <View>
      <Text className="text-sm text-text-secondary mb-2">{label}</Text>

      <TouchableOpacity
        onPress={() => setIsModalVisible(true)}
        className={`flex-row items-center justify-between p-4 bg-background rounded-lg border ${
          error ? "border-red-500" : "border-border"
        }`}
      >
        <View className="flex-row items-center gap-2">
          <Ionicons name="repeat" size={20} color="#666" />
          <Text className="text-text">{getRecurrenceDisplayText()}</Text>
        </View>
        <Ionicons name="chevron-forward" size={20} color="#666" />
      </TouchableOpacity>

      <Modal
        visible={isModalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setIsModalVisible(false)}
      >
        <View className="flex-1 bg-background">
          {/* Header */}
          <View className="flex-row items-center justify-between p-4 border-b border-border">
            <TouchableOpacity onPress={() => setIsModalVisible(false)}>
              <Text className="text-primary">Cancel</Text>
            </TouchableOpacity>
            <Text className="text-lg font-semibold text-text">Repeat Event</Text>
            <TouchableOpacity onPress={handleApply}>
              <Text className="text-primary font-semibold">Done</Text>
            </TouchableOpacity>
          </View>

          <ScrollView className="flex-1">
            {/* No Repeat Option */}
            <TouchableOpacity
              onPress={() => setSelectedPreset(undefined)}
              className={`p-4 border-b border-border flex-row items-center justify-between ${
                !selectedPreset ? "bg-primary/10" : ""
              }`}
            >
              <Text className="text-text">Does not repeat</Text>
              {!selectedPreset && (
                <Ionicons name="checkmark" size={24} color="#007AFF" />
              )}
            </TouchableOpacity>

            {/* Recurrence Presets */}
            {RECURRENCE_PRESETS.map((preset) => (
              <TouchableOpacity
                key={preset.value}
                onPress={() => handlePresetSelect(preset.value)}
                className={`p-4 border-b border-border ${
                  selectedPreset === preset.value ? "bg-primary/10" : ""
                }`}
              >
                <View className="flex-row items-center justify-between">
                  <View>
                    <Text className="text-text font-medium">{preset.label}</Text>
                    {preset.description && (
                      <Text className="text-text-secondary text-sm">
                        {preset.description}
                      </Text>
                    )}
                  </View>
                  {selectedPreset === preset.value && (
                    <Ionicons name="checkmark" size={24} color="#007AFF" />
                  )}
                </View>
              </TouchableOpacity>
            ))}

            {/* Day Selection for Weekly/Bi-weekly */}
            {(selectedPreset === "weekly" || selectedPreset === "biweekly") && (
              <View className="p-4 border-b border-border">
                <Text className="text-text-secondary mb-3">Repeat on</Text>
                <View className="flex-row flex-wrap gap-2">
                  {weekdays.map((day) => (
                    <TouchableOpacity
                      key={day}
                      onPress={() => toggleDay(day)}
                      className={`px-4 py-2 rounded-full ${
                        selectedDays.includes(day)
                          ? "bg-primary"
                          : "bg-background border border-border"
                      }`}
                    >
                      <Text
                        className={
                          selectedDays.includes(day)
                            ? "text-white font-medium"
                            : "text-text"
                        }
                      >
                        {WEEKDAY_SHORT_LABELS[day]}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            )}

            {/* Until Date Picker */}
            {selectedPreset && (
              <View className="p-4 border-b border-border">
                <Text className="text-text-secondary mb-3">Ends on</Text>
                <CustomDateTimePicker
                  label="Until"
                  value={untilDate}
                  onChange={(date) => setUntilDate(date)}
                />
                <Text className="text-text-secondary text-sm mt-2">
                  Last occurrence: {formatRecurrenceEndDate(untilDate)}
                </Text>
              </View>
            )}

            {/* Remove Recurrence */}
            {hasRecurrence && (
              <TouchableOpacity
                onPress={handleRemoveRecurrence}
                className="p-4 m-4 bg-red-500/10 rounded-lg"
              >
                <Text className="text-red-500 font-medium text-center">
                  Remove Recurrence
                </Text>
              </TouchableOpacity>
            )}
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
};

export default CustomRecurrencePicker;
