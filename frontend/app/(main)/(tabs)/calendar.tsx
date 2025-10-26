import { View, Text, TouchableOpacity, Alert, StyleSheet } from "react-native";
import React, { useState, useCallback, useEffect } from "react";
import {
  Agenda,
  // DateData,
  // AgendaEntry,
  // AgendaSchedule,
} from "react-native-calendars";

const timeToString = (time: number) => {
  const date = new Date(time);
  return date.toISOString().split("T")[0];
};

export default function Calendar() {
  const [items, setItems] = useState<AgendaSchedule>({});

  // Use useCallback without 'items' in dependencies if it only adds new data
  // or handle merging carefully.
  const loadItems = useCallback((day: DateData) => {
    // console.log('loadItems called for day:', day.dateString);
    // Simulate loading, typically from an API.
    // The key is to generate new data and merge it correctly with existing state.
    setTimeout(() => {
      const newItemsForRange: AgendaSchedule = {};
      for (let i = -15; i < 85; i++) { // Generate for a range around the given day
        const time = day.timestamp + i * 24 * 60 * 60 * 1000;
        const strTime = timeToString(time);

        // Only generate new events if they don't already exist for this date
        // in the items that we are about to add (newItemsForRange)
        // and also check if they are already in the main state 'items'.
        // This prevents re-generating and overwriting.
        if (!items[strTime] && !newItemsForRange[strTime]) { // Crucial check against existing state 'items'
          newItemsForRange[strTime] = [];

          const numItems = Math.floor(Math.random() * 3 + 1);
          for (let j = 0; j < numItems; j++) {
            newItemsForRange[strTime].push({
              name: "Item for " + strTime + " #" + j,
              height: Math.max(50, Math.floor(Math.random() * 150)),
              day: strTime,
            });
          }
        }
      }

      // Use the functional update form of setItems
      setItems(prevItems => {
        // Create a new object that merges previous items with the newly loaded ones
        const updatedItems = { ...prevItems, ...newItemsForRange };
        return updatedItems;
      });

    }, 1000);
  }, [items]); // Keep 'items' in dependencies. This means loadItems recreates,
              // but the functional update of setItems helps avoid the loop if handled correctly.
              // Alternative: If `loadItems` only *fetches* new items and doesn't rely
              // on `items` from its closure for *what to fetch*, then `items` can be removed
              // from dependencies, and `setItems` would always correctly merge with `prevItems`.
              // For a simple random generation, keeping it is fine as long as `setItems` is correct.


  // A helper effect to load initial items for the selected date if 'items' is empty
  useEffect(() => {
    // Only load if items are empty, to prevent infinite re-renders
    if (Object.keys(items).length === 0) {
      const today = new Date();
      const initialDayData: DateData = {
        year: today.getFullYear(),
        month: today.getMonth() + 1,
        day: today.getDate(),
        timestamp: today.getTime(),
        dateString: timeToString(today.getTime()),
      };
      // Manually trigger loadItems for the initial view
      loadItems(initialDayData);
    }
  }, [items, loadItems]); // Depend on 'items' (to check if empty) and 'loadItems' (for the function)


  const renderDay = useCallback((day: any) => {
    if (day) {
      return <Text style={styles.customDay}>{day.day}</Text>;
    }
    return <View style={styles.dayItem} />;
  }, []); // No dependencies for renderDay

  const renderItem = useCallback((reservation: AgendaEntry, isFirst: boolean) => {
    const fontSize = isFirst ? 16 : 14;
    const color = isFirst ? "black" : "#43515c";

    return (
      <TouchableOpacity
        style={[styles.item, { height: reservation.height }]}
        onPress={() => Alert.alert(reservation.name)}
      >
        <Text style={{ fontSize, color }}>{reservation.name}</Text>
      </TouchableOpacity>
    );
  }, []);

  const renderEmptyDate = useCallback(() => {
    return (
      <View style={styles.emptyDate}>
        <Text>This is empty date!</Text>
      </View>
    );
  }, []);

  const rowHasChanged = useCallback((r1: AgendaEntry, r2: AgendaEntry) => {
    return r1.name !== r2.name;
  }, []);

  const initialSelectedDate = timeToString(new Date().getTime()); // Set to current date dynamically

  return (
    <View style={{ flex: 1 }}>
      <Agenda
        // items={items}
        // loadItemsForMonth={loadItems}
        // // You generally want `selected` to be dynamic or a current date
        // selected={initialSelectedDate} // Changed to current date for better UX
        // renderItem={renderItem}
        // renderEmptyDate={renderEmptyDate}
        // rowHasChanged={rowHasChanged}
        // showClosingKnob={true}
        // pastScrollRange={50}
        // futureScrollRange={50}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  item: {
    backgroundColor: "white",
    flex: 1,
    borderRadius: 5,
    padding: 10,
    marginRight: 10,
    marginTop: 17,
  },
  emptyDate: {
    height: 15,
    flex: 1,
    paddingTop: 30,
  },
  customDay: {
    margin: 10,
    fontSize: 24,
    color: "green",
  },
  dayItem: {
    marginLeft: 34,
  },
});