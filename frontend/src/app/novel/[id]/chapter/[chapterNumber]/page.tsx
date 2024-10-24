


import { Suspense } from 'react'
import { notFound } from 'next/navigation'
import dynamic from 'next/dynamic'
import { getNovelBySlug, getChaptersByNovelId, getChapterById } from '@/lib/api'

const ChapterReader = dynamic(() => import('@/components/novel/chapter-reader'), { 
  ssr: false,
  loading: () => <p>جاري تحميل الفصل...</p>
})

interface ChapterPageProps {
  params: {
    id: string
    chapterNumber: string
  }
}

export default async function ChapterPage({ params }: ChapterPageProps) {
  if (!params.id || !params.chapterNumber) {
    notFound();
  }

  try {
    const novel = await getNovelBySlug(params.id);
    if (!novel) {
      notFound();
    }
    const allChapters = await getChaptersByNovelId(novel._id);
    const chapter = await getChapterById(novel._id, parseInt(params.chapterNumber));
    
    if (!chapter || !allChapters) {
      notFound();
    }

    return (
      <Suspense fallback={<p>جاري تحميل الفصل...</p>}>
        <ChapterReader novel={novel} chapter={chapter} allChapters={allChapters} />
      </Suspense>
    );
  } catch (error) {
    console.error('Error fetching chapter:', error);
    notFound();
  }
}


