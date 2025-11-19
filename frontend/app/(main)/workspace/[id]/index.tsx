import AgendaHeader from "@/components/UI/Calendar/AgendaHeader";
import EventCard from "@/components/UI/Calendar/EventCard";
import { SelectedDateContext } from "@/context/selectedDate";
import { getDatesBetween, spreadEvent } from "@/lib/utils";
import {
  useCreateEvent,
  useDeleteEvent,
  useEvents,
  useUpdateEvent,
} from "@/query/event.query";
import { useWorkSpaceById } from "@/query/workspace.query";
import { EventPayload } from "@/types/event";
import { Ionicons } from "@expo/vector-icons";
import { BottomSheetModal, BottomSheetView } from "@gorhom/bottom-sheet";
import {
  CalendarBody,
  CalendarContainer,
  CalendarHeader,
  CalendarKitHandle,
  dateTimeToISOString,
  EventItem,
  HeaderItemProps,
  OnCreateEventResponse,
  OnEventResponse,
  PackedEvent,
} from "@howljs/calendar-kit";
import { BlurView } from "expo-blur";
import { Link, router, useLocalSearchParams } from "expo-router";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  Image,
  Keyboard,
  Pressable,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Calendar, CalendarList } from "react-native-calendars";
import {
  FlatList,
  RefreshControl,
  ScrollView,
} from "react-native-gesture-handler";

const workspaceDetail = () => {
  const { id } = useLocalSearchParams<{ id: string }>();
  const sheetRef = useRef<BottomSheetModal>(null);
  const calendarRef = useRef<CalendarKitHandle>(null);
  const [selected, selectDate] = useState(
    new Date().toISOString().split("T")[0]
  );

  const [isOpen, setOpen] = useState(false);
  const [calendarLoaded, setCalendarLoaded] = useState(false);
  const {
    data: workspace,
    isLoading: pendingWorkspace,
    refetch: refetchWorkspace,
  } = useWorkSpaceById(id);

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

  const calendarDates = useMemo(() => {
    const eventLog: Record<
      string,
      {
        selected?: boolean;
        dots: Array<{
          color: string;
        }>;
      }
    > = {};

    events?.forEach((event) => {
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

    // highlight selected date if exists
    if (!eventLog[selected]) {
      eventLog[selected] = {
        dots: [],
      };
    }
    eventLog[selected].selected = true;

    const calendarBody: EventItem[] = [];

    events?.forEach((e) => {
      calendarBody.push(...spreadEvent(e));
    });

    return { eventLog, calendarBody };
  }, [events, selected]);

  return (
    <SelectedDateContext.Provider
      value={{ selected, selectDate: handleSelectDate }}
    >
      <View className="flex-1 ">
        <View className="overflow-display shadow-sm bg-white z-50">
          <ScrollView
            contentContainerStyle={{ flexGrow: 0 }}
            refreshControl={
              <RefreshControl
                refreshing={pendingEvents && pendingWorkspace}
                onRefresh={onRefresh}
              />
            }
          >
            <AgendaHeader workspace={workspace} events={events} />
          </ScrollView>
        </View>

        <View className="flex-1">
          <View
            className="flex-1 absolute size-full items-center justify-center bg-white"
            style={{
              display: !pendingEvents && calendarLoaded ? "none" : "flex",
            }}
          >
            <ActivityIndicator size={"large"} color={"black"} />
          </View>
          <CalendarContainer
            onLoad={() => setCalendarLoaded(true)}
            theme={{
              colors: {
                // background:"transparent",
                // surface:"white"
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
            <View className=" absolute top-0 left-0 right-0 bottom-0 bg-orange-500/80 shadow-xl rounded-t-3xl"></View>
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
                textSectionTitleColor: "white",
                selectedDayBackgroundColor: "white",
                monthTextColor: "white",
                selectedDayTextColor: "orange",
                todayTextColor: "white",
                dayTextColor: "white",
                textDisabledColor: "green",

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
          onPress={() =>
            router.push(`/(main)/workspace/${id}/event_form/create`)
          }
          className="absolute left-5 bottom-5 flex-row items-center p-3 bg-orange-400 rounded-full "
        >
          <Ionicons name="add" size={32} color="white" />
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => setOpen(true)}
          className="absolute right-5 bottom-5 flex-row items-center p-3 bg-orange-400 rounded-full "
        >
          <Ionicons name="calendar" size={32} color="white" />
        </TouchableOpacity>
      </View>
    </SelectedDateContext.Provider>
  );
};

export default workspaceDetail;
