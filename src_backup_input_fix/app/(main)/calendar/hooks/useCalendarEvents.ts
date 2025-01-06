import { useState, useCallback } from 'react';
import { CalendarEvent } from '@/types/calendar';
import { UserSession } from '@/types/session';
import { calendarService } from '@/lib/supabase/services/calendar';

export function useCalendarEvents(session: UserSession) {
    const [events, setEvents] = useState<CalendarEvent[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const refreshEvents = useCallback(async () => {
        try {
            setIsLoading(true);
            setError(null);
            const fetchedEvents = await calendarService.getEvents(
                new Date(), // You'll want to pass these as parameters
                new Date(),
                session
            );
            setEvents(fetchedEvents);
        } catch (err) {
            console.error('Failed to refresh events:', err);
            setError(err instanceof Error ? err.message : 'Failed to refresh events');
            setEvents([]);
        } finally {
            setIsLoading(false);
        }
    }, [session]);

    const handleCreateEvent = useCallback(async (date: Date) => {
        try {
            setError(null);
            const eventData: Omit<CalendarEvent, 'id'> = {
                title: '',
                description: '',
                scheduled_for: date,
                duration: 60,
                type: 'meeting',
                status: 'pending',
                user_id: session.user.id,
                recurrence: null,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
                event_type: 'meeting'
            };
            const newEvent = await calendarService.createEvent(eventData, session);
            await refreshEvents();
            return newEvent;
        } catch (err) {
            console.error('Failed to create event:', err);
            setError(err instanceof Error ? err.message : 'Failed to create event');
            return null;
        }
    }, [session, refreshEvents]);

    const handleUpdateEvent = useCallback(async (event: CalendarEvent) => {
        try {
            setError(null);
            await calendarService.updateEvent(event, session);
            await refreshEvents();
        } catch (err) {
            console.error('Failed to update event:', err);
            setError(err instanceof Error ? err.message : 'Failed to update event');
        }
    }, [session, refreshEvents]);

    const handleDeleteEvent = useCallback(async (event: CalendarEvent) => {
        try {
            setError(null);
            await calendarService.deleteEvent(event.id, session);
            await refreshEvents();
        } catch (err) {
            console.error('Failed to delete event:', err);
            setError(err instanceof Error ? err.message : 'Failed to delete event');
        }
    }, [session, refreshEvents]);

    return {
        events,
        isLoading,
        error,
        refreshEvents,
        createEvent: handleCreateEvent,
        updateEvent: handleUpdateEvent,
        deleteEvent: handleDeleteEvent,
        setError
    };
} 