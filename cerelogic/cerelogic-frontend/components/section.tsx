'use client'

import React from 'react'

import {
  BookCheck,
  Check,
  File,
  Film,
  Image,
  MessageCircleMore,
  Newspaper,
  Repeat2,
  Search
} from 'lucide-react'

import { cn } from '@/lib/utils'

import { Badge } from './ui/badge'
import { Separator } from './ui/separator'
import { StatusIndicator } from './ui/status-indicator'
import { ToolBadge } from './tool-badge'

type SectionProps = {
  children: React.ReactNode
  className?: string
  size?: 'sm' | 'md' | 'lg'
  title?: string
  separator?: boolean
}

export const Section: React.FC<SectionProps> = ({
  children,
  className,
  size = 'md',
  title,
  separator = false
}) => {
  const iconSize = 16
  const iconClassName = 'mr-1.5 text-muted-foreground'
  let icon: React.ReactNode
  let type: 'text' | 'badge' = 'text'
  switch (title) {
    case 'Images':
      // eslint-disable-next-line jsx-a11y/alt-text
      icon = <Image size={iconSize} className={iconClassName} />
      break
    case 'Videos':
      icon = <Film size={iconSize} className={iconClassName} />
      type = 'badge'
      break
    case 'Sources':
      icon = <Newspaper size={iconSize} className={iconClassName} />
      type = 'badge'
      break
    case 'Answer':
      icon = <BookCheck size={iconSize} className={iconClassName} />
      break
    case 'Related':
      icon = <Repeat2 size={iconSize} className={iconClassName} />
      break
    case 'Follow-up':
      icon = <MessageCircleMore size={iconSize} className={iconClassName} />
      break
    case 'Content':
      icon = <File size={iconSize} className={iconClassName} />
      type = 'badge'
      break
    default:
      icon = <Search size={iconSize} className={iconClassName} />
  }

  return (
    <>
      {separator && <Separator className="my-2 bg-primary/10" />}
      <section
        className={cn(
          ` ${size === 'sm' ? 'py-1' : size === 'lg' ? 'py-4' : 'py-2'}`,
          className
        )}
      >
        {title && type === 'text' && (
          <h2 className="flex items-center leading-none py-2">
            {icon}
            {title}
          </h2>
        )}
        {title && type === 'badge' && (
          <Badge variant="secondary" className="mb-2">
            {icon}
            {title}
          </Badge>
        )}
        {children}
      </section>
    </>
  )
}

export function ToolArgsSection({
  children,
  tool,
  number
}: {
  children: React.ReactNode
  tool: string
  number?: number
}) {
  return (
    <Section
      size="sm"
      className="py-0 flex items-center justify-between w-full"
    >
      <ToolBadge tool={tool}>{children}</ToolBadge>
      {number && number > 0 && (
        <StatusIndicator icon={Check} iconClassName="text-green-500">
          {number} results
        </StatusIndicator>
      )}
    </Section>
  )
}
