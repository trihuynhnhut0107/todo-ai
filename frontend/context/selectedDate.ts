import { createContext, useContext } from "react";

interface ActiveDateContextProps {
  selected: string;
  selectDate: (date: string) => void;
}
export const SelectedDateContext = createContext<ActiveDateContextProps>({
  selected: "",
  selectDate: () => {},
});

export const useSelectedDate = () => useContext(SelectedDateContext);
