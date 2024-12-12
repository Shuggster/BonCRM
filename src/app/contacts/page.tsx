"use client"

import { useEffect, useState } from "react"
import { Users, Plus, ChevronUp, ChevronDown, Download, Trash, Tags, BarChart2, Mail, Phone, Calendar, Building2, FolderOpen, FolderClosed } from "lucide-react"
import { supabase } from "@/lib/supabase"
import { PageHeader } from "@/components/ui/page-header"
import { CreateContactModal } from "@/components/contacts/create-contact-modal"
import { EditContactModal } from "@/components/contacts/edit-contact-modal"
import { DeleteContactModal } from "@/components/contacts/delete-contact-modal"
import { ContactDetailsModal } from "@/components/contacts/contact-details-modal"
import { BulkDeleteModal } from "@/components/contacts/bulk-delete-modal"
import { BulkTagModal } from "@/components/contacts/bulk-tag-modal"
import { TagStatisticsModal } from "@/components/contacts/tag-statistics-modal"
import { TagManagementModal } from "@/components/contacts/tag-management-modal"
import { IndustryManagementModal } from "@/components/contacts/industry-management-modal"
import { Avatar } from "@/components/contacts/avatar"
import { TagFilterMenu } from "@/components/contacts/tag-filter-menu"
import { Button } from "@/components/ui/button"
import { Fragment } from "react"

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
  industry_id: string | null
  industry: {
    id: string
    name: string
    description: string
  } | null
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
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>([])
  const [tagFilterMode, setTagFilterMode] = useState<'AND' | 'OR'>('OR')
  const [isBulkTagModalOpen, setIsBulkTagModalOpen] = useState(false)
  const [isTagStatsModalOpen, setIsTagStatsModalOpen] = useState(false)
  const [isTagManagementModalOpen, setIsTagManagementModalOpen] = useState(false)
  const [isIndustryManagementModalOpen, setIsIndustryManagementModalOpen] = useState(false)
  const [groupBy, setGroupBy] = useState<'none' | 'company'>('none')
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set())

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
          industry_id,
          industry:industries(
            id,
            name,
            description
          ),
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
        tags: contact.tags?.map((t: any) => t.tag) || [],
        industry: contact.industry
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

  const filteredContacts = contacts
    .filter(contact => {
      // Search filter
      const searchLower = searchQuery.toLowerCase()
      const matchesSearch = !searchQuery || 
        contact.name.toLowerCase().includes(searchLower) ||
        contact.email.toLowerCase().includes(searchLower) ||
        contact.phone?.toLowerCase().includes(searchLower) ||
        contact.company?.toLowerCase().includes(searchLower)

      // Tag filter
      const matchesTags = selectedTagIds.length === 0 || (
        tagFilterMode === 'AND'
          ? selectedTagIds.every(tagId => 
              contact.tags.some(t => t.id === tagId)
            )
          : selectedTagIds.some(tagId => 
              contact.tags.some(t => t.id === tagId)
            )
      )

      return matchesSearch && matchesTags
    })

  const toggleGroup = (groupName: string) => {
    const newExpandedGroups = new Set(expandedGroups)
    if (newExpandedGroups.has(groupName)) {
      newExpandedGroups.delete(groupName)
    } else {
      newExpandedGroups.add(groupName)
    }
    setExpandedGroups(newExpandedGroups)
  }

  const groupedContacts = () => {
    if (groupBy === 'none') return { 'All Contacts': filteredContacts }

    const groups: { [key: string]: Contact[] } = {}
    filteredContacts.forEach(contact => {
      const groupName = contact.company || 'No Company'
      if (!groups[groupName]) {
        groups[groupName] = []
      }
      groups[groupName].push(contact)
    })

    // Sort groups by name
    return Object.keys(groups)
      .sort()
      .reduce((acc, key) => {
        acc[key] = groups[key]
        return acc
      }, {} as { [key: string]: Contact[] })
  }

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) return <ChevronUp className="h-4 w-4 text-gray-400" />
    return sortDirection === 'asc' 
      ? <ChevronUp className="h-4 w-4" />
      : <ChevronDown className="h-4 w-4" />
  }

  const handleContactCreated = () => {
    fetchContacts()
  }

  const toggleSelectAll = () => {
    if (selectedContactIds.length === filteredContacts.length) {
      setSelectedContactIds([])
    } else {
      setSelectedContactIds(filteredContacts.map(c => c.id))
    }
  }

  const toggleContactSelection = (id: string) => {
    if (selectedContactIds.includes(id)) {
      setSelectedContactIds(selectedContactIds.filter(cid => cid !== id))
    } else {
      setSelectedContactIds([...selectedContactIds, id])
    }
  }

  const exportToCSV = () => {
    const contacts = selectedContactIds.length > 0
      ? filteredContacts.filter(c => selectedContactIds.includes(c.id))
      : filteredContacts

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
        'Tags',
        'Industry'
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
        contact.tags.map(tag => tag.name).join(', '),
        contact.industry?.name || ''
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
      <main className="flex-1 overflow-hidden bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="h-full flex flex-col p-4 md:p-6">
          <div className="space-y-4">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <PageHeader
                heading="Contacts"
                description="Manage your contacts and their information."
                icon={<div className="icon-contacts"><Users className="h-6 w-6" /></div>}
              />
              <div className="flex flex-wrap gap-2 sm:flex-row sm:items-center">
                <div className="w-full sm:w-auto">
                  <input
                    type="text"
                    placeholder="Search contacts..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full px-3 py-2 bg-background border border-input rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  />
                </div>
                <select
                  value={groupBy}
                  onChange={(e) => setGroupBy(e.target.value as 'none' | 'company')}
                  className="px-3 py-2 bg-background border border-input rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <option value="none">No Grouping</option>
                  <option value="company">Group by Company</option>
                </select>
                <div className="flex gap-2 w-full sm:w-auto">
                  <TagFilterMenu 
                    onTagSelect={(tagIds) => setSelectedTagIds(tagIds)}
                    onOpenTagStats={() => setIsTagStatsModalOpen(true)}
                    onManageTags={() => {
                      setIsTagManagementModalOpen(true)
                    }}
                  />
                  <Button
                    onClick={() => setIsIndustryManagementModalOpen(true)}
                    variant="outline"
                    className="flex items-center gap-2"
                  >
                    <Building2 className="h-4 w-4" />
                    Manage Industries
                  </Button>
                  <Button
                    onClick={() => setIsCreateModalOpen(true)}
                    className="flex-1 sm:flex-none bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg hover:shadow-xl transition-all duration-200 animate-in fade-in-0 zoom-in-95"
                    size="default"
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Add Contact
                  </Button>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              {selectedContactIds.length > 0 && (
                <>
                  <button
                    onClick={() => setIsBulkTagModalOpen(true)}
                    className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-3 py-2 bg-gray-800/50 hover:bg-gray-700/50 text-white rounded-lg transition-colors"
                  >
                    <Tags className="h-4 w-4" />
                    Tag Selected ({selectedContactIds.length})
                  </button>
                  <button
                    onClick={() => setIsBulkDeleteModalOpen(true)}
                    className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-3 py-2 bg-red-900/50 hover:bg-red-800/50 text-white rounded-lg transition-colors"
                  >
                    <Trash className="h-4 w-4" />
                    Delete Selected ({selectedContactIds.length})
                  </button>
                </>
              )}
              <div className="flex-1" />
              <button
                onClick={exportToCSV}
                className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-3 py-2 bg-gray-800/50 hover:bg-gray-700/50 text-white rounded-lg transition-colors"
              >
                <Download className="h-4 w-4" />
                Export CSV
              </button>
            </div>
          </div>

          <div className="relative flex-1 mt-6">
            <div className="absolute inset-0 rounded-lg bg-gray-800/30">
              <div className="h-full overflow-auto">
                <div className="hidden md:block">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr>
                        <th className="sticky top-0 w-10 p-3 bg-gray-800/50">
                          <input
                            type="checkbox"
                            checked={selectedContactIds.length === filteredContacts.length}
                            onChange={toggleSelectAll}
                            className="rounded border-gray-700 bg-gray-800/50"
                          />
                        </th>
                        {groupBy === 'company' && (
                          <th className="sticky top-0 w-10 p-3 bg-gray-800/50">
                          </th>
                        )}
                        <th className="sticky top-0 px-4 py-3 bg-gray-800/50 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                          Name
                        </th>
                        <th className="sticky top-0 px-4 py-3 bg-gray-800/50 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                          Email
                        </th>
                        <th className="sticky top-0 px-4 py-3 bg-gray-800/50 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                          Phone
                        </th>
                        <th className="sticky top-0 px-4 py-3 bg-gray-800/50 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                          Created
                        </th>
                        <th className="sticky top-0 px-4 py-3 bg-gray-800/50 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                          Tags
                        </th>
                        <th className="sticky top-0 px-4 py-3 bg-gray-800/50 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                          Industry
                        </th>
                        <th className="sticky top-0 px-4 py-3 bg-gray-800/50 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-800/50">
                      {Object.entries(groupedContacts()).map(([groupName, groupContacts]) => (
                        <Fragment key={`group-${groupName}`}>
                          {groupBy === 'company' && (
                            <tr key={`group-${groupName}`} className="bg-gray-800/20">
                              <td></td>
                              <td className="p-2">
                                <button
                                  onClick={() => toggleGroup(groupName)}
                                  className="p-1 hover:bg-gray-700/30 rounded"
                                >
                                  {expandedGroups.has(groupName) ? (
                                    <FolderOpen className="w-4 h-4" />
                                  ) : (
                                    <FolderClosed className="w-4 h-4" />
                                  )}
                                </button>
                              </td>
                              <td colSpan={7} className="px-4 py-2 font-medium flex items-center gap-2">
                                <Building2 className="w-4 h-4 text-gray-400" />
                                {groupName} ({groupContacts.length})
                              </td>
                            </tr>
                          )}
                          {(groupBy === 'none' || expandedGroups.has(groupName)) && 
                            groupContacts.map(contact => (
                              <tr
                                key={contact.id}
                                className="group hover:bg-gray-800/30 transition-colors cursor-pointer"
                                onClick={(e) => {
                                  if (
                                    (e.target as HTMLElement).closest('input[type="checkbox"]') ||
                                    (e.target as HTMLElement).closest('button')
                                  ) return;
                                  setSelectedContact(contact);
                                  setIsDetailsModalOpen(true);
                                }}
                              >
                                <td className="p-3" onClick={e => e.stopPropagation()}>
                                  <input
                                    type="checkbox"
                                    checked={selectedContactIds.includes(contact.id)}
                                    onChange={() => toggleContactSelection(contact.id)}
                                    className="rounded border-gray-700 bg-gray-800/50"
                                  />
                                </td>
                                <td className="px-4 py-3 text-gray-300 group-hover:text-blue-400">
                                  <div className="flex items-center gap-2">
                                    <Avatar url={contact.avatar_url} size="sm" name={contact.name} />
                                    <span>{contact.name}</span>
                                  </div>
                                </td>
                                <td className="px-4 py-3">
                                  <a 
                                    href={`mailto:${contact.email}`}
                                    onClick={e => e.stopPropagation()}
                                    className="flex items-center gap-1 text-gray-300 hover:text-purple-400 transition-colors"
                                  >
                                    {contact.email}
                                    <Mail className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                                  </a>
                                </td>
                                <td className="px-4 py-3 text-gray-300">
                                  {contact.phone ? (
                                    <a 
                                      href={`tel:${contact.phone}`}
                                      onClick={e => e.stopPropagation()}
                                      className="flex items-center gap-1 hover:text-green-400 transition-colors"
                                    >
                                      {contact.phone}
                                      <Phone className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                                    </a>
                                  ) : (
                                    '-'
                                  )}
                                </td>
                                <td className="px-4 py-3 text-gray-300">
                                  {new Date(contact.created_at).toLocaleDateString()}
                                </td>
                                <td className="px-4 py-3 text-gray-300">
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
                                <td className="px-4 py-3 text-gray-300">
                                  {contact.industry?.name || '-'}
                                </td>
                                <td className="px-4 py-3 text-gray-300" onClick={e => e.stopPropagation()}>
                                  <div className="flex items-center gap-2">
                                    <button 
                                      onClick={() => {
                                        setSelectedContact(contact)
                                        setIsEditModalOpen(true)
                                      }}
                                      className="text-blue-400 hover:text-blue-300"
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
                                  </div>
                                </td>
                              </tr>
                            ))}
                        </Fragment>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Mobile/Tablet Card View */}
                <div className="md:hidden">
                  <div className="p-4 flex items-center gap-3 bg-gray-800/50 sticky top-0">
                    <input
                      type="checkbox"
                      checked={selectedContactIds.length === filteredContacts.length}
                      onChange={toggleSelectAll}
                      className="rounded border-gray-700 bg-gray-800/50"
                    />
                    <span className="text-sm text-gray-400">Select All</span>
                  </div>
                  <div className="divide-y divide-gray-800/50">
                    {filteredContacts.map(contact => (
                      <div key={contact.id} className="p-4 hover:bg-gray-800/30 transition-colors">
                        <div className="flex items-start gap-3">
                          <input
                            type="checkbox"
                            checked={selectedContactIds.includes(contact.id)}
                            onChange={() => toggleContactSelection(contact.id)}
                            className="mt-2 rounded border-gray-700 bg-gray-800/50"
                          />
                          <div className="flex-1 space-y-3">
                            <div 
                              onClick={() => {
                                setSelectedContact(contact)
                                setIsDetailsModalOpen(true)
                              }}
                              className="flex items-center gap-2 cursor-pointer hover:text-blue-400"
                            >
                              <Avatar url={contact.avatar_url} size="sm" name={contact.name} />
                              <span className="text-gray-300 font-medium">{contact.name}</span>
                            </div>
                            <div className="grid gap-2 text-sm">
                              <div className="flex items-center gap-2">
                                <Mail className="w-4 h-4 text-gray-500" />
                                <span className="text-gray-300">{contact.email}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Phone className="w-4 h-4 text-gray-500" />
                                <span className="text-gray-300">{contact.phone || '-'}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Calendar className="w-4 h-4 text-gray-500" />
                                <span className="text-gray-300">{new Date(contact.created_at).toLocaleDateString()}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Building2 className="w-4 h-4 text-gray-500" />
                                <span className="text-gray-300">{contact.industry?.name || '-'}</span>
                              </div>
                            </div>
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
                            <div className="flex items-center gap-3">
                              <button 
                                onClick={() => {
                                  setSelectedContact(contact)
                                  setIsEditModalOpen(true)
                                }}
                                className="text-blue-400 hover:text-blue-300 text-sm"
                              >
                                Edit
                              </button>
                              <button 
                                onClick={() => {
                                  setSelectedContact(contact)
                                  setIsDeleteModalOpen(true)
                                }}
                                className="text-red-400 hover:text-red-300 text-sm"
                              >
                                Delete
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
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

          <BulkDeleteModal
            isOpen={isBulkDeleteModalOpen}
            onClose={() => setIsBulkDeleteModalOpen(false)}
            selectedContactIds={selectedContactIds}
            onComplete={fetchContacts}
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

          <TagManagementModal 
            isOpen={isTagManagementModalOpen}
            onClose={() => setIsTagManagementModalOpen(false)}
            onTagsUpdated={() => {
              fetchContacts()
              // Refresh tag filter menu
              if (tagFilterMenuRef.current?.refreshTags) {
                tagFilterMenuRef.current.refreshTags()
              }
            }}
          />

          <IndustryManagementModal
            isOpen={isIndustryManagementModalOpen}
            onClose={() => setIsIndustryManagementModalOpen(false)}
            onIndustriesUpdated={fetchContacts}
          />
        </div>
      </main>
    </div>
  )
}
