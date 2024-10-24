
'use client'

import { useEffect } from 'react'
import NovelList from '@/components/novel/novel-list'
import useAppStore from '@/store'

export default function HomePage() {
  const { novels, fetchNovels } = useAppStore()

  useEffect(() => {
    fetchNovels();
  }, [fetchNovels]);
  
  console.log('All novels:', novels);
  
  const mostViewedLastMonth = novels.filter(novel => novel.section === 'most-viewed-month').slice(0, 6);
  const mostViewedLast24Hours = novels.filter(novel => novel.section === 'most-viewed-24h').slice(0, 6);
  const randomNovels = novels.filter(novel => novel.section === 'random').slice(0, 6);
  const latestNovels = novels.filter(novel => novel.section === 'latest').slice(0, 6);
  const completedNovels = novels.filter(novel => novel.section === 'completed').slice(0, 6);
  
  console.log('Filtered novels:', { mostViewedLastMonth, mostViewedLast24Hours, randomNovels, latestNovels, completedNovels });

  return (
    <>
      <NovelList 
        key="most-viewed-month"
        novels={mostViewedLastMonth} 
        title="الأكثر مشاهدة خلال 30 يوم" 
        iconName="TrendingUp"
        sectionId="most-viewed-month"
      />
      <NovelList 
        key="most-viewed-24h"
        novels={mostViewedLast24Hours} 
        title="الأكثر مشاهدة خلال 24 ساعة" 
        iconName="Clock"
        sectionId="most-viewed-24h"
      />
      <NovelList 
        key="random"
        novels={randomNovels} 
        title="ترتيب عشوائي" 
        iconName="Shuffle"
        sectionId="random"
      />
      <NovelList 
        key="latest"
        novels={latestNovels} 
        title="أحدث الروايات" 
        iconName="Sparkles"
        sectionId="latest"
      />
      <NovelList 
        key="completed"
        novels={completedNovels} 
        title="الروايات المكتملة" 
        iconName="CheckCircle"
        sectionId="completed"
      />
    </>
  )
}


