"use client"

import * as React from "react"
import { format } from "date-fns"
import { Calendar as CalendarIcon } from "lucide-react"
import { fr } from "date-fns/locale"
 
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

export interface DatePickerProps {
  selected: Date | null
  onSelect: (date: Date | null) => void
  placeholder?: string
  id?: string
}

export function DatePicker({ selected, onSelect, placeholder = "Select a date", id }: DatePickerProps) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          id={id}
          variant={"outline"}
          className={cn(
            "w-full justify-start text-left font-normal",
            !selected && "text-muted-foreground"
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {selected ? format(selected, "PPP", { locale: fr }) : <span>{placeholder}</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0">
        <Calendar
          mode="single"
          selected={selected || undefined}
          onSelect={(date) => onSelect(date || null)}
          initialFocus
          locale={fr}
          showOutsideDays={false}
          captionLayout="dropdown"
          fromYear={1900}
          toYear={2100}
        />
      </PopoverContent>
    </Popover>
  )
}
