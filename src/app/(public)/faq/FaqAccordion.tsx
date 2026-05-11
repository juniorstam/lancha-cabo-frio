'use client'

import { useState } from 'react'
import { ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'

interface FaqItem {
  question: string
  answer: string
}

interface FaqAccordionProps {
  items: FaqItem[]
}

export function FaqAccordion({ items }: FaqAccordionProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  function toggle(index: number) {
    setOpenIndex(prev => (prev === index ? null : index))
  }

  return (
    <div className="space-y-3">
      {items.map((item, index) => {
        const isOpen = openIndex === index
        return (
          <div
            key={index}
            className={cn(
              'bg-white rounded-2xl border transition-all duration-200',
              isOpen
                ? 'border-[#00b4d8] shadow-md shadow-[#00b4d8]/10'
                : 'border-gray-100 shadow-sm hover:border-gray-200 hover:shadow'
            )}
          >
            <button
              onClick={() => toggle(index)}
              className="w-full flex items-center justify-between gap-4 px-6 py-5 text-left"
              aria-expanded={isOpen}
            >
              <span
                className={cn(
                  'font-semibold text-base transition-colors',
                  isOpen ? 'text-[#00b4d8]' : 'text-[#0a2540]'
                )}
              >
                {item.question}
              </span>
              <ChevronDown
                className={cn(
                  'w-5 h-5 flex-shrink-0 transition-transform duration-300',
                  isOpen ? 'rotate-180 text-[#00b4d8]' : 'text-gray-400'
                )}
              />
            </button>

            <div
              className={cn(
                'overflow-hidden transition-all duration-300',
                isOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
              )}
            >
              <p className="px-6 pb-6 text-gray-500 text-sm leading-relaxed">
                {item.answer}
              </p>
            </div>
          </div>
        )
      })}
    </div>
  )
}
