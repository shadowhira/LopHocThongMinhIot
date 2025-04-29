import { CalendarEvent } from "../types";

// Dữ liệu mẫu cho các sự kiện trong lịch
export const mockEvents: CalendarEvent[] = [
  {
    id: "1",
    title: "Navigating Dietary Trends: Keto, Paleo, Vegan, and More",
    date: new Date(2023, 11, 12), // December 12, 2023
    startTime: "7:00 PM",
    endTime: "8:30 PM",
    isLive: false,
    location: "",
    isHighlighted: true,
  },
  {
    id: "2",
    title: "Navigating Dietary Trends: Keto, Paleo, Vegan, and More",
    date: new Date(2023, 11, 14), // December 14, 2023
    startTime: "7:00 PM",
    endTime: "8:30 PM",
    isLive: false,
    location: "",
    isHighlighted: true,
  },
  {
    id: "3",
    title: "Navigating Dietary Trends: Keto, Paleo, Vegan, and More",
    date: new Date(2023, 11, 15), // December 15, 2023
    startTime: "7:00 PM",
    endTime: "8:30 PM",
    isLive: false,
    location: "",
    isHighlighted: true,
  },
  {
    id: "4",
    title: "Navigating Dietary Trends: Keto, Paleo, Vegan, and More",
    date: new Date(2023, 11, 16), // December 16, 2023
    startTime: "7:00 PM",
    endTime: "8:30 PM",
    isLive: false,
    location: "",
    isHighlighted: true,
  },
  {
    id: "5",
    title: "Navigating Dietary Trends: Keto, Paleo, Vegan, and More",
    date: new Date(2023, 11, 20), // December 20, 2023
    startTime: "7:00 PM",
    endTime: "8:30 PM",
    isLive: false,
    location: "",
    isHighlighted: true,
  },
  {
    id: "6",
    title: "Navigating Dietary Trends: Keto, Paleo, Vegan, and More",
    date: new Date(2023, 11, 21), // December 21, 2023
    startTime: "7:00 PM",
    endTime: "8:30 PM",
    isLive: false,
    location: "",
    isHighlighted: true,
  },
  {
    id: "7",
    title: "Navigating Dietary Trends: Keto, Paleo, Vegan, and More",
    date: new Date(2023, 11, 24), // December 24, 2023
    startTime: "7:00 PM",
    endTime: "8:30 PM",
    isLive: false,
    location: "",
    isHighlighted: true,
  },
  {
    id: "8",
    title: "Navigating Dietary Trends: Keto, Paleo, Vegan, and More",
    date: new Date(2023, 11, 21), // December 21, 2023
    startTime: "7:00 PM",
    endTime: "8:30 PM",
    isLive: true,
    location: "Vaulture",
    isHighlighted: true,
  },
];

// Dữ liệu mẫu cho các ngày có sự kiện
export const highlightedDates = [12, 14, 15, 16, 20, 21, 24];
