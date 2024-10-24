
'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { ChevronLeft, ChevronRight, Settings, AlertTriangle, ChevronDown, List, Facebook, Send, Calendar, Book, Eye, AlignLeft, AlignCenter, AlignRight } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { Dialog, DialogContent, DialogTrigger, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Novel, Chapter } from '@/types'
import { Textarea } from '@/components/ui/textarea'
import { useTheme } from 'next-themes'
import useAppStore from '@/store'

interface ChapterReaderProps {
  novel: Novel
  chapter: Chapter
  allChapters: Chapter[]
}

const backgroundColors = [
  { name: 'كريمي', value: '#FFF9E5' },
  { name: 'رمادي فاتح', value: '#F0F0F0' },
  { name: 'أزرق فاتح', value: '#E6F3FF' },
  { name: 'أخضر فاتح', value: '#E8F5E9' },
  { name: 'أسود', value: '#000000' },
  { name: 'رمادي داكن', value: '#333333' },
]

const textColors = [
  { name: 'أسود', value: '#000000' },
  { name: 'رمادي داكن', value: '#333333' },
  { name: 'بني داكن', value: '#3E2723' },
  { name: 'أزرق داكن', value: '#1A237E' },
  { name: 'أبيض', value: '#FFFFFF' },
  { name: 'رمادي فاتح', value: '#CCCCCC' },
]

export default function ChapterReader({ novel, chapter: initialChapter, allChapters }: ChapterReaderProps) {
  const { theme } = useTheme()
  const { user } = useAppStore()
  const [chapter, setChapter] = useState(initialChapter)
  const [fontSize, setFontSize] = useState(18)
  const [lineHeight, setLineHeight] = useState(1.6)
  const [fontFamily, setFontFamily] = useState('Arial')
  const [backgroundColor, setBackgroundColor] = useState(backgroundColors[0].value)
  const [textColor, setTextColor] = useState(textColors[0].value)
  const [textAlign, setTextAlign] = useState<'right' | 'left' | 'center'>('right')
  const [isSupportOpen, setIsSupportOpen] = useState(false)
  const [isReportOpen, setIsReportOpen] = useState(false)
  const [isChapterListOpen, setIsChapterListOpen] = useState(false)
  const [reportContent, setReportContent] = useState('')
  const [isThankYouDialogOpen, setIsThankYouDialogOpen] = useState(false)

  useEffect(() => {
    const preventCopy = (e: Event) => {
      e.preventDefault()
      alert('عذراً، لا يمكن نسخ محتوى هذا الفصل.')
    }

    document.addEventListener('copy', preventCopy)
    document.addEventListener('cut', preventCopy)
    document.addEventListener('contextmenu', preventCopy)

    return () => {
      document.removeEventListener('copy', preventCopy)
      document.removeEventListener('cut', preventCopy)
      document.removeEventListener('contextmenu', preventCopy)
    }
  }, [])

  useEffect(() => {
    // زيادة عدد المشاهدات عند تحميل الفصل
    const incrementViews = async () => {
      try {
        const response = await fetch(`/api/chapters/${novel._id}/${chapter.number}/increment-views`, {
          method: 'POST',
        });
        if (response.ok) {
          const updatedChapter = await response.json();
          setChapter(updatedChapter);
        }
      } catch (error) {
        console.error('Error incrementing views:', error);
      }
    };
    incrementViews();
  }, [novel._id, chapter.number]);

  const handleReport = async () => {
    if (!user) {
      alert('الرجاء تسجيل الدخول للإبلاغ عن مشكلة');
      return;
    }

    if (!reportContent.trim()) {
      alert('الرجاء كتابة تفاصيل المشكلة قبل الإرسال.');
      return;
    }

    try {
      const response = await fetch(`/api/reports`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user.id,
          novelId: novel._id,
          chapterId: chapter._id,
          message: reportContent
        }),
      });

      if (response.ok) {
        setIsThankYouDialogOpen(true);
        setReportContent('');
        setIsReportOpen(false);
      } else {
        throw new Error('فشل في إرسال البلاغ');
      }
    } catch (error) {
      console.error('Error sending report:', error);
      alert('حدث خطأ أثناء إرسال البلاغ. الرجاء المحاولة مرة أخرى.');
    }
  }

  const formatViews = (views: number) => {
    if (views >= 1000000) {
      return (views / 1000000).toFixed(1) + 'M'
    } else if (views >= 1000) {
      return (views / 1000).toFixed(1) + 'K'
    }
    return views.toString()
  }

  const iconColor = theme === 'dark' ? 'text-yellow-400' : 'text-yellow-600'
  const chapterTitleColor = theme === 'dark' ? 'text-gray-200' : 'text-gray-800'
  const chapterNumberColor = theme === 'dark' ? 'text-yellow-400' : 'text-yellow-600'
  const actionTextColor = theme === 'dark' ? 'text-yellow-400' : 'text-orange-500'
  const navigationButtonClass = theme === 'dark' 
    ? 'bg-gray-800 text-white hover:bg-gray-700' 
    : 'bg-orange-100 text-orange-800 hover:bg-orange-200'

  return (
    <div className="container mx-auto px-0 md:px-4 py-4 md:py-8">
      <div className="max-w-4xl mx-auto rounded-lg shadow-lg overflow-hidden">
        <div className="theme-card p-4 md:p-6 border-b theme-border">
          <div className="flex justify-between items-start md:items-center mb-4">
            <div className="flex-grow">
              <h1 className="text-xl md:text-2xl font-semibold mb-2 md:mb-0 flex items-center">
                <span className={`${chapterTitleColor}`}>الفصل:</span>{' '}
                <span className={`${chapterNumberColor} mr-2`}>{chapter.number}</span>
              </h1>
              <div className="flex items-center text-xs md:text-sm text-muted-foreground mt-2">
                <span className="flex items-center mr-4">
                  <Book className={`w-3 h-3 md:w-4 md:h-4 ml-1 ${iconColor}`} />
                  <span className={chapterTitleColor}>{chapter.wordCount} كلمة</span>
                </span>
                <span className="flex items-center mr-4">
                  <Eye className={`w-3 h-3 md:w-4 md:h-4 ml-1 ${iconColor}`} />
                  <span className={chapterTitleColor}>{formatViews(chapter.views)}</span>
                </span>
                <span className="flex items-center">
                  <Calendar className={`w-3 h-3 md:w-4 md:h-4 ml-1 ${iconColor}`} />
                  <span className={chapterTitleColor}>{new Date(chapter.createdAt).toLocaleDateString('ar-EG')}</span>
                </span>
              </div>
            </div>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" size="icon" className={`theme-icon border-primary hover:bg-primary/10 ${iconColor}`}>
                  <Settings className="h-4 w-4" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-72 md:w-80 p-4 md:p-6">
                <h4 className="font-medium text-lg mb-4">تخصيص القراءة</h4>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="fontFamily">الخط</Label>
                    <Select value={fontFamily} onValueChange={setFontFamily}>
                      <SelectTrigger>
                      <SelectValue placeholder="اختر الخط" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Arial">Arial</SelectItem>
                        <SelectItem value="Verdana">Verdana</SelectItem>
                        <SelectItem value="Times New Roman">Times New Roman</SelectItem>
                        <SelectItem value="Courier New">Courier New</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="fontSize">حجم الخط: {fontSize}px</Label>
                    <input
                      type="range"
                      id="fontSize"
                      min="12"
                      max="24"
                      step="1"
                      value={fontSize}
                      onChange={(e) => setFontSize(Number(e.target.value))}
                      className="w-full"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lineHeight">المسافة بين الأسطر: {lineHeight}</Label>
                    <input
                      type="range"
                      id="lineHeight"
                      min="1"
                      max="2"
                      step="0.1"
                      value={lineHeight}
                      onChange={(e) => setLineHeight(Number(e.target.value))}
                      className="w-full"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>لون الخلفية</Label>
                    <div className="grid grid-cols-3 gap-2">
                      {backgroundColors.map((color) => (
                        <button
                          key={color.value}
                          className={`w-8 h-8 rounded-full border-2 ${backgroundColor === color.value ? 'border-primary' : 'border-gray-300'}`}
                          style={{ backgroundColor: color.value }}
                          onClick={() => setBackgroundColor(color.value)}
                          title={color.name}
                        />
                      ))}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>لون النص</Label>
                    <div className="grid grid-cols-3 gap-2">
                      {textColors.map((color) => (
                        <button
                          key={color.value}
                          className={`w-8 h-8 rounded-full border-2 ${textColor === color.value ? 'border-primary' : 'border-gray-300'}`}
                          style={{ backgroundColor: color.value }}
                          onClick={() => setTextColor(color.value)}
                          title={color.name}
                        />
                      ))}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>اتجاه النص</Label>
                    <div className="flex justify-between">
                      <Button variant="outline" onClick={() => setTextAlign('right')} className={textAlign === 'right' ? 'bg-primary text-primary-foreground' : ''}>
                        <AlignRight className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" onClick={() => setTextAlign('center')} className={textAlign === 'center' ? 'bg-primary text-primary-foreground' : ''}>
                        <AlignCenter className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" onClick={() => setTextAlign('left')} className={textAlign === 'left' ? 'bg-primary text-primary-foreground' : ''}>
                        <AlignLeft className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </PopoverContent>
            </Popover>
          </div>
        </div>
        <div 
          className="p-4 md:p-6 chapter-content-card"
          style={{ 
            fontFamily, 
            fontSize: `${fontSize}px`, 
            lineHeight: lineHeight,
            color: textColor,
            backgroundColor: backgroundColor,
            textAlign: textAlign,
            whiteSpace: 'pre-wrap',
            userSelect: 'none',
            WebkitUserSelect: 'none',
            MozUserSelect: 'none',
            msUserSelect: 'none',
          }}
        >
          {chapter.content}
        </div>
      </div>

      <div className="flex flex-col md:flex-row justify-between items-center max-w-4xl mx-auto mt-4 md:mt-8 space-y-2 md:space-y-0 md:space-x-4 md:space-x-reverse">
        <Link href={`/novel/${novel.slug}/chapter/${Math.max(1, chapter.number - 1)}`} className="w-full md:w-auto">
          <Button variant="outline" className={`${navigationButtonClass} w-full`} disabled={chapter.number === 1}>
            <ChevronRight className="ml-2 h-4 w-4" /> الفصل السابق
          </Button>
        </Link>
        
        <Dialog open={isChapterListOpen} onOpenChange={setIsChapterListOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" className={`${navigationButtonClass} w-full md:w-auto`}>
              الفصل {chapter.number}
              <List className="mr-2 h-4 w-4" />
            </Button>
          </DialogTrigger>
          <DialogContent className="theme-card w-11/12 max-w-lg">
            <div className="h-[60vh] w-full rounded-md border p-4 overflow-y-auto">
              {allChapters && allChapters.length > 0 ? (
                allChapters.map((chap) => (
                  <Link href={`/novel/${novel.slug}/chapter/${chap.number}`} key={chap.number}>
                    <div className="py-2 theme-hover cursor-pointer text-right transition-colors">
                      <span className="theme-icon font-bold ml-2">الفصل {chap.number}</span>
                      {chap.title}
                    </div>
                  </Link>
                ))
              ) : (
                <div>لا توجد فصول متاحة حاليًا.</div>
              )}
            </div>
          </DialogContent>
        </Dialog>

        <Link href={`/novel/${novel.slug}/chapter/${Math.min(allChapters.length, chapter.number + 1)}`} className="w-full md:w-auto">
          <Button variant="outline" className={`${navigationButtonClass} w-full`} disabled={chapter.number === allChapters.length}>
            الفصل التالي <ChevronLeft className="mr-2 h-4 w-4" />
          </Button>
        </Link>
      </div>

      <div className="max-w-4xl mx-auto mt-8 space-y-4">
        <Collapsible
          open={isSupportOpen}
          onOpenChange={setIsSupportOpen}
          className="theme-card rounded-lg shadow-lg overflow-hidden"
        >
          <CollapsibleTrigger asChild>
            <Button
              variant="ghost"
              className={`flex w-full justify-between p-4 theme-icon theme-hover ${actionTextColor}`}
            >
              دعم الرواية
              <ChevronDown className={`h-4 w-4 transition-transform ${isSupportOpen ? "transform rotate-180" : ""}`} />
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent className="p-6 theme-status">
            <p className="mb-4 text-foreground text-lg">إذا أعجبتك هذه الرواية، يمكنك دعمها للمساعدة في استمرار ترجمتها ونشرها!</p>
            <div className="flex space-x-4 justify-center">
              <Link href="https://t.me/your_telegram_channel" target="_blank" rel="noopener noreferrer">
                <Button variant="outline" className="theme-button">
                  <Send className="w-5 h-5 mr-2" />
                  تيليجرام
                </Button>
              </Link>
              <Link href="https://www.facebook.com/your_facebook_page" target="_blank" rel="noopener noreferrer">
                <Button variant="outline" className="theme-button">
                  <Facebook className="w-5 h-5 mr-2" />
                  فيسبوك
                </Button>
              </Link>
            </div>
          </CollapsibleContent>
        </Collapsible>

        <Collapsible
          open={isReportOpen}
          onOpenChange={setIsReportOpen}
          className="theme-card rounded-lg shadow-lg overflow-hidden"
        >
          <CollapsibleTrigger asChild>
            <Button
              variant="ghost"
              className={`flex w-full justify-between p-4 theme-icon theme-hover ${actionTextColor}`}
            >
              الإبلاغ عن مشكلة
              <AlertTriangle className={`h-4 w-4 ${actionTextColor}`} />
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent className="p-6 theme-status">
            <Textarea 
              placeholder="اكتب تفاصيل المشكلة هنا..." 
              className="w-full mb-4 bg-background" 
              value={reportContent}
              onChange={(e) => setReportContent(e.target.value)}
            />
            <Button className="theme-button" onClick={handleReport}>
              إرسال البلاغ
            </Button>
          </CollapsibleContent>
        </Collapsible>
      </div>

      <Dialog open={isThankYouDialogOpen} onOpenChange={setIsThankYouDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-center text-2xl font-bold">شكراً لك!</DialogTitle>
          </DialogHeader>
          <div className="text-center p-6">
            <p className="mb-4">نشكرك على إبلاغنا. سنقوم بمراجعة بلاغك في أقرب وقت ممكن.</p>
            <Button onClick={() => setIsThankYouDialogOpen(false)}>حسناً</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
