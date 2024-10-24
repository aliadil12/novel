

'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import useAppStore from '@/store'
import { toast } from "@/components/ui/use-toast"

export default function ProfilePage() {
  const { user, updateProfile, logout, fetchUser } = useAppStore()
  const router = useRouter()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    fetchUser()
  }, [fetchUser])

  useEffect(() => {
    if (user) {
      setName(user.name || '')
      setEmail(user.email || '')
      setAvatarPreview(user.avatarUrl || null)
    }
  }, [user])

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!isEditing) {
      setIsEditing(true)
      return
    }
    setIsLoading(true)
    try {
      const formData = new FormData()
      formData.append('name', name)
      formData.append('email', email)
      if (fileInputRef.current?.files?.[0]) {
        formData.append('avatar', fileInputRef.current.files[0])
      }
      await updateProfile(formData)
      setIsEditing(false)
      toast({
        title: "تم تحديث الملف الشخصي",
        description: "تم تحديث معلومات الملف الشخصي بنجاح",
      })
    } catch (error) {
      console.error('Error updating profile:', error)
      toast({
        title: "خطأ في التحديث",
        description: "حدث خطأ أثناء تحديث الملف الشخصي",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
      fetchUser()  // Fetch updated user data
    }
  }

  const handleLogout = async () => {
    try {
      await logout()
      router.push('/')
    } catch (error) {
      console.error('Error logging out:', error)
      toast({
        title: "خطأ في تسجيل الخروج",
        description: "حدث خطأ أثناء تسجيل الخروج",
        variant: "destructive",
      })
    }
  }

  if (!user) {
    return <div>جاري تحميل البيانات...</div>
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">الملف الشخصي</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="flex flex-col items-center mb-6">
              <Avatar className="w-32 h-32">
                {avatarPreview ? (
                  <Image src={avatarPreview} alt={name || 'User avatar'} width={128} height={128} className="rounded-full" />
                ) : (
                  <AvatarFallback>{name ? name.charAt(0).toUpperCase() : 'U'}</AvatarFallback>
                )}
              </Avatar>
              {isEditing && (
                <Input
                  type="file"
                  ref={fileInputRef}
                  className="mt-2"
                  accept="image/*"
                  onChange={handleFileChange}
                />
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="name">الاسم</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="أدخل اسمك"
                disabled={!isEditing}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">البريد الإلكتروني</Label>
              <Input
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="أدخل بريدك الإلكتروني"
                disabled={!isEditing}
              />
            </div>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isEditing ? (isLoading ? 'جاري التحديث...' : 'حفظ التغييرات') : 'تعديل الملف الشخصي'}
            </Button>
          </form>
          <Button onClick={handleLogout} className="w-full mt-4 bg-red-500 hover:bg-red-600">
            تسجيل الخروج
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}

