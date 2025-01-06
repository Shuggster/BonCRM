"use client"

import { useState, useEffect, useCallback, useContext, useRef } from 'react'
import { ContactFormProvider } from '@/components/contacts/ContactFormContext'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Search, Mail, Phone, X, MoreHorizontal, BarChart3, Users, Building2, ArrowUpRight, LayoutGrid } from 'lucide-react'
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
import { Input } from '@/components/ui/Input'
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
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, ResponsiveContainer, Tooltip, RadialBarChart, RadialBar } from 'recharts'

// Add ConversionStatus type before any usage
export type ConversionStatus = 'lead' | 'opportunity' | 'customer' | 'lost';

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

// Add color constants
const LEAD_STATUS_COLORS = {
  'new': '#3b82f6',      // blue
  'contacted': '#f97316', // orange
  'qualified': '#8b5cf6', // purple
  'proposal': '#06b6d4',  // cyan
  'negotiation': '#f59e0b', // amber
  'won': '#22c55e',      // green
  'lost': '#ef4444'      // red
}

const CONVERSION_COLORS = {
  'lead': '#f97316',      // orange
  'opportunity': '#3b82f6', // blue
  'customer': '#22c55e'    // green
}

export default function ContactsPage() {
  const { setContentAndShow, hide } = useSplitViewStore();
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [isMounted, setIsMounted] = useState(false);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>([]);
  const [tagFilterMode, setTagFilterMode] = useState<'AND' | 'OR'>('OR');
  const supabase = createClientComponentClient();
  const [showTagStats, setShowTagStats] = useState(false);
  const [showTagManagement, setShowTagManagement] = useState(false);
  const tagFilterRef = useRef<{ refreshTags: () => void }>(null)
  const [selectedLeadStatus, setSelectedLeadStatus] = useState<LeadStatus | null>(null)
  const [selectedLeadSource, setSelectedLeadSource] = useState<LeadSource | null>(null)
  const [selectedIndustry, setSelectedIndustry] = useState<string | null>(null)
  const [industries, setIndustries] = useState<Array<{ id: string; name: string }>>([])
  const [selectedConversionStatus, setSelectedConversionStatus] = useState<ConversionStatus | null>(null)
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc')
  const [selectedDepartment, setSelectedDepartment] = useState<string | null>(null)
  const [selectedLocation, setSelectedLocation] = useState<string | null>(null)

  // Function declarations
  const handleContactClick = useCallback((contact: Contact) => {
    hide();
    
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

      setContentAndShow(topContent, bottomContent, contact.id);
    }, 100);
  }, [hide, setContentAndShow]);

  const handleEditClick = useCallback((contact: Contact) => {
    hide();
    setSelectedContact(contact);
    
    setTimeout(() => {
      const topContent = (
        <EditContactSplitView
          contact={contact}
          onSave={async (data: Partial<Contact>) => {
            try {
              const { error } = await supabase
                .from('contacts')
                .update(data)
                .eq('id', contact.id);

              if (error) throw error;
              
              await fetchContacts();
              handleContactClick(contact);
            } catch (error) {
              console.error('Error updating contact:', error);
            }
          }}
          onCancel={() => handleContactClick(contact)}
        />
      );

      setContentAndShow(topContent, null, `edit-contact-${contact.id}`);
    }, 100);
  }, [hide, setContentAndShow, handleContactClick, fetchContacts, supabase]);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Define setupInitialContent first
  const setupInitialContent = useCallback(() => {
    // Calculate contact metrics
    const totalContacts = contacts.length;
    const newContactsThisWeek = contacts.filter(contact => {
      if (!contact.created_at) return false;
      const createdAt = new Date(contact.created_at);
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      return createdAt >= weekAgo;
    }).length;

    // Calculate lead status distribution for radial chart
    const leadStatusDistribution = Object.entries(LEAD_STATUS_COLORS).map(([status, color]) => ({
      name: status,
      value: contacts.filter(contact => contact.lead_status === status).length,
      fill: color
    })).sort((a, b) => b.value - a.value);

    // Calculate conversion status distribution for bar chart
    const conversionDistribution = ['lead', 'opportunity', 'customer'].map(status => ({
      name: status,
      value: contacts.filter(contact => contact.conversion_status === status).length
    }))

    const topContent = (
      <div className="h-full bg-black">
        <motion.div 
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
          <div className="relative rounded-t-2xl overflow-hidden backdrop-blur-[16px]" 
            style={{ 
              background: 'linear-gradient(145deg, rgba(255, 255, 255, 0.05), rgba(255, 255, 255, 0.02))'
            }}
          >
            <div className="relative z-10">
              <div className="p-6">
                <div className="flex items-start gap-6">
                  <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-blue-500/30 to-blue-500/10 border border-white/[0.05] flex items-center justify-center">
                    <Users className="w-8 h-8" />
                  </div>
                  <div className="flex-1">
                    <h2 className="text-2xl font-semibold">Contact Overview</h2>
                    <p className="text-zinc-400 mt-1">Your network at a glance</p>
                  </div>
                </div>

                {/* Contact Metrics Grid */}
                <div className="grid grid-cols-2 gap-4 mt-8">
                  <div className="p-4 rounded-xl bg-gradient-to-br from-zinc-800/50 to-zinc-900/50 border border-white/[0.05]">
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-blue-400" />
                      <h3 className="text-sm font-medium text-zinc-400">Total Contacts</h3>
                    </div>
                    {loading ? (
                      <div className="mt-1 flex items-center">
                        <div className="w-6 h-6 border-2 border-white/20 border-t-white/90 rounded-full animate-spin" />
                      </div>
                    ) : (
                      <div className="mt-1 text-2xl font-bold">{totalContacts}</div>
                    )}
                  </div>

                  <div className="p-4 rounded-xl bg-gradient-to-br from-zinc-800/50 to-zinc-900/50 border border-white/[0.05]">
                    <div className="flex items-center gap-2">
                      <ArrowUpRight className="w-4 h-4 text-green-400" />
                      <h3 className="text-sm font-medium text-zinc-400">New This Week</h3>
                    </div>
                    {loading ? (
                      <div className="mt-1 flex items-center">
                        <div className="w-6 h-6 border-2 border-white/20 border-t-white/90 rounded-full animate-spin" />
                      </div>
                    ) : (
                      <div className="mt-1 text-2xl font-bold">{newContactsThisWeek}</div>
                    )}
                  </div>
                </div>

                {/* Charts Section */}
                <div className="grid grid-cols-2 gap-6 p-6">
                  {/* Left Column */}
                  <div className="space-y-6">
                    {/* Lead Status Overview */}
                    <div className="p-6 rounded-xl bg-black border border-white/[0.05]">
                      <h3 className="text-sm font-medium text-zinc-400 mb-6">Lead Status Overview</h3>
                      <div className="grid grid-cols-2 gap-3">
                        {Object.entries(LEAD_STATUS_COLORS).map(([status, color]) => {
                          const count = contacts.filter(c => c.lead_status === status).length;
                          const percentage = ((count / totalContacts) * 100).toFixed(0);
                          return (
                            <button
                              key={status}
                              onClick={() => {
                                setSelectedLeadStatus(status as LeadStatus);
                              }}
                              className="p-4 rounded-lg bg-black/20 hover:bg-black/40 transition-colors border border-white/[0.05] group flex flex-col"
                            >
                              <div className="flex items-center gap-2 mb-3">
                                <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: color }} />
                                <div className="flex items-baseline gap-2 w-full">
                                  <span className="text-2xl font-bold">{count}</span>
                                  <span className="text-xs text-zinc-500">({percentage}%)</span>
                                </div>
                              </div>
                              <span className="text-sm font-medium text-zinc-400 capitalize">{status}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Contact Insights */}
                    <div className="p-6 rounded-xl bg-black border border-white/[0.05]">
                      <h3 className="text-sm font-medium text-zinc-400 mb-6">Contact Insights</h3>
                      <div className="space-y-4">
                        {/* Top Industries */}
                        <div className="p-4 rounded-lg bg-black/20 border border-white/[0.05]">
                          <h4 className="text-xs font-medium text-zinc-400 mb-3">Top Industries</h4>
                          <div className="space-y-2">
                            {Object.entries(
                              contacts.reduce((acc, contact) => {
                                const industry = contact.industries?.name || 'Uncategorized';
                                acc[industry] = (acc[industry] || 0) + 1;
                                return acc;
                              }, {} as Record<string, number>)
                            )
                              .sort(([, a], [, b]) => b - a)
                              .slice(0, 3)
                              .map(([industry, count]) => (
                                <div key={industry} className="flex items-center justify-between">
                                  <span className="text-sm text-zinc-300">{industry}</span>
                                  <span className="text-sm text-zinc-500">{count}</span>
                                </div>
                              ))}
                          </div>
                        </div>

                        {/* Active Tags */}
                        <div className="p-4 rounded-lg bg-black/20 border border-white/[0.05]">
                          <h4 className="text-xs font-medium text-zinc-400 mb-3">Active Tags</h4>
                          <div className="flex flex-wrap gap-2">
                            {contacts
                              .flatMap(contact => (contact as any).contact_tag_relations || [])
                              .filter((rel: any) => rel.contact_tags)
                              .map((rel: any) => rel.contact_tags)
                              .reduce((unique: any[], tag: any) => {
                                if (!unique.find(t => t.id === tag.id)) {
                                  unique.push(tag);
                                }
                                return unique;
  }, [])
                              .slice(0, 5)
                              .map((tag: any) => (
                                <span
                                  key={tag.id}
                                  className="px-2 py-1 rounded-full text-xs"
                                  style={{ 
                                    backgroundColor: `${tag.color}15`,
                                    color: tag.color 
                                  }}
                                >
                                  {tag.name}
                                </span>
                              ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Right Column */}
                  <div className="space-y-6">
                    {/* Conversion Status */}
                    <div className="p-6 rounded-xl bg-black border border-white/[0.05]">
                      <h3 className="text-sm font-medium text-zinc-400 mb-6">Conversion Status</h3>
                      <div className="space-y-6">
                        <ResponsiveContainer width="100%" height={200}>
                          <BarChart data={conversionDistribution}>
                            <XAxis 
                              dataKey="name" 
                              axisLine={false}
                              tickLine={false}
                              tick={{ fill: '#71717a', fontSize: 12 }}
                            />
                            <Tooltip
                              cursor={{ fill: 'rgba(255, 255, 255, 0.05)' }}
                              content={({ active, payload }) => {
                                if (active && payload && payload.length) {
                                  const data = payload[0].payload;
                                  return (
                                    <div className="p-2 rounded-lg bg-[#111111] border border-white/[0.1] backdrop-blur-xl">
                                      <p className="text-sm font-medium capitalize">{data.name}</p>
                                      <p className="text-xs text-zinc-400 mt-1">
                                        {data.value} contacts ({((data.value / totalContacts) * 100).toFixed(0)}%)
                                      </p>
                                    </div>
                                  );
                                }
                                return null;
                              }}
                            />
                            <Bar 
                              dataKey="value" 
                              radius={[4, 4, 0, 0]}
                              minPointSize={2}
                              maxBarSize={40}
                              label={{
                                position: 'top',
                                content: (props: any) => {
                                  const value = typeof props.value === 'number' ? props.value : 0;
                                  return value > 0 ? value : null;
                                },
                                fill: '#71717a',
                                fontSize: 12
                              }}
                            >
                              {conversionDistribution.map((entry, index) => (
                                <Cell 
                                  key={`cell-${index}`}
                                  fill={CONVERSION_COLORS[entry.name as keyof typeof CONVERSION_COLORS]}
                                />
                              ))}
                            </Bar>
                          </BarChart>
                        </ResponsiveContainer>

                        <div className="flex justify-center gap-6">
                          {Object.entries(CONVERSION_COLORS).map(([status, color]) => (
                            <div key={status} className="flex items-center gap-2">
                              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: color }} />
                              <span className="text-sm text-zinc-400 capitalize">{status}</span>
                            </div>
                          ))}
                        </div>

                        {/* Conversion Metrics */}
                        <div className="grid grid-cols-2 gap-4 mt-4">
                          <div className="p-4 rounded-lg bg-black/20 border border-white/[0.05]">
                            <h4 className="text-xs font-medium text-zinc-400 mb-2">Conversion Rate</h4>
                            <div className="flex flex-col">
                              <span className="text-2xl font-bold">
                                {totalContacts > 0 
                                  ? ((contacts.filter(c => c.conversion_status === 'customer').length / totalContacts) * 100).toFixed(1)
                                  : '0'}%
                              </span>
                              <span className="text-sm text-zinc-500">overall</span>
                            </div>
                          </div>
                          
                          <div className="p-4 rounded-lg bg-black/20 border border-white/[0.05]">
                            <h4 className="text-xs font-medium text-zinc-400 mb-2">Opportunity Rate</h4>
                            <div className="flex flex-col">
                              <span className="text-2xl font-bold">
                                {totalContacts > 0
                                  ? ((contacts.filter(c => c.conversion_status === 'opportunity').length / totalContacts) * 100).toFixed(1)
                                  : '0'}%
                              </span>
                              <span className="text-sm text-zinc-500">of leads</span>
                            </div>
                          </div>
                        </div>

                        {/* Quick Actions */}
                        <div className="mt-6">
                          <h4 className="text-sm font-medium text-zinc-400 mb-3">Quick Actions</h4>
                          <div className="grid grid-cols-2 gap-3">
                            <button
                              onClick={handleAddContactClick}
                              className="p-3 rounded-lg bg-black/20 hover:bg-black/40 transition-colors border border-white/[0.05] text-left group"
                            >
                              <div className="flex items-center gap-2">
                                <Plus className="w-4 h-4 text-blue-400" />
                                <span className="text-sm font-medium group-hover:text-blue-400 transition-colors">Add Contact</span>
                              </div>
                            </button>
                            <button
                              onClick={() => setShowTagManagement(true)}
                              className="p-3 rounded-lg bg-black/20 hover:bg-black/40 transition-colors border border-white/[0.05] text-left group"
                            >
                              <div className="flex items-center gap-2">
                                <BarChart3 className="w-4 h-4 text-purple-400" />
                                <span className="text-sm font-medium group-hover:text-purple-400 transition-colors">Manage Tags</span>
                              </div>
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Recent Activity */}
                    <div className="p-6 rounded-xl bg-black border border-white/[0.05]">
                      <h3 className="text-sm font-medium text-zinc-400 mb-6">Recent Activity</h3>
                      <div className="space-y-3">
                        {contacts
                          .filter(contact => contact.updated_at)
                          .sort((a, b) => new Date(b.updated_at!).getTime() - new Date(a.updated_at!).getTime())
                          .slice(0, 3)
                          .map(contact => {
                            const date = new Date(contact.updated_at!);
                            return (
                              <button
                                key={contact.id}
                                onClick={() => handleContactClick(contact)}
                                className="w-full p-4 rounded-lg bg-black/20 hover:bg-black/40 transition-colors border border-white/[0.05] text-left group"
                              >
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: LEAD_STATUS_COLORS[contact.lead_status || 'new'] }} />
                                    <span className="text-sm font-medium group-hover:text-blue-400 transition-colors">
                                      {contact.first_name} {contact.last_name}
                                    </span>
                                  </div>
                                  <span className="text-xs text-zinc-500">
                                    {date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                                  </span>
                                </div>
                                <div className="mt-1 text-xs text-zinc-500">
                                  Status: <span className="capitalize text-zinc-400">{contact.lead_status}</span>
                                  {contact.company && ` • ${contact.company}`}
                                </div>
                              </button>
                            );
                          })}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    )

    const bottomContent = (
      <div className="h-full bg-black">
        <motion.div 
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
          <div className="relative rounded-b-2xl overflow-hidden backdrop-blur-[16px]" 
            style={{ 
              background: 'linear-gradient(145deg, rgba(255, 255, 255, 0.05), rgba(255, 255, 255, 0.02))'
            }}
          >
            <div className="relative z-10">
              <div className="p-6">
                <h3 className="text-lg font-medium mb-4">Recent Contacts</h3>
                <div className="space-y-4">
                  {contacts.slice(0, 3).map((contact, index) => (
                    <motion.div
                      key={contact.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="p-4 rounded-xl bg-black border border-white/[0.05]"
                    >
                      <div className="flex items-center gap-3">
                        <ContactAvatar contact={contact} />
                        <div>
                          <h3 className="font-medium">{contact.first_name} {contact.last_name}</h3>
                          {contact.company && (
                            <p className="text-sm text-zinc-400 mt-1">{contact.company}</p>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                  {contacts.length === 0 && (
                    <div className="text-zinc-400 text-center">
                      No contacts yet. Click "Add Contact" to get started.
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    )

    setContentAndShow(topContent, bottomContent, 'overview')
  }, [contacts, loading, setContentAndShow])

  // Add effect to setup initial content
  useEffect(() => {
    if (contacts.length > 0 && isMounted) {
      setupInitialContent();
    }
  }, [contacts, isMounted, setupInitialContent]);

  // Define refreshDashboard next
  const refreshDashboard = useCallback(() => {
    if (!isMounted) return;
    hide();
    // Increase timeout to ensure proper animation
    setTimeout(() => {
      setupInitialContent();
    }, 300); // Increased from 100ms to 300ms for smoother transition
  }, [isMounted, hide, setupInitialContent]);

  // Then define fetchContacts
  async function fetchContacts() {
    try {
      setLoading(true);
      setError(null);
      
      const { data: contactsData, error: contactsError } = await supabase
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
        .order('first_name', { ascending: sortDirection === 'asc' });
      
      if (contactsError) throw contactsError;
      
      const contacts = (contactsData as ContactWithTags[])?.map(contact => ({
        ...contact,
        tags: contact.contact_tag_relations?.map((rel: ContactTagRelation) => rel.tag_id) || [],
      })) || [];
      
      setContacts(contacts);
      
      // Ensure dashboard refresh happens after state update
      setTimeout(() => {
        refreshDashboard();
      }, 0);
    } catch (error: any) {
      console.error('Error fetching contacts:', error);
      setError(error.message || 'Failed to fetch contacts');
    } finally {
      setLoading(false);
    }
  }

  // Finally, add the useEffect for initial setup
  useEffect(() => {
    if (!isMounted) return;
    setupInitialContent();
  }, [isMounted, setupInitialContent]);

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

  const handleCreateContact = useCallback(() => {
    hide();
    setTimeout(() => {
      const topContent = (
        <ContactFormProvider>
          <QuickAddContact 
            onSuccess={handleCreateContact}
            onCancel={hide}
            section="upper"
          />
        </ContactFormProvider>
      );
      
      const bottomContent = (
        <ContactFormProvider>
          <QuickAddContact 
            onSuccess={handleCreateContact}
            onCancel={hide}
            section="lower"
          />
        </ContactFormProvider>
      );
      
      setContentAndShow(topContent, bottomContent, 'create-contact');
    }, 100);
  }, [hide, setContentAndShow]);

  useEffect(() => {
    if (!isMounted) return;

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

  useEffect(() => {
    fetchContacts()
  }, [sortDirection])

  // Fix setContent call in the button click handler
  const handleAddContactClick = useCallback(() => {
    hide();
    setTimeout(() => {
      const topContent = (
        <QuickAddContact 
          onSuccess={handleSubmit} 
          onCancel={hide}
          section="upper"
        />
      );
      const bottomContent = null;
      setContentAndShow(topContent, bottomContent, 'add-contact');
    }, 100);
  }, [hide, setContentAndShow, handleSubmit]);

  // Add initial data loading
  useEffect(() => {
    fetchContacts();
    fetchIndustries();
  }, []);

  // Add fetchIndustries function
  async function fetchIndustries() {
    try {
      const { data, error } = await supabase
        .from('industries')
        .select('id, name')
        .order('name');

      if (error) throw error;
      setIndustries(data || []);
    } catch (error) {
      console.error('Error fetching industries:', error);
    }
  }

  const handleEditContact = useCallback((contact: Contact) => {
    hide()
    setTimeout(() => {
      const topContent = (
        <EditContact contact={contact} onSubmit={handleSubmit} onCancel={hide} />
      )
      const bottomContent = null
      setContentAndShow(topContent, bottomContent, `edit-contact-${contact.id}`)
    }, 100)
  }, [hide, setContentAndShow, handleSubmit])

  const handleTagsClick = useCallback(() => {
    hide()
    setTimeout(() => {
      const topContent = (
        <TagManagementModal onClose={hide} />
      )
      const bottomContent = null
      setContentAndShow(topContent, bottomContent, 'manage-tags')
    }, 100)
  }, [hide, setContentAndShow])

  const handleImportClick = useCallback(() => {
    hide()
    setTimeout(() => {
      const topContent = (
        <div className="p-6">
          <h2 className="text-lg font-semibold mb-4">Import Contacts</h2>
          {/* Import form content */}
        </div>
      )
      const bottomContent = null
      setContentAndShow(topContent, bottomContent, 'import-contacts')
    }, 100)
  }, [hide, setContentAndShow])

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
                onClick={handleAddContactClick}
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
              onStatusChange={(status: ConversionStatus | null) => setSelectedConversionStatus(status)}
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
            <Button
              onClick={() => {
                hide();
                setTimeout(() => {
                  setupInitialContent();
                }, 100);
              }}
              variant="ghost"
              size="icon"
              className="h-9 w-9 border border-white/[0.08] bg-transparent hover:bg-white/5 ml-auto"
              title="View Contacts Dashboard"
            >
              <LayoutGrid className="h-4 w-4" />
            </Button>
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
