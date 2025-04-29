import React, { useState, useEffect } from 'react';
import { View } from 'react-native';
import CalendarHeader from './CalendarHeader';
import CalendarGrid from './CalendarGrid';
import MonthSelector from './MonthSelector';
import { CalendarDay } from '../types';

interface CalendarViewProps {
  selectedDate: number;
  onSelectDate: (day: number) => void;
  highlightedDates: number[];
}

const CalendarView: React.FC<CalendarViewProps> = ({
  selectedDate,
  onSelectDate,
  highlightedDates,
}) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [days, setDays] = useState<CalendarDay[]>([]);

  // Tạo mảng các ngày trong tháng hiện tại
  useEffect(() => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();

    // Ngày đầu tiên của tháng
    const firstDayOfMonth = new Date(year, month, 1);
    // Ngày cuối cùng của tháng
    const lastDayOfMonth = new Date(year, month + 1, 0);

    // Điều chỉnh để bắt đầu từ thứ 2: (0 = thứ 2, 6 = chủ nhật)
    let firstDayOfWeek = firstDayOfMonth.getDay();
    // Chuyển chủ nhật (0) thành 6, các ngày khác giảm 1
    firstDayOfWeek = firstDayOfWeek === 0 ? 6 : firstDayOfWeek - 1;

    // Tổng số ngày trong tháng
    const daysInMonth = lastDayOfMonth.getDate();

    // Tạo mảng các ngày
    const calendarDays: CalendarDay[] = [];

    // Thêm các ngày của tháng trước
    // Tính toán chính xác số ngày trong tháng trước
    const prevMonthIndex = month - 1 < 0 ? 11 : month - 1;
    const prevMonthYear = month - 1 < 0 ? year - 1 : year;
    const lastDayOfPrevMonth = new Date(prevMonthYear, prevMonthIndex + 1, 0);
    const daysInPrevMonth = lastDayOfPrevMonth.getDate();

    for (let i = firstDayOfWeek - 1; i >= 0; i--) {
      calendarDays.push({
        date: daysInPrevMonth - i,
        month: prevMonthIndex,
        year: prevMonthYear,
        isCurrentMonth: false,
      });
    }

    // Thêm các ngày của tháng hiện tại
    const today = new Date();
    for (let i = 1; i <= daysInMonth; i++) {
      const isToday =
        i === today.getDate() &&
        month === today.getMonth() &&
        year === today.getFullYear();

      calendarDays.push({
        date: i,
        month,
        year,
        isCurrentMonth: true,
        isToday,
        hasEvent: highlightedDates.includes(i),
      });
    }

    // Thêm các ngày của tháng sau
    const totalDaysNeeded = 42; // 6 hàng x 7 cột
    const remainingDays = totalDaysNeeded - calendarDays.length;

    // Tính toán chính xác tháng sau
    const nextMonthIndex = month + 1 > 11 ? 0 : month + 1;
    const nextMonthYear = month + 1 > 11 ? year + 1 : year;

    for (let i = 1; i <= remainingDays; i++) {
      calendarDays.push({
        date: i,
        month: nextMonthIndex,
        year: nextMonthYear,
        isCurrentMonth: false,
      });
    }

    setDays(calendarDays);
  }, [currentMonth, highlightedDates]);

  // Xử lý khi chuyển sang tháng trước
  const handlePrevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  };

  // Xử lý khi chuyển sang tháng sau
  const handleNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  };

  // Lấy tên tháng
  const getMonthName = (date: Date) => {
    return date.toLocaleString('default', { month: 'long' });
  };

  return (
    <View className="bg-[#0A2463] rounded-lg overflow-hidden">
      <View className="flex-row items-center">
        <MonthSelector
          currentDay={selectedDate}
          currentMonth={getMonthName(currentMonth)}
        />

        <CalendarHeader
          month={getMonthName(currentMonth)}
          year={currentMonth.getFullYear()}
          onPrevMonth={handlePrevMonth}
          onNextMonth={handleNextMonth}
        />
      </View>

      <View className="border-t border-gray-700 mt-2" />

      <CalendarGrid
        days={days}
        selectedDate={selectedDate}
        onSelectDate={onSelectDate}
        highlightedDates={highlightedDates}
      />
    </View>
  );
};

export default CalendarView;
