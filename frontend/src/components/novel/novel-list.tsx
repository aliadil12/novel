


'use client'

import React, { useRef } from 'react'
import Link from 'next/link'
import NovelCard from './novel-card'
import { ChevronLeft, TrendingUp, Clock, Shuffle, Sparkles, CheckCircle } from 'lucide-react'
import { Novel } from '@/types'

interface NovelListProps {
  novels: Novel[]
  title: string
  iconName: string
  sectionId: string
}

const iconMap = {
  TrendingUp,
  Clock,
  Shuffle,
  Sparkles,
  CheckCircle,
}

const NovelList: React.FC<NovelListProps> = React.memo(({ novels, title, iconName, sectionId }) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null)

  const Icon = iconMap[iconName as keyof typeof iconMap]

  return (
    <section className="mb-12 px-4 md:px-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl md:text-3xl font-bold flex items-center text-foreground">
          {Icon && <Icon className="w-5 h-5 md:w-8 md:h-8 ml-2 text-primary" />}
          {title}
        </h2>
      </div>
      <div className="relative -mx-4 md:-mx-6">
        <div 
          ref={scrollContainerRef}
          className="flex overflow-x-auto snap-x snap-mandatory scrollbar-hide px-4 md:px-6"
          style={{ scrollPaddingLeft: '16px', scrollPaddingRight: '16px' }}
        >
          {novels.slice(0, 6).map((novel, index) => (
            <div 
              key={novel._id} 
              className="w-[calc(33.333%-8px)] md:w-[calc(16.666%-10px)] flex-shrink-0 snap-start mr-4 first:ml-0 relative"
              style={{ scrollSnapAlign: 'start' }}
            >
              <NovelCard novel={novel} />
              {index === 5 && (
                <div className="absolute left-0 top-0 bottom-0 w-1/4 bg-gradient-to-r from-background to-transparent pointer-events-none"></div>
              )}
              {index === 5 && (
                <Link href={`/section/${sectionId}`}
                      className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1/2 w-10 h-10 md:w-12 md:h-12 rounded-full bg-primary flex items-center justify-center text-primary-foreground shadow-lg transition-transform hover:scale-110 z-10">
                  <ChevronLeft className="w-6 h-6 md:w-8 md:h-8 transition-transform group-hover:-translate-x-1" />
                </Link>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
})

NovelList.displayName = 'NovelList'

export default NovelList







