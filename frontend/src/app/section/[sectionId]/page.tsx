

import { notFound } from 'next/navigation'
import NovelCard from '@/components/novel/novel-card'
import { TrendingUp, Clock, Shuffle, CheckCircle, Sparkles } from 'lucide-react'
import { Novel } from '@/types'
import { fetchNovels } from '@/lib/api'  // تغيير هذا السطر

interface SectionConfig {
  title: string
  icon: React.ElementType
  getNovelsList: (novels: Novel[]) => Novel[]
}

const sectionConfigs: Record<string, SectionConfig> = {
  'most-viewed-month': {
    title: "الأكثر مشاهدة خلال 30 يوم",
    icon: TrendingUp,
    getNovelsList: (novels) => novels.filter(novel => novel.section === 'most-viewed-month').sort((a, b) => b.views - a.views).slice(0, 12)
  },
  'most-viewed-24h': {
    title: "الأكثر مشاهدة خلال 24 ساعة",
    icon: Clock,
    getNovelsList: (novels) => novels.filter(novel => novel.section === 'most-viewed-24h').sort((a, b) => b.views - a.views).slice(0, 12)
  },
  'random': {
    title: "ترتيب عشوائي",
    icon: Shuffle,
    getNovelsList: (novels) => novels.filter(novel => novel.section === 'random').sort(() => 0.5 - Math.random()).slice(0, 12)
  },
  'latest': {
    title: "أحدث الروايات",
    icon: Sparkles,
    getNovelsList: (novels) => novels.filter(novel => novel.section === 'latest').sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 12)
  },
  'completed': {
    title: "الروايات المكتملة",
    icon: CheckCircle,
    getNovelsList: (novels) => novels.filter(novel => novel.section === 'completed' && novel.completionStatus === 'مكتملة').slice(0, 12)
  }
}

interface SectionPageProps {
  params: {
    sectionId: string
  }
}

export default async function SectionPage({ params }: SectionPageProps) {
  const sectionConfig = sectionConfigs[params.sectionId]

  if (!sectionConfig) {
    notFound()
  }

  const { title, icon: Icon, getNovelsList } = sectionConfig
  const novels: Novel[] = await fetchNovels()
  const sectionNovels = getNovelsList(novels)

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6 flex items-center">
        <Icon className="w-8 h-8 ml-2 text-primary" />
        {title}
      </h1>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 md:gap-6">
        {sectionNovels.map((novel) => (
          <NovelCard key={novel._id} novel={novel} />
        ))}
      </div>
    </div>
  )
}

