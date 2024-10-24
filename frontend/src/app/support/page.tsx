












'use client'

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion"

export default function SupportPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">مركز الدعم</h1>
      <Card>
        <CardHeader>
          <CardTitle>الأسئلة الشائعة</CardTitle>
        </CardHeader>
        <CardContent>
          <Accordion type="single" collapsible>
            <AccordionItem value="item-1">
              <AccordionTrigger>كيف يمكنني إنشاء حساب؟</AccordionTrigger>
              <AccordionContent>
                يمكنك إنشاء حساب عن طريق النقر على زر "تسجيل الدخول" في أعلى الصفحة، ثم اختيار "إنشاء حساب جديد". قم بملء المعلومات المطلوبة واتبع الخطوات لإكمال عملية التسجيل.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-2">
              <AccordionTrigger>كيف يمكنني دعم الكتاب؟</AccordionTrigger>
              <AccordionContent>
                يمكنك دعم الكتاب من خلال النقر على زر "دعم الكاتب" الموجود في صفحة تفاصيل الرواية. يمكنك اختيار المبلغ الذي ترغب في التبرع به لدعم الكاتب ومساعدته على الاستمرار في الكتابة.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-3">
              <AccordionTrigger>كيف يمكنني البحث عن روايات معينة؟</AccordionTrigger>
              <AccordionContent>
                يمكنك استخدام شريط البحث الموجود في أعلى الصفحة للبحث عن الروايات حسب العنوان أو اسم الكاتب. كما يمكنك استخدام صفحة المكتبة لتصفية الروايات حسب التصنيف أو الحالة.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </CardContent>
      </Card>
    </div>
  )
}












