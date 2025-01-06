"use client"

import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "sonner"

interface LeadScoringRule {
  id: string
  name: string
  description: string
  category: string
  points: number
  conditions: any
  is_active: boolean
}

export function LeadScoringRules() {
  const [rules, setRules] = useState<LeadScoringRule[]>([])
  const [loading, setLoading] = useState(true)
  const [editingRule, setEditingRule] = useState<LeadScoringRule | null>(null)

  useEffect(() => {
    fetchRules()
  }, [])

  const fetchRules = async () => {
    try {
      const { data, error } = await supabase
        .from('lead_scoring_rules')
        .select('*')
        .order('category', { ascending: true })

      if (error) throw error
      setRules(data || [])
    } catch (error) {
      console.error('Error fetching rules:', error)
      toast.error('Failed to load lead scoring rules')
    } finally {
      setLoading(false)
    }
  }

  const toggleRuleStatus = async (rule: LeadScoringRule) => {
    try {
      const { error } = await supabase
        .from('lead_scoring_rules')
        .update({ is_active: !rule.is_active })
        .eq('id', rule.id)

      if (error) throw error
      
      setRules(rules.map(r => 
        r.id === rule.id ? { ...r, is_active: !r.is_active } : r
      ))
      
      toast.success('Rule status updated')
    } catch (error) {
      console.error('Error updating rule:', error)
      toast.error('Failed to update rule status')
    }
  }

  const updateRule = async (rule: LeadScoringRule) => {
    try {
      const { error } = await supabase
        .from('lead_scoring_rules')
        .update({
          name: rule.name,
          description: rule.description,
          points: rule.points,
          conditions: rule.conditions
        })
        .eq('id', rule.id)

      if (error) throw error
      
      setRules(rules.map(r => 
        r.id === rule.id ? rule : r
      ))
      
      setEditingRule(null)
      toast.success('Rule updated successfully')
    } catch (error) {
      console.error('Error updating rule:', error)
      toast.error('Failed to update rule')
    }
  }

  if (loading) {
    return <div>Loading lead scoring rules...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Lead Scoring Rules</h2>
        <Button onClick={() => setEditingRule({
          id: '',
          name: '',
          description: '',
          category: 'engagement',
          points: 0,
          conditions: {},
          is_active: true
        })}>
          Add New Rule
        </Button>
      </div>

      <div className="grid gap-6">
        {rules.map(rule => (
          <Card key={rule.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>{rule.name}</CardTitle>
                  <CardDescription>{rule.description}</CardDescription>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={rule.is_active}
                      onCheckedChange={() => toggleRuleStatus(rule)}
                    />
                    <span className="text-sm text-muted-foreground">
                      {rule.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  <Button variant="outline" onClick={() => setEditingRule(rule)}>
                    Edit
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label>Category</Label>
                  <div className="mt-1 font-medium">
                    {rule.category.charAt(0).toUpperCase() + rule.category.slice(1)}
                  </div>
                </div>
                <div>
                  <Label>Points</Label>
                  <div className="mt-1 font-medium">{rule.points}</div>
                </div>
                <div>
                  <Label>Conditions</Label>
                  <div className="mt-1 text-sm text-muted-foreground">
                    {Object.entries(rule.conditions).map(([key, value]) => (
                      <div key={key}>
                        {key}: {JSON.stringify(value)}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {editingRule && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm">
          <div className="fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border bg-background p-6 shadow-lg duration-200 sm:rounded-lg">
            <h2 className="text-lg font-semibold">
              {editingRule.id ? 'Edit Rule' : 'Add New Rule'}
            </h2>
            
            <div className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  value={editingRule.name}
                  onChange={e => setEditingRule({ ...editingRule, name: e.target.value })}
                />
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="description">Description</Label>
                <Input
                  id="description"
                  value={editingRule.description}
                  onChange={e => setEditingRule({ ...editingRule, description: e.target.value })}
                />
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="category">Category</Label>
                <Select
                  value={editingRule.category}
                  onValueChange={value => setEditingRule({ ...editingRule, category: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="engagement">Engagement</SelectItem>
                    <SelectItem value="budget">Budget</SelectItem>
                    <SelectItem value="role">Role</SelectItem>
                    <SelectItem value="company_size">Company Size</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="points">Points</Label>
                <Input
                  id="points"
                  type="number"
                  value={editingRule.points}
                  onChange={e => setEditingRule({ ...editingRule, points: parseInt(e.target.value) })}
                />
              </div>
            </div>

            <div className="flex justify-end gap-4">
              <Button variant="outline" onClick={() => setEditingRule(null)}>
                Cancel
              </Button>
              <Button onClick={() => updateRule(editingRule)}>
                Save
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
} 