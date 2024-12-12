"use client"

import { useState, useEffect } from 'react'
import { X, Plus, Trash2, Edit2, Building2 } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { verifyDatabaseConnection } from '@/lib/verify-db'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

interface Industry {
  id: string
  name: string
  description: string | null
  parent_id: string | null
}

interface IndustryManagementModalProps {
  isOpen: boolean
  onClose: () => void
  onIndustriesUpdated: () => void
}

export function IndustryManagementModal({ isOpen, onClose, onIndustriesUpdated }: IndustryManagementModalProps) {
  const [industries, setIndustries] = useState<Industry[]>([])
  const [newIndustryName, setNewIndustryName] = useState('')
  const [newIndustryDescription, setNewIndustryDescription] = useState('')
  const [editingIndustry, setEditingIndustry] = useState<Industry | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (isOpen) {
      // Verify database connection when modal opens
      verifyDatabaseConnection().then((result) => {
        if (!result.success) {
          console.error('Database verification failed:', result.error)
          alert(`Database connection error: ${result.error}`)
        }
      })
      fetchIndustries()
    }
  }, [isOpen])

  const fetchIndustries = async () => {
    try {
      const { data, error } = await supabase
        .from('industries')
        .select('*')
        .order('name')

      if (error) throw error
      setIndustries(data || [])
    } catch (error) {
      console.error('Error fetching industries:', error)
    }
  }

  const handleCreateIndustry = async () => {
    if (!newIndustryName.trim()) return

    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('industries')
        .insert([
          {
            name: newIndustryName.trim(),
            description: newIndustryDescription.trim() || null
          }
        ])
        .select()

      if (error) {
        console.error('Supabase error creating industry:', error.message)
        alert(`Error creating industry: ${error.message}`)
        return
      }

      await fetchIndustries()
      setNewIndustryName('')
      setNewIndustryDescription('')
      onIndustriesUpdated()
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error occurred'
      console.error('Error creating industry:', message)
      alert(`Error creating industry: ${message}`)
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateIndustry = async () => {
    if (!editingIndustry || !editingIndustry.name.trim()) return

    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('industries')
        .update({
          name: editingIndustry.name.trim(),
          description: editingIndustry.description?.trim() || null
        })
        .eq('id', editingIndustry.id)
        .select()

      if (error) {
        console.error('Supabase error updating industry:', error.message)
        alert(`Error updating industry: ${error.message}`)
        return
      }

      await fetchIndustries()
      setEditingIndustry(null)
      onIndustriesUpdated()
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error occurred'
      console.error('Error updating industry:', message)
      alert(`Error updating industry: ${message}`)
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteIndustry = async (industryId: string) => {
    if (!confirm('Are you sure you want to delete this industry? This will remove it from all contacts.')) {
      return
    }

    try {
      setLoading(true)
      const { error } = await supabase
        .from('industries')
        .delete()
        .eq('id', industryId)

      if (error) {
        console.error('Supabase error deleting industry:', error.message)
        alert(`Error deleting industry: ${error.message}`)
        return
      }

      await fetchIndustries()
      onIndustriesUpdated()
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error occurred'
      console.error('Error deleting industry:', message)
      alert(`Error deleting industry: ${message}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Manage Industries</DialogTitle>
          <DialogDescription>
            Create, edit, and delete industries for your contacts.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Create new industry */}
          <div className="space-y-2">
            <Label htmlFor="newIndustryName">New Industry</Label>
            <div className="flex gap-2">
              <div className="flex-1 space-y-2">
                <Input
                  id="newIndustryName"
                  value={newIndustryName}
                  onChange={(e) => setNewIndustryName(e.target.value)}
                  placeholder="Enter industry name"
                />
                <Input
                  value={newIndustryDescription}
                  onChange={(e) => setNewIndustryDescription(e.target.value)}
                  placeholder="Description (optional)"
                />
              </div>
              <Button
                onClick={handleCreateIndustry}
                disabled={loading || !newIndustryName.trim()}
                className="self-start"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Existing industries */}
          <div className="space-y-2">
            <Label>Existing Industries</Label>
            <div className="max-h-[300px] space-y-2 overflow-y-auto">
              {industries.map((industry) => (
                <div
                  key={industry.id}
                  className="flex items-center gap-2 rounded-md border border-input p-2"
                >
                  {editingIndustry?.id === industry.id ? (
                    <>
                      <div className="flex-1 space-y-2">
                        <Input
                          value={editingIndustry.name}
                          onChange={(e) =>
                            setEditingIndustry({ ...editingIndustry, name: e.target.value })
                          }
                          placeholder="Industry name"
                        />
                        <Input
                          value={editingIndustry.description || ''}
                          onChange={(e) =>
                            setEditingIndustry({ ...editingIndustry, description: e.target.value })
                          }
                          placeholder="Description (optional)"
                        />
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleUpdateIndustry}
                        disabled={loading}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </>
                  ) : (
                    <>
                      <div className="flex-1">
                        <div className="font-medium">{industry.name}</div>
                        {industry.description && (
                          <div className="text-sm text-muted-foreground">{industry.description}</div>
                        )}
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setEditingIndustry(industry)}
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteIndustry(industry.id)}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
