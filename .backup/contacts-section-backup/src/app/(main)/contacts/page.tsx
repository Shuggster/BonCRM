"use client"

import { useState, useEffect, useCallback, useContext, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Users, Plus, Search, Mail, Phone, Building2, X, MoreHorizontal } from 'lucide-react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useSplitViewStore } from '@/components/layouts/SplitViewContainer'
import PageTransition from '@/components/animations/PageTransition'
import { Button } from '@/components/ui/button'
import { PageHeader } from '@/components/ui/page-header'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { Contact, ContactTag, ContactTagRelation, LeadStatus, LeadSource } from '@/types'
import { TagFilterMenu } from '@/components/contacts/tag-filter-menu'
import { ContactTag as ContactTagComponent } from '@/components/contacts/contact-tag'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { cn } from '@/lib/utils'
import { seedTestContacts } from '@/lib/supabase/services/contacts'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import { TagManagementModal } from '@/components/contacts/tag-management-modal'
import { TagStatisticsModal } from '@/components/contacts/tag-statistics-modal'
import { QuickAddContact } from '@/components/contacts/QuickAddContact'
import { SplitView } from '@/components/layouts/SplitView'
import { ViewContact } from '@/components/contacts/ViewContact'
import { EditContact } from '@/components/contacts/EditContact'
import { EditContactSplitView } from '@/components/contacts/EditContactSplitView'
import { LeadStatusFilter } from "@/components/contacts/lead-status-filter"
import { LeadSourceFilter } from "@/components/contacts/lead-source-filter"
import { IndustryFilter } from "@/components/contacts/industry-filter"
import { ConversionStatusFilter } from "@/components/contacts/conversion-status-filter"
import { SortMenu } from "@/components/contacts/sort-menu"
import { FilterMenu } from "@/components/contacts/filter-menu"
import { LeadFilter } from "@/components/contacts/lead-filter"
import { CompanyFilter } from "@/components/contacts/company-filter"

interface ContactAvatarProps {
  contact: Contact
  size?: 'sm' | 'lg'
}

function ContactAvatar({ contact, size }: ContactAvatarProps) {
  const initials = [contact.first_name, contact.last_name]
    .filter(Boolean)
    .map(name => name?.[0] || '')
    .join('')
    .toUpperCase()

  // Generate a consistent color based on the contact's name
  const colorIndex = (contact.first_name?.charCodeAt(0) || 0) % 6
  const gradients = [
    'from-pink-500 to-rose-500',
    'from-blue-500 to-indigo-500',
    'from-green-500 to-emerald-500',
    'from-purple-500 to-violet-500',
    'from-orange-500 to-amber-500',
    'from-cyan-500 to-sky-500'
  ]

  return (
    <Avatar className={cn(
      "relative bg-gradient-to-br border border-white/10",
      gradients[colorIndex],
      size === "lg" ? "h-12 w-12 text-lg" : "h-8 w-8 text-sm",
    )}>
      <AvatarFallback className="font-medium bg-transparent">
        {initials}
      </AvatarFallback>
    </Avatar>
  )
}

function groupContactsByFirstLetter(contacts: Contact[], sortDirection: 'asc' | 'desc') {
  const groups: { [key: string]: Contact[] } = {}
  const pinnedContacts: Contact[] = []

  // Sort contacts before grouping
  const sortedContacts = [...contacts].sort((a, b) => {
    const nameA = `${a.first_name} ${a.last_name || ''}`.trim().toLowerCase()
    const nameB = `${b.first_name} ${b.last_name || ''}`.trim().toLowerCase()
    return sortDirection === 'asc' 
      ? nameA.localeCompare(nameB)
      : nameB.localeCompare(nameA)
  })

  sortedContacts.forEach(contact => {
    if (contact.pinned) {
      pinnedContacts.push(contact)
      return
    }

    const firstLetter = contact.first_name?.[0]?.toUpperCase() || '#'
    if (!groups[firstLetter]) {
      groups[firstLetter] = []
    }
    groups[firstLetter].push(contact)
  })

  return {
    pinned: pinnedContacts,
    groups: Object.entries(groups).sort(([a], [b]) => 
      sortDirection === 'asc' ? a.localeCompare(b) : b.localeCompare(a)
    )
  }
}

interface ContactWithTags extends Contact {}

export default function ContactsPage() {
  const [contacts, setContacts] = useState<Contact[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null)
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>([])
  const [tagFilterMode, setTagFilterMode] = useState<'AND' | 'OR'>('OR')
  const { setContent, show, hide } = useSplitViewStore()
  const supabase = createClientComponentClient()
  const [isMounted, setIsMounted] = useState(false)
  const [showTagStats, setShowTagStats] = useState(false)
  const [showTagManagement, setShowTagManagement] = useState(false)
  const tagFilterRef = useRef<{ refreshTags: () => void }>(null)
  const [selectedLeadStatus, setSelectedLeadStatus] = useState<LeadStatus | null>(null)
  const [selectedLeadSource, setSelectedLeadSource] = useState<LeadSource | null>(null)
  const [selectedIndustry, setSelectedIndustry] = useState<string | null>(null)
  const [industries, setIndustries] = useState<Array<{ id: string; name: string }>>([])
  const [selectedConversionStatus, setSelectedConversionStatus] = useState<'lead' | 'opportunity' | 'customer' | null>(null)
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc')
  const [selectedDepartment, setSelectedDepartment] = useState<string | null>(null)
  const [selectedLocation, setSelectedLocation] = useState<string | null>(null)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  useEffect(() => {
    fetchContacts()
    fetchIndustries()
  }, [])

  async function fetchContacts() {
    try {
      setLoading(true)
      setError(null)
      
      console.log('Fetching contacts...')
      
      // First fetch contacts
      const query = supabase
        .from('contacts')
        .select(`
          *,
          industries!industry_id (
            id,
            name
          ),
          contact_tag_relations!contact_id (
            tag_id,
            contact_tags!tag_id (
              id,
              name,
              color
            )
          )
        `)
        .order('first_name', { ascending: sortDirection === 'asc' })
      
      const { data: contactsData, error: contactsError } = await query
      
      if (contactsError) {
        console.error('Contacts fetch error details:', {
          message: contactsError.message,
          details: contactsError.details,
          hint: contactsError.hint
        })
        throw contactsError
      }

      console.log('Raw contacts data:', JSON.stringify(contactsData, null, 2))
      console.log('Number of contacts:', contactsData?.length)
      console.log('First contact:', {
        id: contactsData?.[0]?.id,
        name: `${contactsData?.[0]?.first_name} ${contactsData?.[0]?.last_name}`,
        industries: contactsData?.[0]?.industries,
        industry_id: contactsData?.[0]?.industry_id
      })

      // Add some test data for social media and address
      const contacts = (contactsData as ContactWithTags[])?.map(contact => ({
        ...contact,
        tags: contact.contact_tag_relations?.map((rel: ContactTagRelation) => rel.tag_id) || [],
        // Test data for development
        website: contact.website || 'https://example.com',
        linkedin: contact.linkedin || 'https://linkedin.com/in/example',
        twitter: contact.twitter || 'example',
        facebook: contact.facebook || 'https://facebook.com/example',
        whatsapp: contact.whatsapp || '1234567890',
        address_line1: contact.address_line1 || '123 Main Street',
        address_line2: contact.address_line2 || 'Suite 456',
        city: contact.city || 'San Francisco',
        region: contact.region || 'CA',
        postcode: contact.postcode || '94105',
        country: contact.country || 'United States'
      })) || []
      
      console.log('Processed contacts:', contacts.length)
      setContacts(contacts)
    } catch (error: any) {
      console.error('Error fetching contacts:', {
        error,
        message: error.message,
        details: error.details,
        stack: error.stack
      })
      setError(error.message || 'Failed to fetch contacts')
    } finally {
      setLoading(false)
    }
  }

  async function fetchIndustries() {
    try {
      const { data, error } = await supabase
        .from('industries')
        .select('id, name')
        .order('name')

      if (error) throw error
      setIndustries(data || [])
    } catch (error) {
      console.error('Error fetching industries:', error)
    }
  }

  const handleEditClick = useCallback((contact: Contact) => {
    hide();
    setSelectedContact(contact);
    
    setTimeout(() => {
      const content = (
        <EditContactSplitView
          contact={contact}
          onSave={async (data) => {
            try {
              const { error } = await supabase
                .from('contacts')
                .update(data)
                .eq('id', contact.id)

              if (error) throw error
              
              await fetchContacts()
              handleContactClick(contact)
            } catch (error) {
              console.error('Error updating contact:', error)
            }
          }}
          onCancel={() => handleContactClick(contact)}
        />
      );

      setContent(content, null, contact.id);
      show();
    }, 100);
  }, [setContent, show, hide]);

  const handleContactClick = useCallback((contact: Contact) => {
    hide();
    setSelectedContact(contact);
    
    setTimeout(() => {
      const topContent = (
        <motion.div
          key={contact.id}
          className="h-full"
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
          <ViewContact 
            contact={contact}
            section="upper"
            onEdit={() => handleEditClick(contact)}
            onRefresh={() => fetchContacts()}
          />
        </motion.div>
      );

      const bottomContent = (
        <motion.div
          key={`${contact.id}-bottom`}
          className="h-full"
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
          <ViewContact 
            contact={contact}
            section="lower"
            onEdit={() => handleEditClick(contact)}
            onRefresh={() => fetchContacts()}
          />
        </motion.div>
      );

      setContent(topContent, bottomContent, contact.id);
      show();
    }, 100);
  }, [setContent, show, hide, handleEditClick]);

  // Add handleSubmit function before the effects
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const form = e.target as HTMLFormElement
    const formData = new FormData(form)
    
    try {
      const { data, error } = await supabase
        .from('contacts')
        .insert([{
          first_name: formData.get('first_name'),
          last_name: formData.get('last_name'),
          email: formData.get('email'),
          phone: formData.get('phone'),
          company: formData.get('company'),
          job_title: formData.get('job_title'),
          industry_id: 'ec3ef12c-04ac-48ff-9d86-2678618e8872', // Technology industry
          tags: [],
          lead_status: 'new',
          lead_source: 'website',
          conversion_status: 'lead'
        }])
        .select()
        .single()

      if (error) throw error

      fetchContacts()
    } catch (error) {
      console.error('Error creating contact:', error)
    }
  }

  // Add this effect for initial setup
  useEffect(() => {
    if (!isMounted) return

    const setupInitialContent = () => {
      const topContent = (
        <motion.div
          key="add-contact"
          className="h-full"
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
          <QuickAddContact 
            onSuccess={handleCreateContact}
            onCancel={hide}
            section="upper"
          />
        </motion.div>
      )

      const bottomContent = (
        <motion.div
          key="add-contact-bottom"
          className="h-full"
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
          <QuickAddContact 
            onSuccess={handleCreateContact}
            onCancel={hide}
            section="lower"
          />
        </motion.div>
      )

      setContent(topContent, bottomContent, 'add-contact')
      show()
    }

    const persistedState = localStorage.getItem('splitViewState')
    if (!persistedState) {
      setupInitialContent()
    }
  }, [setContent, show, isMounted])

  // Modify the restore effect to only run when mounted
  useEffect(() => {
    if (!isMounted) return

    const persistedState = localStorage.getItem('splitViewState')
    if (persistedState) {
      const { selectedId, isVisible } = JSON.parse(persistedState)
      if (selectedId && contacts.length > 0) {
        const contact = contacts.find(c => c.id === selectedId)
        if (contact) {
          handleContactClick(contact)
        }
      }
    }
  }, [contacts, handleContactClick, isMounted]);

  const filteredContacts = contacts.filter(contact => {
    const searchLower = searchQuery.toLowerCase()
    const matchesSearch = !searchQuery || 
      `${contact.first_name} ${contact.last_name}`.toLowerCase().includes(searchLower) ||
      (contact.email?.toLowerCase() || '').includes(searchLower) ||
      (contact.phone?.toLowerCase() || '').includes(searchLower) ||
      (contact.company?.toLowerCase() || '').includes(searchLower)

    const matchesTags = selectedTagIds.length === 0 || (
      tagFilterMode === 'OR'
        ? selectedTagIds.some(tagId => contact.tags?.includes(tagId))
        : selectedTagIds.every(tagId => contact.tags?.includes(tagId))
    )

    const matchesLeadStatus = !selectedLeadStatus || contact.lead_status === selectedLeadStatus
    const matchesLeadSource = !selectedLeadSource || contact.lead_source === selectedLeadSource
    const matchesIndustry = !selectedIndustry || contact.industry_id === selectedIndustry
    const matchesConversionStatus = !selectedConversionStatus || contact.conversion_status === selectedConversionStatus
    const matchesDepartment = !selectedDepartment || contact.department === selectedDepartment
    const matchesLocation = !selectedLocation || contact.city === selectedLocation || contact.region === selectedLocation || contact.country === selectedLocation

    return matchesSearch && matchesTags && matchesLeadStatus && matchesLeadSource && 
           matchesIndustry && matchesConversionStatus && matchesDepartment && matchesLocation
  })

  const { pinned, groups } = groupContactsByFirstLetter(filteredContacts, sortDirection)

  const handleCreateContact = async (data: any) => {
    try {
      // Get default organization
      const { data: org, error: orgError } = await supabase
        .from('organizations')
        .select('id')
        .limit(1)
        .single()

      if (orgError) {
        console.error('Organization fetch error:', orgError)
        throw new Error('Failed to fetch organization')
      }

      if (!org) {
        console.error('No organization found')
        throw new Error('No organization found')
      }

      // Format data for submission
      const contactData = {
        first_name: data.first_name.trim(),
        last_name: data.last_name?.trim() || undefined,
        email: data.email?.trim() || undefined,
        phone: data.phone?.trim() || undefined,
        company: data.company?.trim() || undefined,
        job_title: data.job_title?.trim() || undefined,
        department: data.department?.trim() || undefined,
        industry_id: data.industry_id || undefined,
        website: data.website?.trim() || undefined,
        linkedin: data.linkedin?.trim() || undefined,
        twitter: data.twitter?.trim() || undefined,
        facebook: data.facebook?.trim() || undefined,
        whatsapp: data.whatsapp?.trim() || undefined,
        address_line1: data.address_line1?.trim() || undefined,
        address_line2: data.address_line2?.trim() || undefined,
        city: data.city?.trim() || undefined,
        region: data.region?.trim() || undefined,
        postcode: data.postcode?.trim() || undefined,
        country: data.country?.trim() || undefined,
        lead_status: data.lead_status || undefined,
        lead_source: data.lead_source || undefined,
        lead_score: data.lead_score || undefined,
        expected_value: data.expected_value || undefined,
        conversion_status: 'lead',
        organization_id: org.id
      }

      console.log('Inserting contact:', contactData)
      const { data: contact, error } = await supabase
        .from('contacts')
        .insert([contactData])
        .select()
        .single()

      if (error) throw error

      // Create tag relations if there are any tags
      if (data.tags && data.tags.length > 0) {
        const tagRelations = data.tags.map((tagId: string) => ({
          contact_id: contact.id,
          tag_id: tagId,
          created_at: new Date().toISOString()
        }))

        console.log('Creating tag relations:', tagRelations)
        const { error: tagError } = await supabase
          .from('contact_tag_relations')
          .insert(tagRelations)

        if (tagError) {
          console.error('Error creating tag relations:', tagError)
          throw tagError
        }
      }

      await fetchContacts()
      hide()
    } catch (error) {
      console.error('Error creating contact:', error)
      throw error // Re-throw to let QuickAddContact handle the error display
    }
  }

  // Add effect to refetch when sort direction changes
  useEffect(() => {
    fetchContacts()
  }, [sortDirection])

  return (
    <PageTransition>
      <div className="flex h-full">
        <motion.div 
          className="flex-1 flex flex-col min-w-0 bg-black"
          initial={{ opacity: 0, x: "100%" }}
          animate={!loading ? { opacity: 1, x: 0 } : { opacity: 0, x: "100%" }}
          transition={{
            duration: 1.2,
            ease: [0.32, 0.72, 0, 1]
          }}
        >
          <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.08]">
            <div className="flex items-center gap-3">
              <h1 className="text-xl font-semibold">Contacts</h1>
              <div className="flex items-center gap-2 text-sm text-zinc-400">
                <Users className="w-4 h-4" />
                {contacts.length.toLocaleString()}
              </div>
            </div>
            
            <div className="flex items-center gap-6 ml-16">
              <div className="relative w-[280px]">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                <input
                  type="text"
                  placeholder="Search contacts..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-zinc-900/50 text-white placeholder:text-zinc-500 border border-white/[0.08] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500/40"
                />
              </div>
              <SortMenu
                sortDirection={sortDirection}
                onSortChange={setSortDirection}
              />
              <Button 
                onClick={() => {
                  hide();
                  
                  setTimeout(() => {
                    const topContent = (
                      <motion.div
                        key="add-contact"
                        className="h-full"
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
                        <QuickAddContact 
                          onSuccess={handleCreateContact}
                          onCancel={hide}
                          section="upper"
                        />
                      </motion.div>
                    );

                    const bottomContent = (
                      <motion.div
                        key="add-contact-bottom"
                        className="h-full"
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
                        <QuickAddContact 
                          onSuccess={handleCreateContact}
                          onCancel={hide}
                          section="lower"
                        />
                      </motion.div>
                    );

                    setContent(topContent, bottomContent, 'add-contact');
                    show();
                  }, 100);
                }}
                className="bg-[#111111] hover:bg-[#1a1a1a] text-white px-4 h-10 rounded-lg font-medium transition-colors border border-white/[0.08] flex items-center gap-2"
              >
                Create Contact
                <Plus className="w-4 h-4" />
              </Button>
            </div>
          </div>

          <div className="px-6 py-4 flex items-center gap-4">
            <TagFilterMenu
              selectedTags={selectedTagIds}
              onTagSelect={setSelectedTagIds}
              filterMode={tagFilterMode}
              onFilterModeChange={() => setTagFilterMode(prev => prev === 'AND' ? 'OR' : 'AND')}
              onOpenTagStats={() => setShowTagStats(true)}
              onManageTags={() => setShowTagManagement(true)}
              ref={tagFilterRef}
            />
            <LeadFilter
              selectedLeadStatus={selectedLeadStatus}
              onLeadStatusChange={setSelectedLeadStatus}
              selectedLeadSource={selectedLeadSource}
              onLeadSourceChange={setSelectedLeadSource}
            />
            <ConversionStatusFilter
              selectedStatus={selectedConversionStatus}
              onStatusChange={setSelectedConversionStatus}
            />
            <CompanyFilter
              selectedIndustry={selectedIndustry}
              onIndustryChange={setSelectedIndustry}
              industries={industries}
              selectedLocation={selectedLocation}
              onLocationChange={setSelectedLocation}
              selectedDepartment={selectedDepartment}
              onDepartmentChange={setSelectedDepartment}
            />
          </div>

          <div className="flex-1 overflow-auto">
            {loading ? (
              <LoadingSpinner />
            ) : error ? (
              <div className="flex flex-col items-center justify-center h-full">
                <p className="text-red-500 mb-4">{error}</p>
                <Button onClick={() => fetchContacts()}>Retry</Button>
              </div>
            ) : contacts.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full">
                <Users className="w-12 h-12 text-text-muted mb-4" />
                <h3 className="text-lg font-medium mb-2">No contacts yet</h3>
                <p className="text-text-secondary mb-4">Get started by adding your first contact</p>
                <Button className="bg-blue-500 hover:bg-blue-600">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Contact
                </Button>
              </div>
            ) : (
              <AnimatePresence mode="wait">
                <motion.div
                  key={`contact-list-${selectedLeadStatus}-${selectedLeadSource}-${selectedIndustry}-${selectedConversionStatus}-${selectedDepartment}-${selectedLocation}-${selectedTagIds.join('-')}-${searchQuery}-${sortDirection}`}
                  className="divide-y divide-white/[0.08]"
                  initial="hidden"
                  animate="visible"
                  exit="hidden"
                  variants={{
                    hidden: { opacity: 0, x: "100%" },
                    visible: {
                      opacity: 1,
                      x: 0,
                      transition: {
                        duration: 0.3,
                        ease: [0.32, 0.72, 0, 1],
                        staggerChildren: 0.02
                      }
                    }
                  }}
                >
                  {pinned.length > 0 && (
                    <motion.div
                      variants={{
                        hidden: { opacity: 0, x: "100%" },
                        visible: { opacity: 1, x: 0 }
                      }}
                    >
                      <div className="px-6 py-2 text-xs font-medium text-text-secondary bg-card-background">
                        PINNED
                      </div>
                      {pinned.map((contact) => (
                        <ContactListItem 
                          key={`pinned-${contact.id}`}
                          contact={contact} 
                          onContactClick={handleContactClick}
                          onEditClick={handleEditClick}
                        />
                      ))}
                    </motion.div>
                  )}

                  {groups.map(([letter, contacts]) => (
                    <motion.div 
                      key={`group-${letter}`}
                      variants={{
                        hidden: { opacity: 0, x: "100%" },
                        visible: { opacity: 1, x: 0 }
                      }}
                    >
                      <div className="px-6 py-2 text-xs font-medium text-text-secondary bg-card-background">
                        {letter}
                      </div>
                      {contacts.map((contact) => (
                        <ContactListItem 
                          key={`${letter}-${contact.id}`}
                          contact={contact} 
                          onContactClick={handleContactClick}
                          onEditClick={handleEditClick}
                        />
                      ))}
                    </motion.div>
                  ))}
                </motion.div>
              </AnimatePresence>
            )}
          </div>
        </motion.div>
      </div>

      <TagStatisticsModal 
        isOpen={showTagStats} 
        onClose={() => setShowTagStats(false)} 
      />

      <TagManagementModal 
        isOpen={showTagManagement} 
        onClose={() => setShowTagManagement(false)}
        onTagsUpdated={() => tagFilterRef.current?.refreshTags()}
      />
    </PageTransition>
  )
}

function ContactListItem({ 
  contact, 
  onContactClick,
  onEditClick 
}: { 
  contact: Contact; 
  onContactClick: (contact: Contact) => void;
  onEditClick: (contact: Contact) => void;
}) {
  const supabase = createClientComponentClient()
  
  const handleDeleteContact = async (e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (!confirm('Are you sure you want to delete this contact?')) {
      return;
    }

    try {
      // First delete tag relations
      const { error: tagError } = await supabase
        .from('contact_tag_relations')
        .delete()
        .eq('contact_id', contact.id)

      if (tagError) throw tagError

      // Then delete the contact
      const { error } = await supabase
        .from('contacts')
        .delete()
        .eq('id', contact.id)

      if (error) throw error

      // Refresh the contacts list
      window.location.reload()
    } catch (error) {
      console.error('Error deleting contact:', error)
      alert('Failed to delete contact')
    }
  }

  const handleViewDetails = (e: React.MouseEvent) => {
    e.stopPropagation();
    onContactClick(contact);
  }

  const handleEditContact = (e: React.MouseEvent) => {
    e.stopPropagation();
    onEditClick(contact);
  }

  type TagRelation = {
    tag_id: string;
    contact_tags: {
      id: string;
      name: string;
      color: string;
    };
  };

  const handleEmailClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.stopPropagation(); // Prevent triggering the parent onClick
  };

  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, x: "100%" },
        visible: { opacity: 1, x: 0 }
      }}
      transition={{
        duration: 1.2,
        ease: [0.32, 0.72, 0, 1]
      }}
      onClick={() => onContactClick(contact)}
      className="group flex items-center gap-4 px-6 py-3 hover:bg-white/[0.02] cursor-pointer border-b border-white/[0.03] relative"
    >
      <ContactAvatar contact={contact} size="sm" />
      
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="font-medium text-white/90">
            {contact.first_name} {contact.last_name}
          </span>
          {(contact as any).contact_tag_relations?.map((rel: TagRelation) => (
            <span
              key={rel.contact_tags.id}
              className="px-2 py-0.5 rounded-full text-xs"
              style={{ 
                backgroundColor: `${rel.contact_tags.color}15`,
                color: rel.contact_tags.color 
              }}
            >
              {rel.contact_tags.name}
            </span>
          ))}
        </div>
        {(contact.company || contact.job_title) && (
          <div className="flex items-center gap-1.5 text-sm text-white/50 mt-0.5">
            <Building2 className="w-3.5 h-3.5 text-blue-500/90" />
            <span className="truncate">
              {contact.job_title && `${contact.job_title}${contact.company ? ' at ' : ''}`}
              {contact.company}
            </span>
          </div>
        )}
        <div className="flex items-center gap-4 mt-0.5">
          {contact.phone && (
            <div className="flex items-center gap-1.5 text-sm text-white/50">
              <Phone className="w-3.5 h-3.5 text-blue-500/90" />
              <span>{contact.phone}</span>
            </div>
          )}
          {contact.email && (
            <div className="flex items-center gap-1.5 text-sm text-white/50">
              <Mail className="w-3.5 h-3.5 text-blue-500/90" />
              <a 
                href={`mailto:${contact.email}`}
                onClick={handleEmailClick}
                className="truncate hover:text-blue-400 transition-colors"
              >
                {contact.email}
              </a>
            </div>
          )}
        </div>
      </div>

      <div className="opacity-0 group-hover:opacity-100 transition-opacity">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0 hover:bg-white/5"
            >
              <MoreHorizontal className="h-4 w-4 text-white/70" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            className="w-48"
          >
            <DropdownMenuItem 
              className="text-white/70 hover:text-white focus:text-white cursor-pointer"
              onClick={handleViewDetails}
            >
              View Details
            </DropdownMenuItem>
            <DropdownMenuItem 
              className="text-white/70 hover:text-white focus:text-white cursor-pointer"
              onClick={handleEditContact}
            >
              Edit Contact
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem 
              className="text-red-400 hover:text-red-300 focus:text-red-300 cursor-pointer"
              onClick={handleDeleteContact}
            >
              Delete Contact
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </motion.div>
  )
}
