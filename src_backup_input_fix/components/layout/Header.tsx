'use client'

import { useSession } from "next-auth/react"
import { UserNav } from "./user-nav"
import Image from "next/image"

export function Header() {
  const { data: session } = useSession()

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-card/50">
      <div className="flex h-16 items-center px-6">
        <div className="w-[120px] h-[32px] relative">
          <Image
            src="/images/logo-dark.png.png"
            alt="Bonnymans Logo"
            fill
            className="object-contain"
            priority
          />
        </div>
        <div className="ml-auto flex items-center gap-4">
          {session?.user && <UserNav user={session.user} />}
        </div>
      </div>
    </header>
  )
}
