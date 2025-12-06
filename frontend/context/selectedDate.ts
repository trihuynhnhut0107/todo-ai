import { EventStatus } from "@/enum/event";
import { createContext, useContext } from "react";

interface ActiveDateContextProps {
  selected: string;
  selectDate: (date: string) => void;
  filter: { assigned: boolean; status: EventStatus[] };
  setFilter: (filter: { assigned: boolean; status: EventStatus[] }) => void;
}
export const SelectedDateContext = createContext<ActiveDateContextProps>({
  selected: "",
  selectDate: () => {},
   filter: { assigned: false, status: []},
  setFilter: () => {},
});

export const useSelectedDate = () => useContext(SelectedDateContext);
