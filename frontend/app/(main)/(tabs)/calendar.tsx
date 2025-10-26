import { images } from "@/lib/image";
import { mockEvent } from "@/lib/mock";
import { Ionicons } from "@expo/vector-icons";
import {
  CalendarBody,
  CalendarContainer,
  CalendarHeader,
  CalendarKitHandle,
  EventItem,
  OnCreateEventResponse,
  OnEventResponse,
  PackedEvent,
} from "@howljs/calendar-kit";
import { useCallback, useEffect, useRef, useState } from "react";
import { Image, Pressable, Text, View } from "react-native";
import { Calendar, CalendarList } from "react-native-calendars";

const calendar = () => {
  const calendarRef = useRef<CalendarKitHandle>(null);
  const [events, setEvents] = useState<EventItem[]>(mockEvent);
  const [selected, setSelected] = useState("");
  const [loading, setLaoding] = useState(false);
  useEffect(() => {

    calendarRef.current&&calendarRef.current?.goToDate({
      date: new Date(selected).toISOString(),
      animatedDate: true,
      hourScroll: true,
      animatedHour: true,
    });
  }, [selected]);
  const renderEvent = useCallback(
    (event: PackedEvent) => (
      <View
        className="flex-row items-start"
        style={{
          width: "100%",
          height: "100%",
          padding: 4,
        }}
      >
        <View className="flex-1">
          <View className="flex-row relative">
            {event.data.member?.map((m: any, idx: number) => (
              <Image
                key={idx}
                source={images.john_doe}
                className="rounded-full size-4"
                resizeMode="cover"
              />
            ))}
          </View>
          <Text style={{ color: "white", fontSize: 10 }}>{event.title}</Text>
        </View>
        <Pressable
          className="rounded-full p-2 z-10"
          onPress={() => deleteEvent(event.id)}
        >
          <Ionicons name="close" size={22} color="white" />
        </Pressable>
      </View>
    ),
    []
  );

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
      <CalendarList
        horizontal={!!selected}
        calendarHeight={200}
        pagingEnabled={true}
        theme={{
          backgroundColor: "orange",
          calendarBackground: "orange",
          textSectionTitleColor: "white",
          selectedDayBackgroundColor: "white",
          selectedDayTextColor: "orange",
          todayTextColor: "red",
          dayTextColor: "white",
          textDisabledColor: "green",
        }}
        onDayPress={(day) => {
          console.log(day);
          setSelected(day.dateString);
        }}
        markedDates={{
          [selected]: {
            selected: true,
            disableTouchEvent: true,
            // selectedDotColor: "orange",
          },
        }}
      />
      {selected && (
        <CalendarContainer
          ref={calendarRef}
          allowPinchToZoom={true}
          // isLoading={true}
          allowDragToCreate={true}
          allowDragToEdit={true}
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
          <CalendarHeader />
          <CalendarBody renderEvent={renderEvent} />
        </CalendarContainer>
      )}
    </View>
  );
};

export default calendar;
