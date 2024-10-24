


import { useState, useEffect } from 'react'
import { Novel } from '@/types'
import { fetchNovels } from '@/lib/api' 

export function useNovels() {
  const [novels, setNovels] = useState<Novel[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function loadNovels() {
      try {
        setIsLoading(true)
        const data = await fetchNovels()
        setNovels(data)
        setIsLoading(false)
      } catch (err) {
        setError('Failed to fetch novels')
        setIsLoading(false)
      }
    }
    loadNovels()
  }, [])

  return {
    novels,
    isLoading,
    error,
  }
}


