import AgendaHeader from "@/components/UI/Calendar/AgendaHeader";
import EventCard from "@/components/UI/Calendar/EventCard";
import Loader from "@/components/UI/Loader";
import { FilterProps, SelectedDateContext } from "@/context/selectedDate";
import { EventStatus } from "@/enum/event";
import useThemeColor from "@/hooks/useThemeColor";
import { getDatesBetween, spreadEvent } from "@/lib/utils";
import { useEvents } from "@/query/event.query";
import { useGroupById, useGroupMember } from "@/query/group.query";
import useAuthStore from "@/store/auth.store";

import { Ionicons } from "@expo/vector-icons";
import { BottomSheetModal, BottomSheetView } from "@gorhom/bottom-sheet";
import {
  CalendarBody,
  CalendarContainer,
  CalendarKitHandle,
  EventItem,
} from "@howljs/calendar-kit";
import { BlurView } from "expo-blur";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { Dimensions, Keyboard, TouchableOpacity, View } from "react-native";
import { CalendarList } from "react-native-calendars";
import { RefreshControl, ScrollView } from "react-native-gesture-handler";

const GroupDetail = () => {
  const color = useThemeColor();
  const { user } = useAuthStore();
  const { id } = useLocalSearchParams<{ id: string }>();
  const sheetRef = useRef<BottomSheetModal>(null);
  const calendarRef = useRef<CalendarKitHandle>(null);
  const [filter, setFilter] = useState<FilterProps>({
    assigned: false,
    status: Object.values(EventStatus).map((s) => s),
    period: {
      from: undefined,
      to: undefined,
    },
  });
  const [selected, selectDate] = useState(
    new Date().toISOString().split("T")[0]
  );

  const [isOpen, setOpen] = useState(false);
  const [calendarLoaded, setCalendarLoaded] = useState(false);
  const {
    data: group,
    isLoading: pendingWorkspace,
    refetch: refetchWorkspace,
  } = useGroupById(id);

  const { data: members } = useGroupMember(id);

  const {
    data: events,
    isLoading: pendingEvents,
    refetch: refetchEvents,
  } = useEvents(id);

  const onRefresh = () => {
    refetchWorkspace();
    refetchEvents();
  };
  useEffect(() => {
    Keyboard.dismiss();
    if (isOpen) {
      sheetRef.current?.present();
    } else {
      sheetRef.current?.dismiss();
    }
  }, [isOpen]);

  const handleGoToDate = (date: string) => {
    const [year, month, day] = date.split("-").map(Number);
    const localDate = new Date(year, month - 1, day);
    calendarRef.current?.goToDate({
      date: localDate,
      animatedDate: true,
      hourScroll: true,
      animatedHour: true,
    });
  };

  const handleDateChanged = (d: string) => {
    const newDate = new Date(d);
    newDate.setDate(newDate.getDate() + 1);
    selectDate(newDate.toISOString().split("T")[0]);
  };

  const handleSelectDate = (d: string | Date) => {
    selectDate(new Date(d).toISOString().split("T")[0]);
    handleGoToDate(new Date(d).toISOString().split("T")[0]);
  };

  const filteredEvents = useMemo(() => {
    if (!events) return [];
    return events?.filter((e) => {
      // 1. Date FROM
      if (filter.period.from) {
        const fromDate = new Date(filter.period.from).getTime();
        const eventDate = new Date(e.start).getTime();
        if (eventDate < fromDate) return false;
      }

      // 2. Date TO
      if (filter.period.to) {
        const toDate = new Date(filter.period.to).getTime();
        const eventDate = new Date(e.end).getTime();
        if (eventDate > toDate) return false;
      }

      // 3. Assigned to me
      if (user && filter.assigned) {
        if (!e.assigneeIds?.includes(user.id)) return false;
      }

      // 4. Status
      if (filter.status?.length && !filter.status.includes(e.status)) {
        return false;
      }
      return true;
    });
  }, [filter, events, user]);

  const calendarDates = useMemo(() => {
    const eventLog: Record<
      string,
      {
        selected?: boolean;
        dots: {
          color: string;
        }[];
      }
    > = {};

    filteredEvents?.forEach((event) => {
      const start = new Date(event.start.toString()).toLocaleDateString();
      const end = new Date(event.end.toString()).toLocaleDateString();

      const dateList = getDatesBetween(start, end);

      dateList.forEach((dateStr, index) => {
        if (!eventLog[dateStr]) {
          eventLog[dateStr] = { dots: [] };
        }

        eventLog[dateStr].dots.push({
          color: event.color || "blue",
        });
      });
    });

    const mappedEvents = filteredEvents?.map((e) => {
      return {
        ...e,
        createdBy: members?.find((m) => m.id === e.createdById)?.email ?? "",
      };
    });
    // highlight selected date if exists
    if (!eventLog[selected]) {
      eventLog[selected] = {
        dots: [],
      };
    }
    eventLog[selected].selected = true;

    const calendarBody: EventItem[] = [];

    mappedEvents?.forEach((e) => {
      calendarBody.push(...spreadEvent(e));
    });

    return { eventLog, calendarBody };
  }, [selected, members, filteredEvents]);

  return (
    <SelectedDateContext.Provider
      value={{
        selected,
        selectDate: handleSelectDate,
        filter,
        setFilter,
        matched: filteredEvents?.length ?? 0,
      }}
    >
      <View className="flex-1 ">
        <View className="overflow-display shadow-sm z-50">
          <ScrollView
            contentContainerStyle={{ flexGrow: 0 }}
            refreshControl={
              <RefreshControl
                refreshing={pendingEvents && pendingWorkspace}
                onRefresh={onRefresh}
              />
            }
          >
            <AgendaHeader group={group} events={filteredEvents} />
          </ScrollView>
        </View>

        <View className="flex-1">
          <View
            className="flex-1 absolute size-full items-center justify-center bg-background"
            style={{
              display: !pendingEvents && calendarLoaded ? "none" : "flex",
            }}
          >
            <Loader />
          </View>
          <CalendarContainer
            onLoad={() => setCalendarLoaded(true)}
            theme={{
              colors: {
                background: color.background,
                // surface:"white"
                text: color.text,
                border: color.border,
                onBackground: color.text,
                onPrimary: color.text,
                onSurface: color.text,
              },
              textStyle: {
                color: color.text,
              },
              eventContainerStyle: {
                backgroundColor: "transparent",
              },
            }}
            ref={calendarRef}
            allowPinchToZoom
            onDateChanged={handleDateChanged}
            events={calendarDates.calendarBody}
            useHaptic={true}
            scrollByDay={true}
            numberOfDays={1}
            isLoading={pendingEvents}
            minDate={`${new Date().getFullYear() - 2}-01-01`}
            maxDate={`${new Date().getFullYear() + 5}-12-31`}
          >
            {/* <CalendarHeader /> */}

            <CalendarBody renderEvent={(e: any) => <EventCard event={e} />} />
          </CalendarContainer>
        </View>
        <BottomSheetModal
          name="calendar"
          onDismiss={() => setOpen(false)}
          ref={sheetRef}
          // snapPoints={snapPoints}
          enablePanDownToClose
          backgroundComponent={() => (
            <View className=" absolute top-0 left-0 right-0 bottom-0 bg-surface shadow-xl rounded-t-3xl"></View>
          )}
          backdropComponent={() => (
            <BlurView
              intensity={20} // adjust for more/less blur
              tint="light" // or "light"
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: Dimensions.get("window").width,
                height: Dimensions.get("window").height,
              }}
            />
          )}
        >
          <BottomSheetView className="gap-4">
            <CalendarList
              // pastScrollRange={0}
              // futureScrollRange={0}
              hideExtraDays
              horizontal
              pagingEnabled
              style={{
                flex: 1,
                paddingBottom: 32,
              }}
              headerStyle={{}}
              theme={{
                calendarBackground: "transparent",
                textSectionTitleColor: color.text,
                selectedDayBackgroundColor: color.accent,
                selectedDayTextColor: "white",
                monthTextColor: color.text,
                todayTextColor: color.text,
                dayTextColor: color.text,
                textDisabledColor: color.muted,

                textMonthFontWeight: "bold",
                textMonthFontSize: 32,
              }}
              onDayPress={(day) => {
                handleSelectDate(day.dateString);
              }}
              markingType="multi-dot" // or "period"
              markedDates={calendarDates.eventLog}
            />
          </BottomSheetView>
        </BottomSheetModal>

        <TouchableOpacity
          onPress={() => {
            const selectedDate = new Date(selected);
            const now = new Date();
            // Set the selected date but with the current time
            selectedDate.setHours(
              now.getHours(),
              now.getMinutes(),
              now.getSeconds(),
              now.getMilliseconds()
            );
            router.push(
              `/(main)/group/${id}/event_form/create?date=${selectedDate.toISOString()}`
            );
          }}
          className="absolute left-5 bottom-5 flex-row items-center p-3 bg-primary rounded-full "
        >
          <Ionicons name="add" size={32} color="white" />
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => setOpen(true)}
          className="absolute right-5 bottom-5 flex-row items-center p-3 bg-primary rounded-full "
        >
          <Ionicons name="calendar" size={32} color="white" />
        </TouchableOpacity>
      </View>
    </SelectedDateContext.Provider>
  );
};

export default GroupDetail;
