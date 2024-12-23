import { supabase } from "./supabase"

type ActivityType = 
  | 'note_added'
  | 'note_edited'
  | 'note_deleted'
  | 'tag_added'
  | 'tag_removed'
  | 'contact_edited'
  | 'contact_created'
  | 'email_updated'
  | 'phone_updated'

export async function logActivity(
  contactId: string,
  type: ActivityType,
  description: string,
  metadata: any = {}
) {
  try {
    const { error } = await supabase
      .from('contact_activities')
      .insert([{
        contact_id: contactId,
        type,
        description,
        metadata
      }])

    if (error) throw error
  } catch (err) {
    console.error('Failed to log activity:', err)
  }
} 