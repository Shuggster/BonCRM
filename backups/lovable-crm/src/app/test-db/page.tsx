"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"

interface Contact {
  id: string
  name: string
  email: string
  phone: string | null
  created_at: string
}

export default function TestPage() {
  const [contacts, setContacts] = useState<Contact[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchContacts() {
      try {
        const { data, error } = await supabase
          .from('contacts')
          .select('*')
        
        if (error) throw error
        setContacts(data || [])
      } catch (err: any) {
        console.error('Error:', err)
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchContacts()
  }, [])

  if (loading) return <div className="text-white">Loading...</div>
  if (error) return <div className="text-red-400">Error: {error}</div>

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4 text-white">Contacts List</h1>
      <div className="overflow-x-auto rounded-lg">
        <table className="min-w-full bg-gray-800 border border-gray-700">
          <thead>
            <tr className="bg-gray-900">
              <th className="px-6 py-3 border-b border-gray-700 text-left text-gray-300">Name</th>
              <th className="px-6 py-3 border-b border-gray-700 text-left text-gray-300">Email</th>
              <th className="px-6 py-3 border-b border-gray-700 text-left text-gray-300">Phone</th>
              <th className="px-6 py-3 border-b border-gray-700 text-left text-gray-300">Created At</th>
            </tr>
          </thead>
          <tbody>
            {contacts.map((contact) => (
              <tr key={contact.id} className="hover:bg-gray-700">
                <td className="px-6 py-4 border-b border-gray-700 text-gray-300">{contact.name}</td>
                <td className="px-6 py-4 border-b border-gray-700 text-gray-300">{contact.email}</td>
                <td className="px-6 py-4 border-b border-gray-700 text-gray-300">{contact.phone || '-'}</td>
                <td className="px-6 py-4 border-b border-gray-700 text-gray-300">
                  {new Date(contact.created_at).toLocaleDateString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
} 