"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Bell, Menu, Search, X } from "lucide-react"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { useState } from "react"
import { cn } from "@/lib/utils"
import { ModeToggle } from "./mode-toggle"
import { usePathname } from "next/navigation"
import { useAuth } from "@/context/auth-context"

export default function Header() {
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const pathname = usePathname()
  const { user, logout, isLoading } = useAuth()

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-2 md:gap-6">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[240px] sm:w-[300px]">
              <nav className="flex flex-col gap-4 mt-6">
                <Link
                  href="/"
                  className={cn(
                    "text-lg font-medium transition-colors hover:text-foreground/80",
                    pathname === "/" ? "text-foreground" : "text-foreground/60",
                  )}
                >
                  Home
                </Link>
                <Link
                  href="/explore"
                  className={cn(
                    "text-lg font-medium transition-colors hover:text-foreground/80",
                    pathname === "/explore" ? "text-foreground" : "text-foreground/60",
                  )}
                >
                  Explore
                </Link>
                {user && (
                  <Link
                    href="/bookmarks"
                    className={cn(
                      "text-lg font-medium transition-colors hover:text-foreground/80",
                      pathname === "/bookmarks" ? "text-foreground" : "text-foreground/60",
                    )}
                  >
                    Bookmarks
                  </Link>
                )}
                {!user && !isLoading ? (
                  <div className="flex flex-col gap-2 mt-4">
                    <Link href="/signin">
                      <Button variant="outline" className="w-full">
                        Sign In
                      </Button>
                    </Link>
                    <Link href="/signup">
                      <Button className="w-full">Sign Up</Button>
                    </Link>
                  </div>
                ) : (
                  user && (
                    <Link
                      href="/new-story"
                      className={cn(
                        "text-lg font-medium transition-colors hover:text-foreground/80",
                        pathname === "/new-story" ? "text-foreground" : "text-foreground/60",
                      )}
                    >
                      Write
                    </Link>
                  )
                )}
              </nav>
            </SheetContent>
          </Sheet>
          <Link href="/" className="flex items-center space-x-2">
            <span className="font-bold text-xl">BlogMERN</span>
          </Link>
          <NavigationMenu className="hidden md:flex">
            <NavigationMenuList>
              <NavigationMenuItem>
                <Link href="/" legacyBehavior passHref>
                  <NavigationMenuLink className={navigationMenuTriggerStyle()}>Home</NavigationMenuLink>
                </Link>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <Link href="/explore" legacyBehavior passHref>
                  <NavigationMenuLink className={navigationMenuTriggerStyle()}>Explore</NavigationMenuLink>
                </Link>
              </NavigationMenuItem>
              {user && (
                <NavigationMenuItem>
                  <Link href="/bookmarks" legacyBehavior passHref>
                    <NavigationMenuLink className={navigationMenuTriggerStyle()}>Bookmarks</NavigationMenuLink>
                  </Link>
                </NavigationMenuItem>
              )}
            </NavigationMenuList>
          </NavigationMenu>
        </div>
        <div className="flex items-center gap-2">
          {isSearchOpen ? (
            <div className="flex items-center">
              <Input type="search" placeholder="Search..." className="w-[200px] md:w-[300px]" autoFocus />
              <Button variant="ghost" size="icon" onClick={() => setIsSearchOpen(false)}>
                <X className="h-5 w-5" />
                <span className="sr-only">Close search</span>
              </Button>
            </div>
          ) : (
            <Button variant="ghost" size="icon" onClick={() => setIsSearchOpen(true)}>
              <Search className="h-5 w-5" />
              <span className="sr-only">Search</span>
            </Button>
          )}
          <ModeToggle />
          {user ? (
            <>
              <Button variant="ghost" size="icon" className="hidden md:flex">
                <Bell className="h-5 w-5" />
                <span className="sr-only">Notifications</span>
              </Button>
              <Link href="/new-story">
                <Button variant="ghost" className="hidden md:flex">
                  Write
                </Button>
              </Link>
              <Link href="/profile">
                <Avatar>
                  <AvatarImage src={user.avatar || "/placeholder.svg?height=40&width=40"} alt={user.name} />
                  <AvatarFallback>{user.name?.charAt(0) || "U"}</AvatarFallback>
                </Avatar>
              </Link>
            </>
          ) : (
            !isLoading && (
              <div className="hidden md:flex items-center gap-2">
                <Link href="/signin">
                  <Button variant="ghost">Sign In</Button>
                </Link>
                <Link href="/signup">
                  <Button>Sign Up</Button>
                </Link>
              </div>
            )
          )}
        </div>
      </div>
    </header>
  )
}
