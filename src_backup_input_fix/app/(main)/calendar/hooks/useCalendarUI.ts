import { useState, useCallback } from 'react';
import { CalendarEvent } from '@/types/calendar';
import { DateRangeType } from '@/components/calendar/new/DateRangeFilter';
import { PriorityType } from '@/components/calendar/new/PriorityFilter';

export type ViewType = 'month' | 'week' | 'day';

export function useCalendarUI() {
    const [viewType, setViewType] = useState<ViewType>('month');
    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedEventType, setSelectedEventType] = useState<string | null>(null);
    const [selectedStatus, setSelectedStatus] = useState<string | null>(null);
    const [selectedDateRange, setSelectedDateRange] = useState<{ 
        type: DateRangeType, 
        range: { start: Date, end: Date } 
    } | null>(null);
    const [selectedPriority, setSelectedPriority] = useState<PriorityType | null>(null);

    const handleDateChange = useCallback((newDate: Date) => {
        setCurrentDate(newDate);
    }, []);

    const handleViewChange = useCallback((newView: ViewType) => {
        setViewType(newView);
    }, []);

    const handleJumpToday = useCallback(() => {
        setCurrentDate(new Date());
    }, []);

    return {
        viewType,
        currentDate,
        selectedEventType,
        selectedStatus,
        selectedDateRange,
        selectedPriority,
        handleDateChange,
        handleViewChange,
        handleJumpToday,
        setSelectedEventType,
        setSelectedStatus,
        setSelectedDateRange,
        setSelectedPriority
    };
} 