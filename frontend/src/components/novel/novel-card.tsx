


'use client'

import React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { Book, Heart } from 'lucide-react'
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Novel } from '@/types'
import { getImageUrl } from '@/lib/utils'
import useAppStore from '@/store'

interface NovelCardProps {
  novel: Novel
}

export default function NovelCard({ novel }: NovelCardProps) {
  const router = useRouter()
  const { addFavorite, removeFavorite, isFavorite } = useAppStore()
  const [isFav, setIsFav] = React.useState(false)

  const novelId = novel._id || novel.id

  React.useEffect(() => {
    if (novelId) {
      const favStatus = isFavorite(novelId)
      setIsFav(favStatus)
    }
  }, [novelId, isFavorite])

  const handleCategoryClick = (category: string, e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    router.push(`/library?category=${encodeURIComponent(category)}`)
  }

  const handleToggleFavorite = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (novelId) {
      if (isFav) {
        removeFavorite(novelId)
      } else {
        addFavorite(novelId)
      }
      setIsFav(!isFav)
    }
  }

  if (!novelId) {
    return null 
  }

  return (
    <Link href={`/novel/${encodeURIComponent(novel.slug)}`}>
      <div className="bg-card text-card-foreground rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300">
        <div className="relative w-full" style={{ paddingTop: '150%' }}>
          <Image 
            src={getImageUrl(novel.cover)}
            alt={novel.title} 
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="object-cover"
          />
          <div className="absolute top-1 md:top-2 right-1 md:right-2 bg-blue-500 text-white px-1 md:px-2 py-0.5 md:py-1 text-[6px] md:text-xs font-semibold rounded">
            مترجمة
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-1 md:top-2 left-1 md:left-2 bg-background/50 hover:bg-background/80 p-0.5 md:p-1 w-6 h-6 md:w-8 md:h-8"
            onClick={handleToggleFavorite}
          >
            <Heart className={`h-3 w-3 md:h-4 md:w-4 ${isFav ? 'fill-primary text-primary' : 'text-foreground'}`} />
          </Button>
        </div>
        <div className="p-2 md:p-4">
          <h3 className="font-semibold text-[8px] md:text-sm mb-1 md:mb-2 line-clamp-1">{novel.title}</h3>
          <div className="flex flex-wrap gap-0.5 md:gap-1 mb-1 md:mb-2 h-6 md:h-12 overflow-hidden">
            {novel.categories.map((category, index) => (
              <Badge 
                key={index} 
                variant="secondary"
                className="bg-orange-100 text-orange-800 hover:bg-orange-200 dark:bg-yellow-900/30 dark:text-yellow-200 dark:hover:bg-yellow-900/50 cursor-pointer text-[4px] md:text-xs px-1 md:px-2 py-0.5 rounded-full whitespace-nowrap"
                onClick={(e) => handleCategoryClick(category, e)}
              >
                {category}
              </Badge>
            ))}
          </div>
          <div className="flex items-center justify-between text-[6px] md:text-sm text-muted-foreground">
          <span className="flex items-center">
            <Book className="w-1.5 h-1.5 md:w-4 md:h-4 mr-0.5 md:mr-1" />
            {novel.publishedChapters} فصل
          </span>
            <Badge 
              variant="outline" 
              className={`text-[4px] md:text-xs ${novel.completionStatus === 'مكتملة' 
                ? 'bg-green-100 text-green-800 border-green-300 dark:bg-green-900/30 dark:text-green-200 dark:border-green-700' 
                : 'bg-yellow-100 text-yellow-800 border-yellow-300 dark:bg-yellow-900/30 dark:text-yellow-200 dark:border-yellow-700'
              }`}
            >
              {novel.completionStatus}
            </Badge>
          </div>
        </div>
      </div>
    </Link>
  )
}









