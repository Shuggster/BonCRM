import { Contact } from '../types'

interface ContactsListProps {
  contacts: Contact[]
  onSelect: (contact: Contact) => void
  loading?: boolean
  error?: string | null
}

export const ContactsList: React.FC<ContactsListProps> = ({
  contacts,
  onSelect,
  loading,
  error
}) => {
  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-4 text-red-600 bg-red-50 rounded-lg">
        <p className="font-medium">Error: {error}</p>
      </div>
    )
  }

  if (contacts.length === 0) {
    return (
      <div className="p-4 text-gray-500 text-center">
        <p>No contacts found</p>
      </div>
    )
  }

  return (
    <div className="divide-y divide-gray-200">
      {contacts.map(contact => (
        <div
          key={contact.id}
          onClick={() => onSelect(contact)}
          className="p-4 hover:bg-gray-50 cursor-pointer transition-colors duration-150 ease-in-out"
        >
          <div className="flex items-center space-x-4">
            {contact.avatar_url ? (
              <img
                src={contact.avatar_url}
                alt={`${contact.first_name} ${contact.last_name}`}
                className="h-10 w-10 rounded-full"
              />
            ) : (
              <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                <span className="text-gray-500 font-medium">
                  {contact.first_name?.[0]}
                  {contact.last_name?.[0]}
                </span>
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                {contact.first_name} {contact.last_name}
              </p>
              {contact.company && (
                <p className="text-sm text-gray-500 truncate">
                  {contact.job_title && `${contact.job_title} at `}{contact.company}
                </p>
              )}
              <p className="text-sm text-gray-500 truncate">{contact.email}</p>
            </div>
            {contact.lead_status && (
              <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                ${contact.lead_status === 'new' ? 'bg-blue-100 text-blue-800' :
                  contact.lead_status === 'qualified' ? 'bg-green-100 text-green-800' :
                  contact.lead_status === 'won' ? 'bg-emerald-100 text-emerald-800' :
                  contact.lead_status === 'lost' ? 'bg-red-100 text-red-800' :
                  'bg-gray-100 text-gray-800'}`}>
                {contact.lead_status.charAt(0).toUpperCase() + contact.lead_status.slice(1)}
              </span>
            )}
          </div>
        </div>
      ))}
    </div>
  )
} 