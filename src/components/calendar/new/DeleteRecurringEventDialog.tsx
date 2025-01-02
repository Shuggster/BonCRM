'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { RecurringEventDeleteOption } from '@/types/calendar'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Label } from '@/components/ui/label'

interface DeleteRecurringEventDialogProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: (option: RecurringEventDeleteOption) => void
  eventTitle: string
}

export function DeleteRecurringEventDialog({
  isOpen,
  onClose,
  onConfirm,
  eventTitle
}: DeleteRecurringEventDialogProps) {
  const [selectedOption, setSelectedOption] = useState<RecurringEventDeleteOption>('single')

  const handleConfirm = () => {
    onConfirm(selectedOption)
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px] bg-[#111111] border-white/10">
        <DialogHeader>
          <DialogTitle className="text-white">Delete Recurring Event</DialogTitle>
          <DialogDescription className="text-zinc-400">
            How would you like to delete "{eventTitle}"?
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          <RadioGroup
            value={selectedOption}
            onValueChange={(value) => setSelectedOption(value as RecurringEventDeleteOption)}
            className="space-y-4"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="single" id="single" />
              <Label htmlFor="single" className="text-white">
                Delete this occurrence only
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="future" id="future" />
              <Label htmlFor="future" className="text-white">
                Delete this and all future occurrences
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="all" id="all" />
              <Label htmlFor="all" className="text-white">
                Delete all occurrences
              </Label>
            </div>
          </RadioGroup>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={onClose}
            className="border-white/10 hover:bg-white/5 text-white"
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={handleConfirm}
          >
            Delete
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
} 