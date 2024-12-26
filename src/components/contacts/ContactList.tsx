'use client'

import { useMemo } from 'react'
import { motion } from 'framer-motion'
import { Mail, Phone, Building2 } from 'lucide-react'

interface Contact {
  id: string
  name: string
  email: string
  phone: string
  company: string
  role: string
  tags: string[]
  isPinned: boolean
}

interface ContactListProps {
  contacts: Contact[]
  onSelectContact: (contact: Contact) => void
}

export function ContactList({ contacts, onSelectContact }: ContactListProps) {
  const { pinnedContacts, alphabeticalGroups } = useMemo(() => {
    const pinned = contacts.filter(c => c.isPinned)
    
    const grouped = contacts
      .filter(c => !c.isPinned)
      .reduce((acc, contact) => {
        const firstLetter = contact.name.charAt(0).toUpperCase()
        if (!acc[firstLetter]) {
          acc[firstLetter] = []
        }
        acc[firstLetter].push(contact)
        return acc
      }, {} as Record<string, Contact[]>)

    // Sort contacts within each group
    Object.keys(grouped).forEach(key => {
      grouped[key].sort((a, b) => a.name.localeCompare(b.name))
    })

    return {
      pinnedContacts: pinned,
      alphabeticalGroups: Object.entries(grouped).sort(([a], [b]) => a.localeCompare(b))
    }
  }, [contacts])

  return (
    <div className="space-y-6">
      {/* Pinned Contacts */}
      {pinnedContacts.length > 0 && (
        <div>
          <div className="px-6 py-2 text-sm font-medium text-zinc-400">
            PINNED
          </div>
          <div className="space-y-1">
            {pinnedContacts.map(contact => (
              <ContactCard
                key={contact.id}
                contact={contact}
                onSelect={onSelectContact}
              />
            ))}
          </div>
        </div>
      )}

      {/* Alphabetical Groups */}
      {alphabeticalGroups.map(([letter, groupContacts]) => (
        <div key={letter}>
          <div className="px-6 py-2 text-sm font-medium text-zinc-400">
            {letter}
          </div>
          <div className="space-y-1">
            {groupContacts.map(contact => (
              <ContactCard
                key={contact.id}
                contact={contact}
                onSelect={onSelectContact}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

function ContactCard({ 
  contact, 
  onSelect 
}: { 
  contact: Contact
  onSelect: (contact: Contact) => void
}) {
  return (
    <motion.div
      className="group px-6 py-3 cursor-pointer hover:bg-white/[0.02] transition-colors"
      onClick={() => onSelect(contact)}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
    >
      <div className="flex items-center gap-4">
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500/50 to-purple-500/50 flex items-center justify-center text-white font-medium">
          {contact.name.charAt(0)}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-medium truncate">{contact.name}</h3>
            <span className="text-xs text-zinc-500">{contact.role}</span>
          </div>
          <div className="mt-1 text-sm text-zinc-400 space-y-1">
            <div className="flex items-center gap-2">
              <Mail className="w-4 h-4 text-blue-400" />
              <span className="truncate">{contact.email}</span>
            </div>
            <div className="flex items-center gap-2">
              <Phone className="w-4 h-4 text-green-400" />
              <span>{contact.phone}</span>
            </div>
            <div className="flex items-center gap-2">
              <Building2 className="w-4 h-4 text-purple-400" />
              <span>{contact.company}</span>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  )
} 