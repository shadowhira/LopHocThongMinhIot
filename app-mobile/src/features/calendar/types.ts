// Định nghĩa kiểu dữ liệu cho sự kiện lịch
export interface CalendarEvent {
  id: string;
  title: string;
  date: Date;
  startTime: string;
  endTime: string;
  isLive?: boolean;
  location?: string;
  isHighlighted?: boolean;
}

// Định nghĩa kiểu dữ liệu cho tab
export type TabType = 'Discussions' | 'Events';

// Định nghĩa kiểu dữ liệu cho ngày trong lịch
export interface CalendarDay {
  date: number;
  month: number;
  year: number;
  isCurrentMonth: boolean;
  isToday?: boolean;
  hasEvent?: boolean;
}
