


'use client'

import { useEffect, useState } from 'react'
import NovelCard from '@/components/novel/novel-card'
import { Novel } from '@/types'
import useAppStore from '@/store'

export default function FavoritesPage() {
  const { favorites, novels } = useAppStore()
  const [favoriteNovels, setFavoriteNovels] = useState<Novel[]>([])

  useEffect(() => {
    const favNovels = novels.filter(novel => favorites.includes(novel._id))
    setFavoriteNovels(favNovels)
  }, [favorites, novels])

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">الروايات المفضلة</h1>
      {favoriteNovels.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
          {favoriteNovels.map((novel) => (
            <NovelCard key={novel._id} novel={novel} />
          ))}
        </div>
      ) : (
        <p className="text-center text-gray-500">لم تقم بإضافة أي روايات إلى المفضلة بعد.</p>
      )}
    </div>
  )
}


