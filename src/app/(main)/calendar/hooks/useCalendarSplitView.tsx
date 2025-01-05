import { useCallback, useRef, useLayoutEffect } from 'react';
import { CalendarEvent } from '@/types/calendar';
import { useSplitViewStore } from '@/components/layouts/SplitViewContainer';
import { CalendarOverviewUpperCard } from '@/components/calendar/new/CalendarOverviewUpperCard';
import { CalendarOverviewLowerCard } from '@/components/calendar/new/CalendarOverviewLowerCard';
import { EventDetailsUpperCard, EventDetailsLowerCard } from '@/components/calendar/new/EventDetails';
import { FilteredEventsSplitView } from '@/components/calendar/new/FilteredEventsSplitView';
import { motion } from 'framer-motion';

const springTransition = {
    type: "spring",
    stiffness: 50,
    damping: 15
};

interface UseCalendarSplitViewProps {
    events: CalendarEvent[];
    currentDate: Date;
    onEventCreate: (date: Date) => void;
    onEventEdit: (event: CalendarEvent) => void;
    onEventDelete: (event: CalendarEvent) => void;
}

export function useCalendarSplitView({
    events,
    currentDate,
    onEventCreate,
    onEventEdit,
    onEventDelete
}: UseCalendarSplitViewProps) {
    const { setContentAndShow, hide } = useSplitViewStore();
    
    // Use refs to break circular dependencies
    const showCalendarOverviewRef = useRef<() => void>();
    const handleEventClickRef = useRef<(event: CalendarEvent) => void>();
    const eventsRef = useRef(events);
    const currentDateRef = useRef(currentDate);

    // Update refs when props change
    useLayoutEffect(() => {
        eventsRef.current = events;
        currentDateRef.current = currentDate;
    }, [events, currentDate]);

    const handleEventClick = useCallback((event: CalendarEvent) => {
        setContentAndShow(
            <EventDetailsUpperCard 
                event={event}
                onClose={() => showCalendarOverviewRef.current?.()}
                onEdit={() => onEventEdit(event)}
            />,
            <EventDetailsLowerCard 
                event={event}
                onEdit={() => onEventEdit(event)}
                onDelete={() => onEventDelete(event)}
            />,
            `event-${event.id}`
        );
    }, [setContentAndShow, onEventEdit, onEventDelete]);

    const handleViewFilteredEvents = useCallback((filteredEvents: CalendarEvent[], title: string) => {
        const { upperCard, lowerCard } = FilteredEventsSplitView.createCards(
            filteredEvents,
            title,
            () => showCalendarOverviewRef.current?.(),
            handleEventClickRef.current!
        );
        setContentAndShow(upperCard, lowerCard, 'filtered-events');
    }, [setContentAndShow]);

    const showCalendarOverview = useCallback(() => {
        const currentEvents = eventsRef.current;
        const currentDateValue = currentDateRef.current;
        
        hide();
        
        // Use setTimeout to ensure proper animation sequence
        setTimeout(() => {
            setContentAndShow(
                <div className="h-full">
                    <motion.div
                        className="h-full"
                        initial={{ y: "-100%" }}
                        animate={{ y: 0 }}
                        transition={springTransition}
                    >
                        <CalendarOverviewUpperCard 
                            events={currentEvents}
                            onViewEvents={handleViewFilteredEvents}
                            onEventClick={handleEventClickRef.current!}
                        />
                    </motion.div>
                </div>,
                <div className="h-full">
                    <motion.div
                        className="h-full"
                        initial={{ y: "100%" }}
                        animate={{ y: 0 }}
                        transition={springTransition}
                    >
                        <CalendarOverviewLowerCard 
                            events={currentEvents}
                            onCreateEvent={() => onEventCreate(currentDateValue)}
                            onViewUpcoming={() => {
                                const upcomingEvents = currentEvents.filter(e => new Date(e.scheduled_for) >= new Date());
                                handleViewFilteredEvents(upcomingEvents, "Upcoming Events");
                            }}
                            onJumpToday={() => {
                                const todayEvents = currentEvents.filter(event => {
                                    const eventDate = new Date(event.scheduled_for);
                                    return eventDate.toDateString() === new Date().toDateString();
                                });
                                handleViewFilteredEvents(todayEvents, "Today's Events");
                            }}
                        />
                    </motion.div>
                </div>,
                'calendar-overview'
            );
        }, 100);
    }, [handleViewFilteredEvents, onEventCreate, setContentAndShow, hide]);

    // Set up refs after function definitions
    handleEventClickRef.current = handleEventClick;
    showCalendarOverviewRef.current = showCalendarOverview;

    // Initialize the split view content
    useLayoutEffect(() => {
        requestAnimationFrame(() => {
            showCalendarOverview();
        });
    }, [showCalendarOverview]);

    return {
        handleViewFilteredEvents,
        handleEventClick,
        showCalendarOverview
    };
} 