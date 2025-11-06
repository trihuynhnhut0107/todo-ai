import AgendaHeader from "@/components/UI/Calendar/AgendaHeader";
import EventCard from "@/components/UI/Calendar/EventCard";
import { images } from "@/lib/image";
import { mockEvents } from "@/lib/mock/event";
import { getDatesBetween } from "@/lib/utils";
import {
  useCreateEvent,
  useDeleteEvent,
  useEvents,
  useUpdateEvent,
} from "@/query/event.query";
import { useWorkSpaceById } from "@/query/workspace.query";
import { createEvent, getEvents, updateEvent } from "@/services/event";
import { getWorkspace } from "@/services/workspace";
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
import { Link, useLocalSearchParams } from "expo-router";
import {
  createContext,
  use,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
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
import { create } from "zustand";

interface ActiveDateContextProps {
  selected: string;
  selectDate: (date: string) => void;
}
export const selectedDateContext = createContext<ActiveDateContextProps>({
  selected: "",
  selectDate: () => {},
});
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
  const { mutate: createEvent } = useCreateEvent();
  const { mutate: updateEvent } = useUpdateEvent();
  const { mutate: deleteEvent } = useDeleteEvent();

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
    console.log(d);
    selectDate(new Date(d).toISOString().split("T")[0]);
    handleGoToDate(new Date(d).toISOString().split("T")[0]);
  };

  const handleDragCreateStart = (start: OnCreateEventResponse) => {
    console.log("Started creating event at:", start);
    // You can use this to show a UI indicator that event creation has started
  };

  const handleDragCreateEnd = (event: OnCreateEventResponse) => {
    const payload = { wp_id: id, start: event.start, end: event.end };
    createEvent(payload);
  };
  const handleDragStart = (event: OnEventResponse) => {
    console.log("Started editing event:", event);
    // You can use this to show a UI indicator that event editing has started
  };

  const handleDragEnd = (event: OnEventResponse) => {
    const payload = {
      wp_id: id,
      id: event.id,
      start: event.start,
      end: event.end,
    };
    updateEvent(payload);
  };

  const handleDeleteEvent = (e_id: string) => {
    const payload = {
      wp_id: id,
      id: e_id,
    };
    deleteEvent(payload);
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
    if (selected && eventLog[selected]) {
      eventLog[selected].selected = true;
    }

    return eventLog;
  }, [events, selected]);

  return (
    <selectedDateContext.Provider
      value={{ selected, selectDate: handleSelectDate }}
    >
      <View className="flex-1">
        <ScrollView
          className="flex-1"
          contentContainerStyle={{ flexGrow: 1 }}
          refreshControl={
            <RefreshControl
              refreshing={pendingEvents && pendingWorkspace}
              onRefresh={onRefresh}
            />
          }
          stickyHeaderIndices={[0]}
        >
          <AgendaHeader workspace={workspace} events={events} />

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
                  borderRadius: 12,
                },
              }}
              ref={calendarRef}
              allowPinchToZoom
              allowDragToCreate
              allowDragToEdit
              onDateChanged={handleDateChanged}
              onDragCreateEventStart={handleDragCreateStart}
              onDragCreateEventEnd={handleDragCreateEnd}
              onDragEventStart={handleDragStart}
              onDragEventEnd={handleDragEnd}
              events={
                events?.map((e) => ({
                  ...e,
                  start: { dateTime: e.start },
                  end: { dateTime: e.end },
                })) as EventItem[]
              }
              onPressEvent={(event) => {
                console.log("Event pressed:", event);
              }}
              useHaptic={true}
              scrollByDay={true}
              numberOfDays={1}
            >
              {/* <CalendarHeader /> */}

              <CalendarBody
                renderEvent={(e: any) => (
                  <EventCard event={e} onPress={handleDeleteEvent} />
                )}
              />
            </CalendarContainer>
          </View>
        </ScrollView>
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
              markedDates={calendarDates}
            />
          </BottomSheetView>
        </BottomSheetModal>
        <TouchableOpacity className="absolute left-5 bottom-5 flex-row items-center p-3 bg-orange-400 rounded-full ">
          <Ionicons name="add" size={32} color="white" />
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => setOpen(true)}
          className="absolute right-5 bottom-5 flex-row items-center p-3 bg-orange-400 rounded-full "
        >
          <Ionicons name="calendar" size={32} color="white" />
        </TouchableOpacity>
      </View>
    </selectedDateContext.Provider>
  );
};

export default workspaceDetail;
