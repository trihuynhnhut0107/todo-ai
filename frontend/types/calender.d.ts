

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

export interface CalendarDrift {
  type: 'MODIFIED_ON_DEVICE' | 'CREATED_ON_DEVICE' | 'DELETED_ON_DEVICE';
  appEventId?: string;       
  nativeEventId: string;     
  diff?: {
    title?: string| null;          
    notes?: string| null;        
    location?: string| null;
    startDate?: any;      
    endDate?: any;        
  };
}