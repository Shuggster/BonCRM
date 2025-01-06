'use client'

import { useState } from "react"
import { Contact } from "@/types"
import { motion } from "framer-motion"
import { EditContact } from "./EditContact"
import { Button } from "@/components/ui/button"
import { X, Save } from "lucide-react"

interface EditContactSplitViewProps {
  contact: Contact
  onSave: (data: Partial<Contact>) => Promise<void>
  onCancel: () => void
}

export function EditContactSplitView({ contact: initialContact, onSave, onCancel }: EditContactSplitViewProps) {
  const [contact, setContact] = useState<Contact>(initialContact)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleFieldUpdate = (field: keyof Contact, value: any) => {
    if (field === 'website') {
      // Handle website URLs
      let formattedValue = value.trim()
      if (formattedValue && !formattedValue.match(/^(https?:\/\/|www\.)/)) {
        formattedValue = 'www.' + formattedValue
      }
      if (formattedValue && formattedValue.startsWith('www.')) {
        formattedValue = 'https://' + formattedValue
      }
      value = formattedValue
    }
    setContact(prev => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async () => {
    if (!contact.id) {
      setError('Contact ID is missing')
      return
    }
    
    setSaving(true)
    setError(null)

    try {
      const updateData: Partial<Contact> = {
        first_name: contact.first_name?.trim() || undefined,
        last_name: contact.last_name?.trim() || undefined,
        email: contact.email?.trim() || undefined,
        phone: contact.phone?.trim() || undefined,
        job_title: contact.job_title?.trim() || undefined,
        company: contact.company?.trim() || undefined,
        department: contact.department?.trim() || undefined,
        industry_id: contact.industry_id || undefined,
        website: contact.website?.trim() || undefined,
        linkedin: contact.linkedin?.trim() || undefined,
        twitter: contact.twitter?.trim() || undefined,
        facebook: contact.facebook?.trim() || undefined,
        whatsapp: contact.whatsapp?.trim() || undefined,
        address_line1: contact.address_line1?.trim() || undefined,
        address_line2: contact.address_line2?.trim() || undefined,
        city: contact.city?.trim() || undefined,
        region: contact.region?.trim() || undefined,
        postcode: contact.postcode?.trim() || undefined,
        country: contact.country?.trim() || undefined,
        assigned_to: contact.assigned_to || undefined,
        assigned_to_type: contact.assigned_to_type || undefined,
      }

      await onSave(updateData)
    } catch (err: any) {
      console.error('Error updating contact:', err)
      setError(err?.message || 'Failed to update contact')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="h-full flex flex-col rounded-b-2xl">
      <div className="flex-1 flex flex-col min-h-0">
        {/* Upper Section */}
        <motion.div
          key="edit-upper"
          className="flex-none"
          initial={{ y: "-100%" }}
          animate={{ 
            y: 0,
            transition: {
              type: "spring",
              stiffness: 50,
              damping: 15
            }
          }}
        >
          <div className="relative rounded-t-2xl overflow-hidden backdrop-blur-[16px]" style={{ background: 'linear-gradient(145deg, rgba(255, 255, 255, 0.05), rgba(255, 255, 255, 0.02))', borderBottom: '1px solid rgba(255, 255, 255, 0.1)' }}>
            <div className="relative z-10">
              <EditContact
                contact={contact}
                section="upper"
                onFieldUpdate={handleFieldUpdate}
              />
            </div>
          </div>
        </motion.div>

        {/* Lower Section */}
        <motion.div
          key="edit-lower"
          className="flex-1 min-h-0"
          initial={{ y: "100%" }}
          animate={{ 
            y: 0,
            transition: {
              type: "spring",
              stiffness: 50,
              damping: 15
            }
          }}
        >
          <div className="relative rounded-b-2xl overflow-hidden backdrop-blur-[16px]" style={{ background: 'linear-gradient(145deg, rgba(255, 255, 255, 0.05), rgba(255, 255, 255, 0.02))', borderTop: '1px solid rgba(255, 255, 255, 0.1)' }}>
            <div className="relative z-10">
              <EditContact
                contact={contact}
                section="lower"
                onFieldUpdate={handleFieldUpdate}
              />
            </div>
          </div>
        </motion.div>
      </div>

      {/* Fixed Save Button */}
      <div className="fixed bottom-0 left-0 right-0 px-8 py-6 bg-[#111111] border-t border-white/10 flex justify-between items-center z-50 rounded-b-2xl">
        <Button
          variant="outline"
          size="sm"
          onClick={onCancel}
          className="text-white/70 border-white/10 hover:bg-white/5"
        >
          <X className="w-4 h-4 mr-2" />
          Cancel
        </Button>
        <Button
          variant="default"
          size="sm"
          onClick={handleSubmit}
          disabled={saving}
          type="button"
          className="bg-[#111111] hover:bg-[#1a1a1a] text-white px-4 h-10 rounded-lg font-medium transition-colors border border-white/[0.08] flex items-center gap-2"
        >
          <Save className="w-4 h-4" />
          {saving ? 'Saving...' : 'Save Changes'}
        </Button>
      </div>
    </div>
  )
} 