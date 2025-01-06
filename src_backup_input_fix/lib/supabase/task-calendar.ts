import { createClient } from '@supabase/supabase-js';
import { Database } from '@/types/supabase';
import { TaskWithEvents, CalendarEventWithTask } from '@/types/task-calendar';

export class TaskCalendarService {
    private supabase;

    constructor() {
        this.supabase = createClient<Database>(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
        );
    }

    async getTaskWithEvents(taskId: string): Promise<TaskWithEvents | null> {
        const { data, error } = await this.supabase
            .from('tasks')
            .select(`
                *,
                events:task_events(
                    event:calendar_events(*)
                )
            `)
            .eq('id', taskId)
            .single();

        if (error) throw error;
        return data;
    }

    async getEventWithTask(eventId: string): Promise<CalendarEventWithTask | null> {
        const { data, error } = await this.supabase
            .from('calendar_events')
            .select(`
                *,
                task:task_events(
                    task:tasks(*)
                )
            `)
            .eq('id', eventId)
            .single();

        if (error) throw error;
        return data;
    }

    async getTasksForEvent(eventId: string): Promise<TaskWithEvents[]> {
        const { data, error } = await this.supabase
            .from('task_events')
            .select(`
                task:tasks(*)
            `)
            .eq('event_id', eventId);

        if (error) throw error;
        return data?.map(item => item.task) || [];
    }
} 