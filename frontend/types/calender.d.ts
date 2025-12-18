

export interface AddCalenderReq{
    title: string;
    description: string;
    startDate: string | Date;
    endDate: string | Date;
    location?: string;
}