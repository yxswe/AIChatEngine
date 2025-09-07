'use client'

import { User2 } from 'lucide-react'
import { useAuthStore } from '@/lib/supabase/client'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

export const CurrentUserAvatar = () => {
  const { getUserName, getUserImage } = useAuthStore()
  const profileImage = getUserImage()
  const name = getUserName()
  const initials = name
    ?.split(' ')
    ?.map(word => word[0])
    ?.join('')
    ?.toUpperCase()

  return (
    <Avatar className="size-6">
      {profileImage && <AvatarImage src={profileImage} alt={initials} />}
      <AvatarFallback>
        {initials === '?' ? (
          <User2 size={16} className="text-muted-foreground" />
        ) : (
          initials
        )}
      </AvatarFallback>
    </Avatar>
  )
}
