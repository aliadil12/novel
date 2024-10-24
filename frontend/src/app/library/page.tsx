
'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import NovelCard from '@/components/novel/novel-card'
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination"
import { ChevronLeft, ChevronRight, Search } from 'lucide-react'
import { useNovels } from '@/hooks/use-novels'
import { Novel } from '@/types'
import { Card, CardContent } from "@/components/ui/card"
import { Button } from '@/components/ui/button'

export default function LibraryPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { novels, isLoading, error } = useNovels()
  const [searchTerm, setSearchTerm] = useState("")
  const [searchResults, setSearchResults] = useState<Novel[]>([])
  const [categoryFilter, setCategoryFilter] = useState(searchParams.get('category') || "الكل")
  const [statusFilter, setStatusFilter] = useState("الكل")
  const [sortBy, setSortBy] = useState("الأكثر فصولاً")
  const [currentPage, setCurrentPage] = useState(1)
  const [categories, setCategories] = useState<string[]>(['الكل'])
  const novelsPerPage = 18

  // جلب التصنيفات
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/categories`)
        if (!response.ok) {
          throw new Error('Failed to fetch categories')
        }
        const data = await response.json()
        setCategories(['الكل', ...data.map((category: { name: string }) => category.name)])
      } catch (error) {
        console.error('Error fetching categories:', error)
      }
    }

    fetchCategories()
  }, [])

  // تحديث التصنيف عند تغيير البارامترات
  useEffect(() => {
    const category = searchParams.get('category')
    if (category) {
      setCategoryFilter(category)
    }
  }, [searchParams])

  // البحث
  useEffect(() => {
    if (searchTerm.length > 0) {
      const results = novels.filter(novel => 
        novel.title.toLowerCase().includes(searchTerm.toLowerCase())
      ).slice(0, 5)
      setSearchResults(results)
    } else {
      setSearchResults([])
    }
  }, [searchTerm, novels])

  // تصفية وترتيب الروايات
  const filteredNovels = useMemo(() => {
    return novels
      .filter((novel: Novel) => 
        (categoryFilter === "الكل" || novel.categories.includes(categoryFilter)) &&
        (statusFilter === "الكل" || novel.completionStatus === statusFilter)
      )
      .sort((a: Novel, b: Novel) => {
        switch (sortBy) {
          case "الأكثر فصولاً":
            return b.publishedChapters - a.publishedChapters
          case "الأقل فصولاً":
            return a.publishedChapters - b.publishedChapters
          case "الأكثر مشاهدة":
            return b.views - a.views
          default:
            return 0
        }
      })
  }, [novels, categoryFilter, statusFilter, sortBy])

  const pageCount = Math.ceil(filteredNovels.length / novelsPerPage)
  const indexOfLastNovel = currentPage * novelsPerPage
  const indexOfFirstNovel = indexOfLastNovel - novelsPerPage
  const currentNovels = filteredNovels.slice(indexOfFirstNovel, indexOfLastNovel)

  const handlePageChange = (pageNumber: number) => {
    setCurrentPage(pageNumber)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleCategoryChange = (category: string) => {
    setCategoryFilter(category)
    setCurrentPage(1)
    router.push(`/library?category=${encodeURIComponent(category)}`)
  }

  const handleSearch = useCallback((novel: Novel) => {
    router.push(`/novel/${novel.slug}`)
    setSearchTerm('')
    setSearchResults([])
  }, [router])

  if (isLoading) return (
    <div className="flex justify-center items-center min-h-[60vh]">
      <div className="text-lg">جاري التحميل...</div>
    </div>
  )
  
  if (error) return (
    <div className="flex justify-center items-center min-h-[60vh]">
      <div className="text-lg text-red-500">حدث خطأ: {error}</div>
    </div>
  )

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">مكتبة الروايات</h1>
      <Card className="mb-8">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row justify-between gap-4">
            <div className="relative md:w-1/3 order-2 md:order-1">
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
                      key={novel._id} 
                      className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer"
                      onClick={() => handleSearch(novel)}
                    >
                      {novel.title}
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className="flex flex-col md:flex-row gap-4 md:w-2/3 order-1 md:order-2">
              <Select value={categoryFilter} onValueChange={handleCategoryChange}>
                <SelectTrigger className="w-full md:w-[200px]">
                  <SelectValue placeholder="التصنيف" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category} value={category}>{category}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={statusFilter} onValueChange={(value) => { setStatusFilter(value); setCurrentPage(1); }}>
                <SelectTrigger className="w-full md:w-[200px]">
                  <SelectValue placeholder="الحالة" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="الكل">الكل</SelectItem>
                  <SelectItem value="مكتملة">مكتملة</SelectItem>
                  <SelectItem value="جارية">جارية</SelectItem>
                </SelectContent>
              </Select>
              <Select value={sortBy} onValueChange={(value) => { setSortBy(value); setCurrentPage(1); }}>
                <SelectTrigger className="w-full md:w-[200px]">
                  <SelectValue placeholder="الترتيب" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="الأكثر فصولاً">الأكثر فصولاً</SelectItem>
                  <SelectItem value="الأقل فصولاً">الأقل فصولاً</SelectItem>
                  <SelectItem value="الأكثر مشاهدة">الأكثر مشاهدة</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {currentNovels.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          لم يتم العثور على روايات تطابق معايير البحث
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
          {currentNovels.map((novel) => (
            <NovelCard key={novel._id} novel={novel} />
          ))}
        </div>
      )}

      {pageCount > 1 && (
        <div className="mt-8">
          <Pagination>
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
              {Array.from({ length: pageCount }, (_, i) => i + 1).map((page) => (
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
                  onClick={() => handlePageChange(Math.min(pageCount, currentPage + 1))}
                  className={currentPage === pageCount ? 'pointer-events-none opacity-50' : ''}
                >
                  التالي
                  <ChevronLeft className="h-4 w-4 mr-2" />
                </PaginationNext>
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}
    </div>
  )
}
