"use client"

import { useEffect, useState } from "react"
import { Users, Plus, ChevronUp, ChevronDown, Download, Trash, Tags, BarChart2 } from "lucide-react"
import { supabase } from "@/lib/supabase"
import { PageHeader } from "@/components/ui/page-header"
import { CreateContactModal } from "@/components/contacts/create-contact-modal"
import { EditContactModal } from "@/components/contacts/edit-contact-modal"
import { DeleteContactModal } from "@/components/contacts/delete-contact-modal"
import { ContactDetailsModal } from "@/components/contacts/contact-details-modal"
import { BulkDeleteModal } from "@/components/contacts/bulk-delete-modal"
import { BulkTagModal } from "@/components/contacts/bulk-tag-modal"
import { TagStatisticsModal } from "@/components/contacts/tag-statistics-modal"
import { Avatar } from "@/components/contacts/avatar"
import Sidebar from '@/components/layout/Sidebar'

interface Contact {
  id: string
  name: string
  email: string
  phone: string | null
  created_at: string
  company: string | null
  job_title: string | null
  address_line1: string | null
  address_line2: string | null
  city: string | null
  region: string | null
  postcode: string | null
  country: string | null
  website: string | null
  linkedin: string | null
  twitter: string | null
  avatar_url: string | null
  tags: {
    id: string
    name: string
    color: string
  }[]
}

type SortField = keyof Contact
type SortDirection = 'asc' | 'desc'

export default function ContactsPage() {
  const [contacts, setContacts] = useState<Contact[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [sortField, setSortField] = useState<SortField>('name')
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc')
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false)
  const [selectedContactIds, setSelectedContactIds] = useState<string[]>([])
  const [isBulkDeleteModalOpen, setIsBulkDeleteModalOpen] = useState(false)
  const [selectedTagFilter, setSelectedTagFilter] = useState<string | null>(null)
  const [isBulkTagModalOpen, setIsBulkTagModalOpen] = useState(false)
  const [isTagStatsModalOpen, setIsTagStatsModalOpen] = useState(false)

  useEffect(() => {
    fetchContacts()
  }, [])

  async function fetchContacts(retryCount = 0) {
    try {
      const { data, error } = await supabase
        .from('contacts')
        .select(`
          id,
          name,
          email,
          phone,
          created_at,
          company,
          job_title,
          address_line1,
          address_line2,
          city,
          region,
          postcode,
          country,
          website,
          linkedin,
          twitter,
          avatar_url,
          tags:contact_tag_relations(
            tag:contact_tags(
              id,
              name,
              color
            )
          )
        `)
        .order(sortField, { ascending: sortDirection === "asc" })
      
      if (error) {
        if (error.message.includes('JWT') && retryCount < 3) {
          // Wait a bit and retry
          await new Promise(resolve => setTimeout(resolve, 1000))
          return fetchContacts(retryCount + 1)
        }
        throw error
      }
      
      const transformedData = data?.map(contact => ({
        ...contact,
        tags: contact.tags?.map((t: any) => t.tag) || []
      }))
      
      setContacts(transformedData || [])
    } catch (err: any) {
      console.error('Error:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDirection('asc')
    }
  }

  const sortContacts = (contacts: Contact[]) => {
    return [...contacts].sort((a, b) => {
      const aValue = a[sortField]
      const bValue = b[sortField]

      if (aValue === null) return sortDirection === 'asc' ? 1 : -1
      if (bValue === null) return sortDirection === 'asc' ? -1 : 1

      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1
      return 0
    })
  }

  const filteredAndSortedContacts = sortContacts(
    contacts.filter(contact => {
      // Text search matching
      const matchesSearch = 
        contact.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        contact.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (contact.phone && contact.phone.includes(searchQuery)) ||
        // Add tag name search
        contact.tags.some(tag => tag.name.toLowerCase().includes(searchQuery.toLowerCase()))

      // Tag filter matching
      const matchesTagFilter = 
        !selectedTagFilter || 
        contact.tags.some(tag => tag.id === selectedTagFilter)

      return matchesSearch && matchesTagFilter
    })
  )

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) return <ChevronUp className="h-4 w-4 text-gray-400" />
    return sortDirection === 'asc' 
      ? <ChevronUp className="h-4 w-4" />
      : <ChevronDown className="h-4 w-4" />
  }

  const handleContactCreated = () => {
    fetchContacts()
  }

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedContactIds(filteredAndSortedContacts.map(contact => contact.id))
    } else {
      setSelectedContactIds([])
    }
  }

  const handleSelectContact = (contactId: string) => {
    setSelectedContactIds(prev => 
      prev.includes(contactId)
        ? prev.filter(id => id !== contactId)
        : [...prev, contactId]
    )
  }

  const exportContacts = () => {
    const contacts = selectedContactIds.length > 0
      ? filteredAndSortedContacts.filter(c => selectedContactIds.includes(c.id))
      : filteredAndSortedContacts

    const csvContent = [
      [
        'Name',
        'Email',
        'Phone',
        'Company',
        'Job Title',
        'Address Line 1',
        'Address Line 2',
        'City',
        'Region',
        'Postal Code',
        'Country',
        'Website',
        'LinkedIn',
        'Twitter',
        'Created At',
        'Tags'
      ],
      ...contacts.map(contact => [
        contact.name,
        contact.email,
        contact.phone || '',
        contact.company || '',
        contact.job_title || '',
        contact.address_line1 || '',
        contact.address_line2 || '',
        contact.city || '',
        contact.region || '',
        contact.postcode || '',
        contact.country || '',
        contact.website || '',
        contact.linkedin || '',
        contact.twitter || '',
        new Date(contact.created_at).toLocaleDateString(),
        contact.tags.map(tag => tag.name).join(', ')
      ])
    ].map(row => row.join(',')).join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'contacts.csv'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    window.URL.revokeObjectURL(url)
  }

  const getAllUniqueTags = () => {
    const tagsMap = new Map()
    contacts.forEach(contact => {
      contact.tags.forEach(tag => {
        tagsMap.set(tag.id, tag)
      })
    })
    return Array.from(tagsMap.values())
  }

  if (loading) return <div className="text-white">Loading...</div>
  if (error) return <div className="text-red-400">Error: {error}</div>

  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      <main className="flex-1 overflow-y-auto bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="space-y-4">
          <div className="flex items-center justify-between mb-6">
            <PageHeader
              heading="Contacts"
              description="Manage your contacts and their information."
              icon={<div className="icon-contacts"><Users className="h-6 w-6" /></div>}
            />
            <div className="flex items-center gap-4">
              <input
                type="text"
                placeholder="Search contacts..."
                className="px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <select
                value={selectedTagFilter || ''}
                onChange={(e) => setSelectedTagFilter(e.target.value || null)}
                className="px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Tags</option>
                {getAllUniqueTags().map(tag => (
                  <option key={tag.id} value={tag.id}>
                    {tag.name}
                  </option>
                ))}
              </select>
              <button
                onClick={() => setIsTagStatsModalOpen(true)}
                className="flex items-center gap-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
              >
                <BarChart2 className="h-4 w-4" />
                Tag Stats
              </button>
              {selectedContactIds.length > 0 && (
                <>
                  <button
                    onClick={() => setIsBulkTagModalOpen(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
                  >
                    <Tags className="h-4 w-4" />
                    Manage Tags ({selectedContactIds.length})
                  </button>
                  <button
                    onClick={() => setIsBulkDeleteModalOpen(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors"
                  >
                    <Trash className="h-4 w-4" />
                    Delete ({selectedContactIds.length})
                  </button>
                  <button
                    onClick={exportContacts}
                    className="flex items-center gap-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
                  >
                    <Download className="h-4 w-4" />
                    Export Selected
                  </button>
                </>
              )}
              <button
                onClick={() => setIsCreateModalOpen(true)}
                className="flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
              >
                <Plus className="h-4 w-4" />
                Add Contact
              </button>
            </div>
          </div>

          <div className="overflow-x-auto rounded-lg">
            <table className="min-w-full bg-gray-800 border border-gray-700">
              <thead>
                <tr>
                  <th className="px-6 py-3 border-b border-gray-700 bg-gray-800">
                    <input
                      type="checkbox"
                      checked={selectedContactIds.length === filteredAndSortedContacts.length}
                      onChange={handleSelectAll}
                      className="rounded border-gray-600 text-blue-500 focus:ring-blue-500"
                    />
                  </th>
                  <th 
                    onClick={() => handleSort('name')}
                    className="px-6 py-3 border-b border-gray-700 bg-gray-800 text-left text-xs font-medium text-gray-400 uppercase tracking-wider cursor-pointer hover:bg-gray-700"
                  >
                    <div className="flex items-center gap-2">
                      Name
                      <SortIcon field="name" />
                    </div>
                  </th>
                  <th 
                    onClick={() => handleSort('email')}
                    className="px-6 py-3 border-b border-gray-700 bg-gray-800 text-left text-xs font-medium text-gray-400 uppercase tracking-wider cursor-pointer hover:bg-gray-700"
                  >
                    <div className="flex items-center gap-2">
                      Email
                      <SortIcon field="email" />
                    </div>
                  </th>
                  <th 
                    onClick={() => handleSort('phone')}
                    className="px-6 py-3 border-b border-gray-700 bg-gray-800 text-left text-xs font-medium text-gray-400 uppercase tracking-wider cursor-pointer hover:bg-gray-700"
                  >
                    <div className="flex items-center gap-2">
                      Phone
                      <SortIcon field="phone" />
                    </div>
                  </th>
                  <th 
                    onClick={() => handleSort('created_at')}
                    className="px-6 py-3 border-b border-gray-700 bg-gray-800 text-left text-xs font-medium text-gray-400 uppercase tracking-wider cursor-pointer hover:bg-gray-700"
                  >
                    <div className="flex items-center gap-2">
                      Created
                      <SortIcon field="created_at" />
                    </div>
                  </th>
                  <th className="px-6 py-3 border-b border-gray-700 bg-gray-800 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Tags
                  </th>
                  <th className="px-6 py-3 border-b border-gray-700 bg-gray-800 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredAndSortedContacts.map((contact) => (
                  <tr key={contact.id} className="hover:bg-gray-700">
                    <td className="px-6 py-4 border-b border-gray-700">
                      <input
                        type="checkbox"
                        checked={selectedContactIds.includes(contact.id)}
                        onChange={() => handleSelectContact(contact.id)}
                        className="rounded border-gray-600 text-blue-500 focus:ring-blue-500"
                      />
                    </td>
                    <td 
                      onClick={() => {
                        setSelectedContact(contact)
                        setIsDetailsModalOpen(true)
                      }}
                      className="px-6 py-4 border-b border-gray-700 text-gray-300 cursor-pointer hover:text-blue-400"
                    >
                      <div className="flex items-center gap-2">
                        <Avatar url={contact.avatar_url} size="sm" name={contact.name} />
                        <span>{contact.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 border-b border-gray-700 text-gray-300">{contact.email}</td>
                    <td className="px-6 py-4 border-b border-gray-700 text-gray-300">{contact.phone || '-'}</td>
                    <td className="px-6 py-4 border-b border-gray-700 text-gray-300">
                      {new Date(contact.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 border-b border-gray-700 text-gray-300">
                      <div className="flex flex-wrap gap-1">
                        {contact.tags.map((tag) => (
                          <span
                            key={tag.id}
                            style={{ backgroundColor: tag.color + '20', color: tag.color }}
                            className="px-2 py-1 rounded-full text-xs font-medium"
                          >
                            {tag.name}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-4 border-b border-gray-700 text-gray-300">
                      <button 
                        onClick={() => {
                          setSelectedContact(contact)
                          setIsEditModalOpen(true)
                        }}
                        className="text-blue-400 hover:text-blue-300 mr-2"
                      >
                        Edit
                      </button>
                      <button 
                        onClick={() => {
                          setSelectedContact(contact)
                          setIsDeleteModalOpen(true)
                        }}
                        className="text-red-400 hover:text-red-300"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <CreateContactModal
            isOpen={isCreateModalOpen}
            onClose={() => setIsCreateModalOpen(false)}
            onContactCreated={fetchContacts}
          />

          <EditContactModal
            contact={selectedContact}
            isOpen={isEditModalOpen}
            onClose={() => {
              setIsEditModalOpen(false)
              setSelectedContact(null)
            }}
            onContactUpdated={fetchContacts}
          />

          <DeleteContactModal
            contactId={selectedContact?.id || null}
            contactName={selectedContact?.name || null}
            isOpen={isDeleteModalOpen}
            onClose={() => {
              setIsDeleteModalOpen(false)
              setSelectedContact(null)
            }}
            onContactDeleted={fetchContacts}
          />

          <ContactDetailsModal
            contact={selectedContact}
            isOpen={isDetailsModalOpen}
            onClose={() => {
              setIsDetailsModalOpen(false)
              setSelectedContact(null)
            }}
            onEdit={() => {
              setIsDetailsModalOpen(false)
              setIsEditModalOpen(true)
            }}
          />

          <BulkTagModal
            isOpen={isBulkTagModalOpen}
            onClose={() => setIsBulkTagModalOpen(false)}
            selectedContactIds={selectedContactIds}
            existingTags={getAllUniqueTags()}
            onComplete={fetchContacts}
          />

          <TagStatisticsModal
            isOpen={isTagStatsModalOpen}
            onClose={() => setIsTagStatsModalOpen(false)}
          />
        </div>
      </main>
    </div>
  )
}
