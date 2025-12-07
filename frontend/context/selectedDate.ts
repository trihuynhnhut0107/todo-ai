import { EventStatus } from "@/enum/event";
import { createContext, Dispatch, SetStateAction, useContext } from "react";

interface ActiveDateContextProps {
  selected: string;
  selectDate: (date: string) => void;
  filter: {
    assigned: boolean;
    status: EventStatus[];
    period: { from: Date | string | undefined; to: Date | string | undefined };
  };
  setFilter: Dispatch<
    SetStateAction<{
      assigned: boolean;
      status: EventStatus[];
      period: {
        from: Date | string | undefined;
        to: Date | string | undefined;
      };
    }>
  >;
  matched: number;
}
export const SelectedDateContext = createContext<ActiveDateContextProps>({
  selected: "",
  selectDate: () => {},
  filter: {
    assigned: false,
    status: [],
    period: { from: undefined, to: undefined },
  },
  setFilter: () => {},
  matched: 0,
});

export const useSelectedDate = () => useContext(SelectedDateContext);
