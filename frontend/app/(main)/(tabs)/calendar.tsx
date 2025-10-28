import AgendaHeader from "@/components/UI/Calendar/AgendaHeader";
import EventCard from "@/components/UI/EventCard";
import { images } from "@/lib/image";
import { mockEvent } from "@/lib/mock";
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
import { Link } from "expo-router";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  Dimensions,
  Image,
  Keyboard,
  Pressable,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Calendar, CalendarList } from "react-native-calendars";
import { FlatList } from "react-native-gesture-handler";
import { endEvent } from "react-native/Libraries/Performance/Systrace";

const calendar = () => {
  const sheetRef = useRef<BottomSheetModal>(null);
  const calendarRef = useRef<CalendarKitHandle>(null);
  const [events, setEvents] = useState<EventItem[]>(mockEvent);
  const [selected, setSelected] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [isOpen, setOpen] = useState(false);

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
    console.log("New event:", event);
    setEvents([
      ...events,
      {
        id: new Date().getTime().toString(),
        title: "New Event",
        start: event.start,
        end: event.end,
        color: "orange",
        data: {
          member: [{ username: "LE VAN D" }, { username: "NGUYEN VAN E" }],
        },
      },
    ]);
  };
  const handleDragStart = (event: OnEventResponse) => {
    console.log("Started editing event:", event);
    // You can use this to show a UI indicator that event editing has started
  };

  const handleDragEnd = (event: OnEventResponse) => {
    console.log("Event edited:", event);

    const newEvents: EventItem[] = events?.map((e) => {
      if (e.id === event.id) {
        return { ...e, start: event.start, end: event.end };
      } else {
        return e;
      }
    });
    setEvents(newEvents);
    // Here you would typically update the event in your events array
    // and possibly update your backend or state management
  };

  const deleteEvent = (id: string) => {
    setEvents((prev) => prev?.filter((e) => e.id !== id));
  };

  return (
    <View className="flex-1">
      <CalendarContainer
        theme={{
          colors:  {
            background:"transparent",
            surface:"white"
          }
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
        events={events}
        onPressEvent={(event) => {
          console.log("Event pressed:", event);
        }}
        useHaptic={true}
        scrollByDay={true}
        numberOfDays={1}
      >
        {/* <CalendarHeader /> */}
        <AgendaHeader selected={selected} onSelect={handleSelectDate} />
        <CalendarBody
          renderEvent={(e) => <EventCard event={e} onPress={deleteEvent} />}
        />
      </CalendarContainer>

      <BottomSheetModal
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
              textSectionTitleColor: "yellow",
              selectedDayBackgroundColor: "white",
              monthTextColor: "yellow",
              selectedDayTextColor: "orange",
              todayTextColor: "yellow",
              dayTextColor: "white",
              textDisabledColor: "green",

              textMonthFontWeight: "bold",
              textMonthFontSize: 32,
            }}
            onDayPress={(day) => {
              handleSelectDate(day.dateString);
            }}
            markedDates={{
              "2025-10-28": {
                selected: true,
                disableTouchEvent: true,
              },
              [selected]: {
                selected: true,
                disableTouchEvent: true,
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

export default calendar;
