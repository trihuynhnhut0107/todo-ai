import AgendaHeader from "@/components/UI/Calendar/AgendaHeader";
import EventCard from "@/components/UI/Calendar/EventCard";
import { images } from "@/lib/image";
import { mockEvents } from "@/lib/mock/event";
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
  EventItem,
  HeaderItemProps,
  OnCreateEventResponse,
  OnEventResponse,
  PackedEvent,
} from "@howljs/calendar-kit";
import { BlurView } from "expo-blur";
import { Link, useLocalSearchParams } from "expo-router";
import { use, useCallback, useEffect, useRef, useState } from "react";
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

const workspaceDetail = () => {
  const { id } = useLocalSearchParams<{ id: string }>();
  const sheetRef = useRef<BottomSheetModal>(null);
  const calendarRef = useRef<CalendarKitHandle>(null);
  const [selected, setSelected] = useState(
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
    const localDate = new Date(year, month - 1, day); // local date
    console.log("goto", localDate);
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
    setSelected(newDate.toISOString().split("T")[0]);
  };

  const handleSelectDate = (d: string | Date) => {
    setSelected((prev) => new Date(d).toISOString().split("T")[0]);
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

  return (
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
        <AgendaHeader
          workspace={workspace}
          events={events}
          selected={selected}
          onSelect={handleSelectDate}
        />

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
              renderEvent={(e) => (
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
            markingType="multi-period" // or "period"
            markedDates={{
              [selected]: {
                selected: true,
                periods: [
                  { color: "red", startingDay: true, endingDay: true },
                  { color: "red", startingDay: true, endingDay: true },
                  { color: "red", startingDay: true, endingDay: true },
                  { color: "red", startingDay: true, endingDay: true },
                  { color: "blue", endingDay: true },
                ],
              },
              "2025-11-03": {
                periods: [{ color: "red", startingDay: true }],
              },

              "2025-11-01": {
                periods: [{ color: "blue", startingDay: true }],
              },
            }}
          />
        </BottomSheetView>
      </BottomSheetModal>
      <TouchableOpacity
        onPress={() => setOpen(true)}
        className="absolute right-5 bottom-5 flex-row items-center p-3 bg-orange-400 rounded-full "
      >
        <Ionicons name="calendar" size={32} color="white" />
      </TouchableOpacity>
    </View>
  );
};

export default workspaceDetail;
