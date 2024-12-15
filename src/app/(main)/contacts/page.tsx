"use client"

import { useEffect, useState, useRef, useMemo } from "react"
import { Users, Plus, ChevronUp, ChevronDown, Download, Trash, Tags, BarChart2, Mail, Phone, Calendar, Building2, FolderOpen, FolderClosed, MapPin, ArrowRight, Pencil, Trash2, Search } from "lucide-react"
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
import { ScheduleActivityModal } from "@/components/contacts/schedule-activity-modal"
import { validateContact } from '@/lib/validation'
import { useToast } from '@/components/ui/toast'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from '@/components/ui/dropdown-menu'

interface Contact {
  id: string
  first_name: string
  last_name: string | null
  email: string | null
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
  tags: string[]
  industries: {
    id: string
    name: string
  } | null
  // Virtual field for display
  name?: string
}

interface BulkDeleteModalProps {
  isOpen: boolean
  onClose: () => void
  selectedContactIds: string[]
  onComplete: (retryCount?: number) => Promise<void>
}

type SortField = keyof Contact
type SortDirection = 'asc' | 'desc'

export default function ContactsPage() {
  const [contacts, setContacts] = useState<Contact[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [sortField, setSortField] = useState<SortField>('first_name')
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
  const [isScheduleActivityModalOpen, setIsScheduleActivityModalOpen] = useState(false)
  const [groupBy, setGroupBy] = useState<'none' | 'company'>('none')
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set())
  const tagFilterMenuRef = useRef<any>(null)
  const { toasts, addToast } = useToast()
  const [validationErrors, setValidationErrors] = useState<ValidationError[]>([])
  const [isCreating, setIsCreating] = useState(false)
  const [isExporting, setIsExporting] = useState(false)
  const [allTags, setAllTags] = useState<Array<{ id: string; name: string; color: string; count: number }>>([])
  const [tagDetails, setTagDetails] = useState<{ [key: string]: { name: string; color: string } }>({});

  useEffect(() => {
    console.log('Component mounted')
    fetchContacts()
    fetchTags()
    fetchTagDetails()
  }, [])

  async function fetchContacts(retryCount = 0) {
    console.log('Starting fetchContacts')
    try {
      setLoading(true)
      setError(null)
      
      const { data, error } = await supabase
        .from('contacts')
        .select(`
          *,
          industries (
            id,
            name
          )
        `)
        .order(sortField, { ascending: sortDirection === 'asc' })
      
      if (error) throw error

      if (!data) {
        setContacts([])
        return
      }

      const transformedData = data.map(contact => ({
        ...contact,
        name: `${contact.first_name} ${contact.last_name || ''}`.trim(),
        tags: contact.tags || [],
        industries: contact.industries || null
      }))

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
      const { data: tags, error } = await supabase
        .from('tags')
        .select('id, name, color')
        .order('name')
      
      if (error) throw error
      
      // Get counts for each tag
      const tagsWithCounts = await Promise.all(
        (tags || []).map(async (tag) => {
          const { count, error: countError } = await supabase
            .from('contacts')
            .select('id', { count: 'exact', head: true })
            .contains('tags', [tag.id])

          if (countError) {
            console.error('Error getting count for tag:', tag.name, countError.message)
            return { ...tag, count: 0 }
          }

          return { ...tag, count: count || 0 }
        })
      )
      
      setAllTags(tagsWithCounts)
    } catch (error) {
      console.error('Error fetching tags:', error)
    }
  }

  async function fetchTagDetails() {
    try {
      const { data: tags, error } = await supabase
        .from('tags')
        .select('id, name, color')

      if (error) throw error;

      const tagMap = (tags || []).reduce((acc, tag) => {
        acc[tag.id] = { name: tag.name, color: tag.color };
        return acc;
      }, {} as { [key: string]: { name: string; color: string } });

      setTagDetails(tagMap);
    } catch (error) {
      console.error('Error fetching tag details:', error);
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

      if (aValue === null || aValue === undefined) return sortDirection === 'asc' ? 1 : -1
      if (bValue === null || bValue === undefined) return sortDirection === 'asc' ? -1 : 1

      if (String(aValue) < String(bValue)) return sortDirection === 'asc' ? -1 : 1
      if (String(aValue) > String(bValue)) return sortDirection === 'asc' ? 1 : -1
      return 0
    })
  }

  const filteredContacts = contacts
    .filter(contact => {
      // Search filter
      const searchLower = searchQuery.toLowerCase()
      const matchesSearch = !searchQuery || 
        contact.name.toLowerCase().includes(searchLower) ||
        contact.email?.toLowerCase().includes(searchLower) ||
        contact.phone?.toLowerCase().includes(searchLower) ||
        contact.company?.toLowerCase().includes(searchLower) ||
        (contact.job_title?.toLowerCase() || '').includes(searchLower)

      // Tag filter
      const matchesTags = selectedTagIds.length === 0 || (
        tagFilterMode === 'AND'
          ? selectedTagIds.every(tagId => 
              contact.tags.includes(tagId)
            )
          : selectedTagIds.some(tagId => 
              contact.tags.includes(tagId)
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

  const handleContactClick = (contact: Contact, event: React.MouseEvent) => {
    // If the click is on or within the checkbox container, don't do anything
    // The checkbox has its own handler
    const target = event.target as HTMLElement;
    if (target.closest('.checkbox-container')) {
      return;
    }
    
    // Otherwise show contact details
    setSelectedContact(contact);
    setIsDetailsModalOpen(true);
  };

  const handleContactSelect = (contactId: string, event: React.MouseEvent) => {
    event.stopPropagation();
    setSelectedContactIds(prev =>
      prev.includes(contactId)
        ? prev.filter(id => id !== contactId)
        : [...prev, contactId]
    );
  };

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

  const exportToCSV = async () => {
    setIsExporting(true)
    try {
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
          'Postcode',
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
          contact.email || '',
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
          contact.tags.join(', '),
          contact.industries?.name || '-'
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

      addToast('Contacts exported successfully', 'success')
    } catch (err: any) {
      console.error('Export error:', err)
      addToast('Failed to export contacts', 'error')
    } finally {
      setIsExporting(false)
    }
  }

  const getAllUniqueTags = () => {
    const tagsMap = new Map()
    contacts.forEach(contact => {
      contact.tags.forEach(tag => {
        tagsMap.set(tag, tag)
      })
    })
    return Array.from(tagsMap.values())
  }

  const handleCreateContact = async (data: ContactValidation) => {
    setIsCreating(true)
    try {
      // Clear previous errors
      setValidationErrors([])
      
      // Validate
      const errors = validateContact(data)
      if (errors.length > 0) {
        setValidationErrors(errors)
        addToast('Please fix the validation errors', 'error')
        return
      }

      const { error } = await supabase
        .from('contacts')
        .insert([data])

      if (error) throw error

      addToast('Contact created successfully', 'success')
      await fetchContacts()
    } catch (err: any) {
      console.error('Error creating contact:', err)
      addToast(err.message, 'error')
    } finally {
      setIsCreating(false)
    }
  }

  const handleBulkTagClick = () => {
    if (selectedContactIds.length === 0) {
      addToast('Please select at least one contact to tag', 'error')
      return
    }
    setIsBulkTagModalOpen(true)
  }

  const handleTagClick = (tagId: string) => {
    setSelectedTagIds(prev => {
      if (prev.includes(tagId)) {
        return prev.filter(id => id !== tagId)
      }
      return [...prev, tagId]
    })
  }

  const handleTagFilterModeToggle = () => {
    setTagFilterMode(prev => prev === 'AND' ? 'OR' : 'AND')
  }

  console.log('Current contacts state:', contacts)

  return (
    <main className="flex-1 overflow-y-auto bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="p-8">
        <PageHeader 
          heading="Contacts"
          description="Manage your contacts and relationships"
          icon={<div className="icon-contacts animate-in fade-in slide-in-from-bottom-3 duration-1000"><Users className="h-6 w-6 text-blue-500" /></div>}
        />
        <div className="flex items-center gap-4 mt-6 animate-in fade-in slide-in-from-bottom-5 duration-1000">
          <div className="flex-1 relative group">
            <input
              type="text"
              placeholder="Search contacts..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-10 px-4 pl-10 rounded-lg bg-background border border-input hover:border-accent focus:border-accent focus:ring-2 focus:ring-accent focus:ring-opacity-50 transition-colors"
            />
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground group-hover:text-accent transition-colors" />
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon" className="h-10 w-10 shrink-0">
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
            onFilterModeChange={handleTagFilterModeToggle}
          />

          <Button 
            onClick={() => setIsCreateModalOpen(true)}
            className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white shadow-lg hover:shadow-xl transition-all duration-200 ease-in-out animate-in fade-in slide-in-from-bottom-5 duration-1000"
          >
            <Plus className="h-4 w-4" />
            Add Contact
          </Button>

          {selectedContactIds.length > 0 && (
            <Button
              onClick={handleBulkTagClick}
              variant="outline"
              className="flex items-center gap-2 animate-in fade-in slide-in-from-bottom-5 duration-1000"
            >
              <Tags className="h-4 w-4" />
              Add Tags ({selectedContactIds.length})
            </Button>
          )}
        </div>

        {selectedContactIds.length > 0 && (
          <div className="flex gap-2 mt-4 animate-in fade-in slide-in-from-bottom-7 duration-1000">
            <Button
              onClick={async () => {
                const selectedContacts = filteredContacts.filter(c => 
                  selectedContactIds.includes(c.id)
                );
                const csv = selectedContacts.map(contact => ({
                  Name: `${contact.first_name} ${contact.last_name || ''}`.trim(),
                  Email: contact.email || '',
                  Phone: contact.phone || '',
                  Company: contact.company || '',
                  'Job Title': contact.job_title || '',
                  Address: [
                    contact.address_line1,
                    contact.address_line2,
                    contact.city,
                    contact.region,
                    contact.postcode,
                    contact.country
                  ].filter(Boolean).join(', '),
                  Website: contact.website || '',
                  LinkedIn: contact.linkedin || '',
                  Twitter: contact.twitter || '',
                  Tags: contact.tags?.join(', ') || ''
                }));
                
                const csvContent = [
                  Object.keys(csv[0]).join(','),
                  ...csv.map(row => 
                    Object.values(row)
                      .map(val => `"${String(val).replace(/"/g, '""')}"`)
                      .join(',')
                  )
                ].join('\n');

                const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
                const link = document.createElement('a');
                link.href = URL.createObjectURL(blob);
                link.download = 'contacts.csv';
                link.click();
              }}
              variant="outline"
              size="sm"
              className="flex items-center gap-2"
            >
              <Download className="h-4 w-4" />
              Export ({selectedContactIds.length})
            </Button>
            <Button
              onClick={() => setIsBulkDeleteModalOpen(true)}
              variant="destructive"
              size="sm"
              className="flex items-center gap-2"
            >
              <Trash className="h-4 w-4" />
              Delete ({selectedContactIds.length})
            </Button>
          </div>
        )}

        <div className="mt-6">
          {/* Contact Cards View */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
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
                {(groupBy === 'none' || expandedGroups.has(groupName)) &&
                  groupContacts.map((contact) => (
                    <div
                      key={contact.id}
                      className="group relative bg-gradient-to-br from-gray-800/50 via-gray-800/30 to-gray-800/50 hover:from-gray-700/50 hover:via-gray-700/30 hover:to-gray-700/50 rounded-lg p-4 transition-all duration-300 cursor-pointer border border-gray-700/50 hover:border-gray-600/50 backdrop-blur-sm shadow-lg hover:shadow-xl"
                      onClick={(e) => handleContactClick(contact, e)}
                    >
                      {/* Gradient Overlay on Hover */}
                      <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-primary/10 to-primary-foreground/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                      {/* Selection Checkbox */}
                      <div className="absolute top-3 right-3 z-10 checkbox-container">
                        <input
                          type="checkbox"
                          checked={selectedContactIds.includes(contact.id)}
                          onChange={(e) => {
                            handleContactSelect(contact.id, e as unknown as React.MouseEvent);
                          }}
                          className="rounded border-gray-600 bg-gray-700/50 focus:ring-primary focus:ring-offset-0 transition-colors"
                        />
                      </div>

                      {/* Contact Info */}
                      <div className="space-y-4 relative z-0">
                        <div className="flex items-center gap-3">
                          <div className="flex-shrink-0 relative">
                            <Avatar contact={contact} size={48} />
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

                        {/* Contact Details */}
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
                        </div>

                        {/* Tags */}
                        {contact.tags && contact.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1.5 pt-2">
                            {contact.tags.map((tagId) => {
                              const tag = tagDetails[tagId];
                              if (!tag) return null;
                              return (
                                <span
                                  key={tagId}
                                  className="px-2 py-0.5 rounded-full text-xs font-medium"
                                  style={{
                                    backgroundColor: tag.color + '20',
                                    color: tag.color
                                  }}
                                >
                                  {tag.name}
                                </span>
                              );
                            })}
                          </div>
                        )}
                      </div>

                      {/* Quick Actions */}
                      <div className="absolute bottom-3 right-3 opacity-0 group-hover:opacity-100 transition-all duration-300 transform group-hover:translate-y-0 translate-y-1 z-10">
                        <div className="flex gap-1.5 p-1 rounded-lg bg-gray-800/90 backdrop-blur-sm border border-gray-700/50">
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              setSelectedContact(contact)
                              setIsEditModalOpen(true)
                            }}
                            className="p-1.5 rounded-md hover:bg-gray-700/50 text-blue-400 hover:text-blue-300 transition-colors"
                          >
                            <Pencil className="w-4 h-4" />
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
                  ))}
              </Fragment>
            ))}
          </div>
        </div>
      </div>

      {/* Modals */}
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

      <ScheduleActivityModal
        contact={selectedContact}
        isOpen={isScheduleActivityModalOpen}
        onClose={() => setIsScheduleActivityModalOpen(false)}
        onActivityScheduled={() => {
          fetchContacts()
        }}
      />

      <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
        {toasts.map(toast => (
          <div
            key={toast.id}
            className={`p-4 rounded-lg shadow-lg animate-in fade-in slide-in-from-right duration-300 ${
              toast.type === 'error' ? 'bg-red-500' :
              toast.type === 'success' ? 'bg-green-500' :
              'bg-blue-500'
            } text-white`}
          >
            {toast.message}
          </div>
        ))}
      </div>
    </main>
  )
}
