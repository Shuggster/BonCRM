"use client"

import { useEffect, useState, useRef } from "react"
import { Users, Plus, ChevronUp, ChevronDown, Download, Trash, Tags, Mail, Phone, Calendar, Building2, FolderOpen, FolderClosed, Search, Pencil, Trash2 } from "lucide-react"
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
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { TagFilterMenu } from "@/components/contacts/tag-filter-menu"
import { Button } from "@/components/ui/button"
import { Fragment } from "react"
import { ScheduleActivityModal } from "@/components/contacts/schedule-activity-modal"
import { validateContact } from '@/lib/validation'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from '@/components/ui/dropdown-menu'
import { toast } from 'sonner'
import { ContactTag } from "@/components/contacts/contact-tag"
import { cn } from "@/lib/utils"
import { UserSession } from "@/types/users"
import type { Contact, LeadStatus } from "@/lib/supabase/services/contacts"
import { Session } from "next-auth"
import { convertNextAuthToUserSession } from "@/lib/session"

interface ContactsClientProps {
  session: Session | null
}

type SortField = keyof Contact
type SortDirection = 'asc' | 'desc'

interface ContactWithName extends Contact {
  name: string
}

function transformContactForSchedule(contact: ContactWithName | null) {
  if (!contact) return null
  const displayName = contact.name || `${contact.first_name} ${contact.last_name || ''}`.trim()
  return {
    id: contact.id,
    name: displayName
  }
}

interface ContactAvatarProps {
  contact: ContactWithName
  size: "sm" | "lg"
}

function ContactAvatar({ contact, size }: ContactAvatarProps) {
  const initials = [contact.first_name, contact.last_name]
    .filter(Boolean)
    .map(name => name?.[0] || '')
    .join('')
    .toUpperCase()

  return (
    <Avatar className={cn(
      "bg-blue-500",
      size === "lg" ? "h-12 w-12 text-lg" : "h-8 w-8 text-sm"
    )}>
      <AvatarFallback>{initials}</AvatarFallback>
    </Avatar>
  )
}

export function ContactsClient({ session }: ContactsClientProps) {
  const userSession = convertNextAuthToUserSession(session)
  const [contacts, setContacts] = useState<ContactWithName[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [sortField, setSortField] = useState<SortField>('first_name')
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc')
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [selectedContact, setSelectedContact] = useState<ContactWithName | null>(null)
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
  const [isScheduleActivityModalOpen, setIsScheduleActivityModalOpen] = useState(false)
  const [groupBy, setGroupBy] = useState<'none' | 'company'>('none')
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set())
  const tagFilterMenuRef = useRef<any>(null)
  const [allTags, setAllTags] = useState<Array<{ id: string; name: string; color: string; count: number }>>([])
  const [tagDetails, setTagDetails] = useState<{ [key: string]: { name: string; color: string } }>({})

  useEffect(() => {
    fetchContacts()
    fetchTags()
    fetchTagDetails()
  }, [])

  async function fetchContacts(retryCount = 0) {
    try {
      setLoading(true)
      setError(null)
      
      const response = await fetch('/api/contacts')
      
      if (!response.ok) {
        throw new Error('Failed to fetch contacts')
      }

      const data = await response.json()
      const transformedData = data.map((contact: any) => ({
        ...contact,
        name: contact.name || `${contact.first_name} ${contact.last_name || ''}`.trim(),
        tags: contact.tags || []
      })) as ContactWithName[]

      setContacts(transformedData)
    } catch (error: any) {
      console.error('Error fetching contacts:', error.message || error)
      setError(error.message || 'Failed to fetch contacts')
      
      if (retryCount < 3) {
        setTimeout(() => fetchContacts(retryCount + 1), 1000 * Math.pow(2, retryCount))
      }
    } finally {
      setLoading(false)
    }
  }

  async function fetchTags() {
    try {
      const response = await fetch('/api/tags')
      
      if (!response.ok) {
        throw new Error('Failed to fetch tags')
      }

      const tags = await response.json()
      const tagsWithCounts = await Promise.all(
        tags.map(async (tag: any) => {
          const countResponse = await fetch(`/api/tags/${tag.id}/count`)
          
          if (!countResponse.ok) {
            console.error('Error getting count for tag:', tag.name)
            return { ...tag, count: 0 }
          }

          const { count } = await countResponse.json()
          return { ...tag, count }
        })
      )
      
      setAllTags(tagsWithCounts)
    } catch (error) {
      console.error('Error fetching tags:', error)
    }
  }

  async function fetchTagDetails() {
    try {
      const response = await fetch('/api/tags')
      
      if (!response.ok) {
        throw new Error('Failed to fetch tag details')
      }

      const tags = await response.json()
      const tagMap = tags.reduce((acc: any, tag: any) => {
        acc[tag.id] = { name: tag.name, color: tag.color }
        return acc
      }, {})

      setTagDetails(tagMap)
    } catch (error) {
      console.error('Error fetching tag details:', error)
    }
  }

  const handleContactClick = (contact: ContactWithName, event: React.MouseEvent) => {
    const target = event.target as HTMLElement
    if (target.closest('.checkbox-container')) {
      return
    }
    
    setSelectedContact(contact)
    setIsDetailsModalOpen(true)
  }

  const handleContactSelect = (contactId: string, event: React.MouseEvent) => {
    event.stopPropagation()
    setSelectedContactIds(prev =>
      prev.includes(contactId)
        ? prev.filter(id => id !== contactId)
        : [...prev, contactId]
    )
  }

  const filteredContacts = contacts.filter(contact => {
    const searchLower = searchQuery.toLowerCase()
    const matchesSearch = !searchQuery || 
      (contact.name || '').toLowerCase().includes(searchLower) ||
      (contact.email?.toLowerCase() || '').includes(searchLower) ||
      (contact.phone?.toLowerCase() || '').includes(searchLower) ||
      (contact.company?.toLowerCase() || '').includes(searchLower) ||
      (contact.job_title?.toLowerCase() || '').includes(searchLower)

    const matchesTags = selectedTagIds.length === 0 || (
      tagFilterMode === 'AND'
        ? selectedTagIds.every(tagId => contact.tags.includes(tagId))
        : selectedTagIds.some(tagId => contact.tags.includes(tagId))
    )

    return matchesSearch && matchesTags
  })

  const groupedContacts = () => {
    if (groupBy === 'none') return { 'All Contacts': filteredContacts }

    const groups: { [key: string]: ContactWithName[] } = {}
    filteredContacts.forEach(contact => {
      const groupName = contact.company || 'No Company'
      if (!groups[groupName]) {
        groups[groupName] = []
      }
      groups[groupName].push(contact)
    })

    return Object.keys(groups)
      .sort()
      .reduce((acc, key) => {
        acc[key] = groups[key]
        return acc
      }, {} as { [key: string]: ContactWithName[] })
  }

  const toggleGroup = (groupName: string) => {
    const newExpandedGroups = new Set(expandedGroups)
    if (newExpandedGroups.has(groupName)) {
      newExpandedGroups.delete(groupName)
    } else {
      newExpandedGroups.add(groupName)
    }
    setExpandedGroups(newExpandedGroups)
  }

  const handleBulkTagClick = () => {
    if (selectedContactIds.length === 0) {
      toast.error('Please select at least one contact to tag')
      return
    }
    setIsBulkTagModalOpen(true)
  }

  return (
    <div className="flex-1 overflow-y-auto bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto max-w-[1600px] p-8">
        <PageHeader 
          heading="Contacts"
          description="Manage your contacts and relationships"
          icon={<div className="icon-contacts"><Users className="h-6 w-6 text-blue-500" /></div>}
        >
          <div className="flex items-center gap-2 max-w-[1600px] w-full justify-end">
            <Button onClick={() => setIsCreateModalOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Contact
            </Button>
          </div>
        </PageHeader>

        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mt-6">
          <div className="flex-1 relative group w-full sm:w-auto">
            <input
              type="text"
              placeholder="Search contacts..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-10 px-4 pl-10 rounded-lg bg-background border border-input"
            />
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon" className="h-10 w-10">
                  <FolderClosed className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setGroupBy('none')}>
                  <FolderClosed className="mr-2 h-4 w-4" /> No Grouping
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setGroupBy('company')}>
                  <Building2 className="mr-2 h-4 w-4" /> Group by Company
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <TagFilterMenu
              onTagSelect={setSelectedTagIds}
              onOpenTagStats={() => setIsTagStatsModalOpen(true)}
              onManageTags={() => setIsTagManagementModalOpen(true)}
              ref={tagFilterMenuRef}
              selectedTags={selectedTagIds}
              filterMode={tagFilterMode}
              onFilterModeChange={() => setTagFilterMode(prev => prev === 'AND' ? 'OR' : 'AND')}
            />
          </div>
        </div>

        {selectedContactIds.length > 0 && (
          <div className="flex gap-2 mt-4">
            <Button
              onClick={handleBulkTagClick}
              variant="outline"
              className="flex items-center gap-2"
            >
              <Tags className="h-4 w-4" />
              Add Tags ({selectedContactIds.length})
            </Button>
            <Button
              onClick={() => setIsBulkDeleteModalOpen(true)}
              variant="destructive"
              className="flex items-center gap-2"
            >
              <Trash className="h-4 w-4" />
              Delete ({selectedContactIds.length})
            </Button>
          </div>
        )}

        <div className="mt-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-4">
            {Object.entries(groupedContacts()).map(([groupName, groupContacts]) => (
              <Fragment key={`group-${groupName}`}>
                {groupBy === 'company' && (
                  <div className="col-span-full bg-gray-800/20 p-3 rounded-lg flex items-center gap-2">
                    <button
                      onClick={() => toggleGroup(groupName)}
                      className="p-1 hover:bg-gray-700/30 rounded transition-colors"
                    >
                      {expandedGroups.has(groupName) ? (
                        <FolderOpen className="h-4 w-4" />
                      ) : (
                        <FolderClosed className="h-4 w-4" />
                      )}
                    </button>
                    <div className="flex items-center gap-2 font-medium">
                      <Building2 className="h-4 w-4 text-gray-400" />
                      {groupName} ({groupContacts.length})
                    </div>
                  </div>
                )}

                {(groupBy === 'none' || expandedGroups.has(groupName)) && groupContacts.map((contact) => (
                  <div
                    key={contact.id}
                    className="group relative bg-gradient-to-br from-gray-800/50 via-gray-800/30 to-gray-800/50 hover:from-gray-700/50 hover:via-gray-700/30 hover:to-gray-700/50 rounded-lg p-4 cursor-pointer transition-all duration-300 border border-gray-700/50 hover:border-gray-600/50 backdrop-blur-sm shadow-lg hover:shadow-xl"
                    onClick={(e) => handleContactClick(contact, e)}
                  >
                    {/* Gradient Overlay on Hover */}
                    <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-primary/10 to-primary-foreground/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                    {/* Selection Checkbox */}
                    <div className="absolute top-3 right-3 z-10 checkbox-container">
                      <input
                        type="checkbox"
                        checked={selectedContactIds.includes(contact.id)}
                        onChange={(e) => handleContactSelect(contact.id, e as unknown as React.MouseEvent)}
                        className="rounded border-gray-600 bg-gray-700/50 focus:ring-primary focus:ring-offset-0 transition-colors"
                      />
                    </div>

                    <div className="space-y-4 relative z-0">
                      <div className="flex items-center gap-3">
                        <div className="flex-shrink-0 relative">
                          <ContactAvatar 
                            contact={contact} 
                            size="lg"
                          />
                          <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-gray-800" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-100 group-hover:text-primary transition-colors">
                            {contact.name}
                          </h3>
                          {contact.job_title && (
                            <p className="text-sm text-gray-400 group-hover:text-gray-300 transition-colors">
                              {contact.job_title}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="space-y-2 text-sm">
                        {contact.company && (
                          <div className="flex items-center gap-2 text-gray-300 group-hover:text-gray-200 transition-colors">
                            <Building2 className="w-4 h-4 text-purple-400" />
                            {contact.company}
                          </div>
                        )}
                        {contact.email && (
                          <div className="flex items-center gap-2 text-gray-300 group-hover:text-gray-200 transition-colors">
                            <Mail className="w-4 h-4 text-blue-400" />
                            {contact.email}
                          </div>
                        )}
                        {contact.phone && (
                          <div className="flex items-center gap-2 text-gray-300 group-hover:text-gray-200 transition-colors">
                            <Phone className="w-4 h-4 text-green-400" />
                            {contact.phone}
                          </div>
                        )}
                        {contact.assigned_to && (
                          <div className="flex items-center gap-2 text-gray-300 group-hover:text-gray-200 transition-colors">
                            <Users className="w-4 h-4 text-purple-400" />
                            {contact.assigned_to_type === 'user' && contact.assigned_user
                              ? contact.assigned_user.name
                              : contact.assigned_to_type === 'team' && contact.assigned_team
                              ? contact.assigned_team.name
                              : 'Unassigned'}
                          </div>
                        )}
                      </div>

                      {/* Lead Management Section */}
                      <div className="pt-2 border-t border-gray-700/50">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className={cn(
                              "px-2 py-1 rounded text-xs font-medium",
                              contact.lead_status === 'new' && "bg-blue-500/20 text-blue-400",
                              contact.lead_status === 'contacted' && "bg-yellow-500/20 text-yellow-400",
                              contact.lead_status === 'qualified' && "bg-green-500/20 text-green-400",
                              contact.lead_status === 'proposal' && "bg-purple-500/20 text-purple-400",
                              contact.lead_status === 'negotiation' && "bg-orange-500/20 text-orange-400",
                              contact.lead_status === 'won' && "bg-emerald-500/20 text-emerald-400",
                              contact.lead_status === 'lost' && "bg-red-500/20 text-red-400"
                            )}>
                              {contact.lead_status.charAt(0).toUpperCase() + contact.lead_status.slice(1)}
                            </div>
                            {contact.lead_source && (
                              <div className="text-xs text-gray-400">
                                via {contact.lead_source.replace('_', ' ')}
                              </div>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="text-xs text-gray-400">Score</div>
                            <div className={cn(
                              "px-2 py-1 rounded text-xs font-medium",
                              contact.lead_score >= 80 && "bg-green-500/20 text-green-400",
                              contact.lead_score >= 50 && contact.lead_score < 80 && "bg-yellow-500/20 text-yellow-400",
                              contact.lead_score < 50 && "bg-red-500/20 text-red-400"
                            )}>
                              {contact.lead_score}
                            </div>
                          </div>
                        </div>
                        {contact.expected_value && (
                          <div className="mt-2 text-xs text-gray-400 flex items-center justify-between">
                            <span>Expected Value</span>
                            <span className="text-green-400">${contact.expected_value.toLocaleString()}</span>
                          </div>
                        )}
                      </div>

                      {contact.tags && contact.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 pt-2">
                          {contact.tags.map((tagId: string) => (
                            <ContactTag key={tagId} tagId={tagId} />
                          ))}
                        </div>
                      )}

                      {/* Quick Actions */}
                      <div className="absolute bottom-3 right-3 opacity-0 group-hover:opacity-100 transition-all duration-300 transform group-hover:translate-y-0 translate-y-1 z-10">
                        <div className="flex gap-1.5 p-1 rounded-lg bg-gray-800/90 backdrop-blur-sm border border-gray-700/50">
                          <div className="flex items-center gap-1">
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                setSelectedContact(contact)
                                setIsDetailsModalOpen(true)
                              }}
                              className="p-1.5 rounded-md hover:bg-gray-700/50 text-gray-400 hover:text-gray-300 transition-colors"
                            >
                              <FolderOpen className="w-4 h-4" />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                setSelectedContact(contact)
                                setIsEditModalOpen(true)
                              }}
                              className="p-1.5 rounded-md hover:bg-gray-700/50 text-gray-400 hover:text-gray-300 transition-colors"
                            >
                              <Pencil className="w-4 h-4" />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                setSelectedContact(contact)
                                setIsScheduleActivityModalOpen(true)
                              }}
                              className="p-1.5 rounded-md hover:bg-gray-700/50 text-blue-400 hover:text-blue-300 transition-colors"
                              title="Schedule Activity"
                            >
                              <Calendar className="w-4 h-4" />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                setSelectedContact(contact)
                                setIsDeleteModalOpen(true)
                              }}
                              className="p-1.5 rounded-md hover:bg-gray-700/50 text-red-400 hover:text-red-300 transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </Fragment>
            ))}
          </div>
        </div>
      </div>

      <CreateContactModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onContactCreated={fetchContacts}
      />

      {selectedContact && (
        <EditContactModal
          contact={selectedContact}
          isOpen={isEditModalOpen}
          onClose={() => {
            setIsEditModalOpen(false)
            setSelectedContact(null)
          }}
          onContactUpdated={fetchContacts}
          session={userSession}
        />
      )}

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
        existingTags={allTags}
        onComplete={() => {
          fetchContacts()
          setIsBulkTagModalOpen(false)
        }}
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

      <ScheduleActivityModal
        contact={transformContactForSchedule(selectedContact)}
        isOpen={isScheduleActivityModalOpen}
        onClose={() => setIsScheduleActivityModalOpen(false)}
      />
    </div>
  )
} 