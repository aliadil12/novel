
'use client'

import React, { useState, useEffect, useCallback, useMemo } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { Search, Home, HelpCircle, Library, Heart, User, LogOut, Sun, Moon, Menu, LogIn } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Novel } from '@/types'
import { useTheme } from 'next-themes'
import AuthModal from '../auth/auth-modal'
import useAppStore from '@/store'
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { getImageUrl } from '@/lib/utils'

const Header: React.FC = React.memo(() => {
  const { user, logout, novels, fetchNovels, fetchUser } = useAppStore()
  const router = useRouter()
  const [searchTerm, setSearchTerm] = useState('')
  const [searchResults, setSearchResults] = useState<Novel[]>([])
  const { theme, setTheme } = useTheme()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false)

  useEffect(() => {
    fetchNovels()
    fetchUser()
  }, [fetchNovels, fetchUser])

  const handleSearch = useCallback((novelSlug: string) => {
    router.push(`/novel/${novelSlug}`); 
    setSearchTerm('');
    setSearchResults([]);
  }, [router]);

  useEffect(() => {
    if (searchTerm.length > 0) {
      const results = novels.filter(novel => 
        novel.title.toLowerCase().includes(searchTerm.toLowerCase())
      ).slice(0, 5);
      setSearchResults(results);
    } else {
      setSearchResults([]);
    }
  }, [searchTerm, novels]);

  const toggleTheme = useCallback(() => {
    setTheme(theme === 'dark' ? 'light' : 'dark')
  }, [theme, setTheme])

  const handleLogout = useCallback(async () => {
    try {
      await logout()
      router.push('/')
    } catch (error) {
      console.error('Error logging out:', error)
    }
  }, [logout, router])

  const avatarUrl = useMemo(() => user?.avatarUrl ? getImageUrl(user.avatarUrl) : null, [user?.avatarUrl])

  return (
    <header className="sticky top-0 z-50 w-full border-b theme-border theme-card">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        {/* Mobile view */}
        <div className="flex md:hidden items-center w-full">
          <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[300px]">
              <nav className="flex flex-col space-y-4 mt-8">
                <Link href="/" onClick={() => setIsMobileMenuOpen(false)}>
                  <Button variant="ghost" className="w-full justify-start">
                    <Home className="mr-2 h-4 w-4" />
                    الرئيسية
                  </Button>
                </Link>
                <Link href="/library" onClick={() => setIsMobileMenuOpen(false)}>
                  <Button variant="ghost" className="w-full justify-start">
                    <Library className="mr-2 h-4 w-4" />
                    المكتبة
                  </Button>
                </Link>
                <Link href="/favorites" onClick={() => setIsMobileMenuOpen(false)}>
                  <Button variant="ghost" className="w-full justify-start">
                    <Heart className="mr-2 h-4 w-4" />
                    المفضلة
                  </Button>
                </Link>
                <Link href="/support" onClick={() => setIsMobileMenuOpen(false)}>
                  <Button variant="ghost" className="w-full justify-start">
                    <HelpCircle className="mr-2 h-4 w-4" />
                    الدعم
                  </Button>
                </Link>
              </nav>
            </SheetContent>
          </Sheet>
          <Button variant="ghost" size="icon" onClick={toggleTheme} className="ml-2">
            {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </Button>
          <Link href="/">
            <Button variant="ghost" size="icon" className="ml-2">
              <Home className="h-5 w-5" />
            </Button>
          </Link>
          <div className="relative flex-grow mx-2">
            <Search className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground pointer-events-none" />
            <Input
              type="search"
              placeholder="ابحث عن الروايات..."
              className="pl-10 pr-12 w-full"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            {searchResults.length > 0 && (
              <div className="absolute top-full left-0 right-0 bg-white dark:bg-gray-800 shadow-lg rounded-b-lg mt-1 z-10">
                {searchResults.map((novel) => (
                  <div 
                    key={novel.id} 
                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer"
                    onClick={() => handleSearch(novel.slug)}
                  >
                    {novel.title}
                  </div>
                ))}
              </div>
            )}
          </div>
          {user ? (
            <Button variant="ghost" size="icon" onClick={() => router.push('/profile')}>
              <User className="h-5 w-5" />
            </Button>
          ) : (
            <Button variant="ghost" size="icon" onClick={() => setIsAuthModalOpen(true)}>
              <LogIn className="h-5 w-5" />
            </Button>
          )}
        </div>

        {/* Desktop view */}
        <div className="hidden md:flex items-center space-x-6">
          <Link href="/" className="flex items-center space-x-2">
            <span className="text-2xl font-bold">عالم الروايات</span>
          </Link>
          <nav className="flex items-center space-x-4 text-sm font-medium">
            <Link href="/">
              <Button variant="ghost" className="text-foreground/60 hover:text-foreground/80 theme-hover">
                <Home className="w-4 h-4 ml-2" />
                الرئيسية
              </Button>
            </Link>
            <Link href="/library">
              <Button variant="ghost" className="text-foreground/60 hover:text-foreground/80 theme-hover">
                <Library className="w-4 h-4 ml-2" />
                المكتبة
              </Button>
            </Link>
            <Link href="/favorites">
              <Button variant="ghost" className="text-foreground/60 hover:text-foreground/80 theme-hover">
                <Heart className="w-4 h-4 ml-2" />
                المفضلة
              </Button>
            </Link>
            <Link href="/support">
              <Button variant="ghost" className="text-foreground/60 hover:text-foreground/80 theme-hover">
                <HelpCircle className="w-4 h-4 ml-2" />
                الدعم
              </Button>
            </Link>
          </nav>
        </div>
        <div className="hidden md:flex items-center space-x-4">
        <div className="relative">
    <Search className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground pointer-events-none" />
    <Input
      type="search"
      placeholder="ابحث عن الروايات..."
      className="pl-10 pr-12 w-[300px]"
      value={searchTerm}
      onChange={(e) => setSearchTerm(e.target.value)}
    />
    {searchResults.length > 0 && (
      <div className="absolute top-full left-0 right-0 bg-white dark:bg-gray-800 shadow-lg rounded-b-lg mt-1 z-10">
        {searchResults.map((novel) => (
          <div 
            key={novel._id} 
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer"
            onClick={() => handleSearch(novel.slug)}
                  >
                    {novel.title}
                  </div>
                ))}
              </div>
            )}
          </div>
          <Button variant="ghost" size="icon" onClick={toggleTheme}>
            {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </Button>
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                  <Avatar className="h-8 w-8">
                    {avatarUrl ? (
                      <Image 
                        src={avatarUrl}
                        alt={user.name || 'User'} 
                        width={32} 
                        height={32} 
                        className="rounded-full" 
                      />
                    ) : (
                      <AvatarFallback>{user.name ? user.name.charAt(0).toUpperCase() : 'U'}</AvatarFallback>
                    )}
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => router.push('/profile')}>
                  <User className="mr-2 h-4 w-4" />
                  <span>الملف الشخصي</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleLogout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>تسجيل الخروج</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button onClick={() => setIsAuthModalOpen(true)} className="theme-button">
              تسجيل الدخول
            </Button>
          )}
        </div>
      </div>
      <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
    </header>
  )
})

Header.displayName = 'Header'

export default Header

