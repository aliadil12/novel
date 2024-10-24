
'use client'

import React, { useState, useEffect, useMemo } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Eye, Book, Heart, Share2, ChevronLeft, ChevronRight, Crown } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import SocialIcon from '@/components/ui/social-icon'
import { Novel, Chapter } from '@/types'
import { getImageUrl } from '@/lib/utils'
import useAppStore from '@/store'

interface NovelDetailsProps {
  novel: Novel
  chapters: Chapter[]
}

const SupporterBadge = ({ name }: { name: string }) => (
  <div className="flex items-center space-x-2 space-x-reverse mb-2">
    <Crown className="w-4 h-4 text-yellow-500 dark:text-yellow-300" />
    <div>
      <span className="font-medium text-sm text-foreground dark:text-gray-200">{name}</span>
    </div>
  </div>
)

export default function NovelDetails({ novel: initialNovel, chapters: initialChapters }: NovelDetailsProps) {
  const { favorites, addFavorite, removeFavorite, isFavorite } = useAppStore()
  const [novel, setNovel] = useState(initialNovel)
  const [chapters, setChapters] = useState(initialChapters)
  const [isBookmarked, setIsBookmarked] = useState(false)
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')
  const [currentPage, setCurrentPage] = useState(1)
  const [isShareDialogOpen, setIsShareDialogOpen] = useState(false)
  const [isSupportDialogOpen, setIsSupportDialogOpen] = useState(false)
  const chaptersPerPage = 10

  useEffect(() => {
    setIsBookmarked(isFavorite(novel._id))
  }, [favorites, novel._id, isFavorite])

  // استخدام useMemo لترتيب وتقسيم الفصول
  const sortedAndPaginatedChapters = useMemo(() => {
    // نسخ المصفوفة قبل الترتيب لتجنب تعديل البيانات الأصلية
    const sorted = [...chapters].sort((a, b) => {
      if (sortOrder === 'desc') {
        return b.number - a.number;
      }
      return a.number - b.number;
    });

    // حساب مؤشرات الصفحة الحالية
    const startIndex = (currentPage - 1) * chaptersPerPage;
    const endIndex = startIndex + chaptersPerPage;
    
    // إرجاع الفصول المرتبة والمقسمة للصفحة الحالية
    return sorted.slice(startIndex, endIndex);
  }, [chapters, currentPage, sortOrder]);

  // حساب إجمالي عدد الصفحات
  const totalPages = Math.ceil(chapters.length / chaptersPerPage);

  const handleBookmark = () => {
    if (isBookmarked) {
      removeFavorite(novel._id)
    } else {
      addFavorite(novel._id)
    }
    setIsBookmarked(!isBookmarked)
  }

  const formatViews = (views: number) => {
    if (views >= 1000000) {
      return (views / 1000000).toFixed(1) + 'M'
    } else if (views >= 1000) {
      return (views / 1000).toFixed(1) + 'K'
    }
    return views.toString()
  }

  const handleSortChange = (newOrder: 'asc' | 'desc') => {
    setSortOrder(newOrder);
    setCurrentPage(1); // إعادة تعيين الصفحة إلى الأولى عند تغيير الترتيب
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row gap-8 mb-8">
        <div className="md:w-1/3 lg:w-1/4">
          <div className="relative w-full pt-[150%]">
            <Image 
              src={getImageUrl(novel.cover)}
              alt={novel.title}
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              className="rounded-lg shadow-lg object-cover"
            />
            <div className="absolute top-2 right-2 bg-blue-500 text-white px-2 py-1 text-xs font-semibold rounded">
              مترجمة
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-2 left-2 bg-background/50 hover:bg-background/80"
              onClick={handleBookmark}
            >
              <Heart className={`h-5 w-5 ${isBookmarked ? 'fill-primary text-primary' : 'text-foreground'}`} />
            </Button>
          </div>
        </div>
        <div className="md:w-2/3 lg:w-3/4 flex flex-col justify-between">
          <div>
            <h1 className="text-2xl md:text-4xl font-bold mb-4 text-foreground">{novel.title}</h1>
            <div className="flex flex-wrap gap-2 mb-4">
              {novel.categories.map((category, index) => (
                <Link href={`/library?category=${category}`} key={index}>
                  <Badge variant="secondary" className="bg-orange-100 text-orange-800 hover:bg-orange-200 dark:bg-yellow-900/30 dark:text-yellow-200 dark:hover:bg-yellow-900/50 cursor-pointer text-xs md:text-sm px-2 md:px-3 py-1">
                    {category}
                  </Badge>
                </Link>
              ))}
            </div>
            <p className="text-muted-foreground mb-6 text-sm md:text-lg whitespace-pre-line">{novel.description}</p>
            
            <div className="mb-6">
              <h2 className="text-xl md:text-2xl font-semibold text-foreground dark:text-gray-200 mb-3">الداعمون</h2>
              <div className="space-y-2">
                {novel.supporters.map((supporter, index) => (
                  <SupporterBadge key={index} name={supporter} />
                ))}
              </div>
            </div>
          </div>
          
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center space-x-2 space-x-reverse">
              <Badge 
                variant="outline" 
                className={`text-xs md:text-sm px-2 py-1 ${
                  novel.completionStatus === 'مكتملة' 
                    ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-200' 
                    : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-200'
                }`}
              >
                {novel.completionStatus}
              </Badge>
              <span className="flex items-center text-muted-foreground text-xs md:text-sm">
                <Book className="w-3 h-3 md:w-4 md:h-4 ml-1 text-yellow-600 dark:text-yellow-400" />
                {novel.publishedChapters}
              </span>
              <span className="flex items-center text-muted-foreground text-xs md:text-sm">
                <Eye className="w-3 h-3 md:w-4 md:h-4 ml-1 text-yellow-600 dark:text-yellow-400" />
                {formatViews(novel.views)}
              </span>
            </div>
            <div className="flex items-center space-x-2 space-x-reverse">
              <Button variant="outline" size="sm" onClick={handleBookmark}>
                <Heart className={`w-3 h-3 md:w-4 md:h-4 ${isBookmarked ? 'fill-yellow-600 dark:fill-yellow-400 text-yellow-600 dark:text-yellow-400' : 'text-muted-foreground'}`} />
              </Button>
              <Button variant="outline" size="sm" onClick={() => setIsShareDialogOpen(true)}>
                <Share2 className="w-3 h-3 md:w-4 md:h-4 text-muted-foreground" />
              </Button>
            </div>
          </div>
        </div>
      </div>
      
      <Card className="mt-8 border border-border">
        <CardHeader className="flex flex-col md:flex-row items-start md:items-center justify-between">
          <CardTitle className="text-xl md:text-2xl text-foreground mb-2 md:mb-0">قائمة الفصول</CardTitle>
          <Select value={sortOrder} onValueChange={(value: 'asc' | 'desc') => handleSortChange(value)}>
            <SelectTrigger className="w-full md:w-[180px]">
              <SelectValue placeholder="ترتيب الفصول" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="desc">من الأحدث للأقدم</SelectItem>
              <SelectItem value="asc">من الأقدم للأحدث</SelectItem>
            </SelectContent>
          </Select>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {sortedAndPaginatedChapters.map((chapter) => (
              <Link 
                href={`/novel/${novel.slug}/chapter/${chapter.number}`} 
                key={chapter._id}
              >
                <div className="flex items-center justify-between p-3 md:p-4 bg-card text-card-foreground rounded-lg shadow hover:bg-accent hover:text-accent-foreground dark:hover:bg-accent dark:hover:text-accent-foreground transition-colors cursor-pointer border border-border">
                  <div className="flex items-center">
                    <span className="text-lg md:text-xl font-bold text-yellow-600 dark:text-yellow-400 ml-2">{chapter.number}</span>
                    <h3 className="font-semibold text-sm md:text-lg">: {chapter.title}</h3>
                  </div>
                  <div className="flex items-center text-muted-foreground text-xs md:text-sm">
                    <Eye className="w-3 h-3 md:w-4 md:h-4 ml-1 text-yellow-600 dark:text-yellow-400" />
                    <span>{formatViews(chapter.views)}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {totalPages > 1 && (
            <Pagination className="mt-6">
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious 
                    href="#" 
                    onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                    className={currentPage === 1 ? 'pointer-events-none opacity-50' : ''}
                  >
                    <ChevronRight className="h-4 w-4 ml-2" />
                    السابق
                  </PaginationPrevious>
                </PaginationItem>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <PaginationItem key={page}>
                    <PaginationLink 
                      href="#" 
                      onClick={() => handlePageChange(page)}
                      isActive={currentPage === page}
                    >
                      {page}
                    </PaginationLink>
                  </PaginationItem>
                ))}
                <PaginationItem>
                  <PaginationNext 
                    href="#" 
                    onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
                    className={currentPage === totalPages ? 'pointer-events-none opacity-50' : ''}
                  >
                    التالي
                    <ChevronLeft className="h-4 w-4 mr-2" />
                  </PaginationNext>
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          )}
        </CardContent>
      </Card>

      <Card className="mt-8 bg-gradient-to-r from-amber-400 to-amber-600 dark:from-amber-600 dark:to-amber-800 text-white border border-border">
        <CardContent className="flex flex-col md:flex-row items-center justify-between p-6">
          <div>
            <h3 className="text-xl md:text-2xl font-bold mb-2">هل أعجبتك الرواية؟</h3>
            <p className="text-sm md:text-base">ادعم الرواية وساعد في استمرار ترجمتها ونشرها!</p>
          </div>
          <Button className="mt-4 md:mt-0 bg-white text-amber-600 hover:bg-amber-100 dark:bg-amber-200 dark:text-amber-800 dark:hover:bg-amber-300" onClick={() => setIsSupportDialogOpen(true)}>
            دعم الرواية
          </Button>
        </CardContent>
      </Card>

      <Dialog open={isShareDialogOpen} onOpenChange={setIsShareDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>مشاركة الرواية</DialogTitle>
            <DialogDescription>
              اختر منصة لمشاركة هذه الرواية مع أصدقائك
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-center space-x-4">
            <Button variant="outline" className="flex items-center space-x-2">
              <SocialIcon name="facebook" className="w-5 h-5" />
              <span>Facebook</span>
            </Button>
            <Button variant="outline" className="flex items-center space-x-2">
              <SocialIcon name="twitter" className="w-5 h-5" />
              <span>Twitter</span>
              </Button>
            <Button variant="outline" className="flex items-center space-x-2">
              <SocialIcon name="telegram" className="w-5 h-5" />
              <span>Telegram</span>
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={isSupportDialogOpen} onOpenChange={setIsSupportDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>دعم الرواية</DialogTitle>
            <DialogDescription>
              اختر وسيلة للتواصل ودعم الرواية
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-center space-x-4">
            <Button variant="outline" className="flex items-center space-x-2">
              <SocialIcon name="telegram" className="w-5 h-5" />
              <span>Telegram</span>
            </Button>
            <Button variant="outline" className="flex items-center space-x-2">
              <SocialIcon name="facebook" className="w-5 h-5" />
              <span>Facebook</span>
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
