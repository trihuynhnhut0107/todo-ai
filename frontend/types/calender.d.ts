

export interface AddCalenderReq{
    title: string;
    description: string;
    startDate: string | Date;
    endDate: string | Date;
    location?: string;
}

export interface CalendarEvent {
    id: string;
    title: string;
    description: string;
    startDate: Date;
    endDate: Date;
    location?: string;
}