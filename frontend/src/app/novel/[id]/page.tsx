

import { cookies } from 'next/headers';
import { notFound } from 'next/navigation';
import NovelDetails from '@/components/novel/novel-details';
import { getNovelBySlug, getChaptersByNovelId } from '@/lib/api';
import { getImageUrl } from '@/lib/utils';

interface NovelPageProps {
  params: {
    id: string
  }
}

export default async function NovelPage({ params }: NovelPageProps) {
  if (!params.id) {
    notFound();
  }

  const token = cookies().get('token')?.value;

  try {
    const novel = await getNovelBySlug(params.id, token);
    
    if (!novel) {
      notFound();
    }

    const chapters = await getChaptersByNovelId(novel._id, token);

    const novelWithFullImageUrl = {
      ...novel,
      cover: getImageUrl(novel.cover)
    };

    return <NovelDetails novel={novelWithFullImageUrl} chapters={chapters} />;
  } catch (error) {
    console.error('Error fetching novel details:', error);
    notFound();
  }
}

