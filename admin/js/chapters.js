

document.addEventListener('DOMContentLoaded', function() {
    const addChaptersForm = document.getElementById('addChaptersForm');
    const chapterList = document.getElementById('chapterList');
    const novelSelect = document.getElementById('novelSelect');
    const publishOptionRadios = document.getElementsByName('publishOption');
    const scheduleOptions = document.getElementById('scheduleOptions');
    const scheduleTypeRadios = document.getElementsByName('scheduleType');
    const singleBatchOptions = document.getElementById('singleBatchOptions');
    const multipleBatchOptions = document.getElementById('multipleBatchOptions');

    // Load novels and chapters
    loadNovels();
    loadChapters();

    // Toggle schedule options visibility
    publishOptionRadios.forEach(radio => {
        radio.addEventListener('change', function() {
            scheduleOptions.style.display = this.value === 'schedule' ? 'block' : 'none';
        });
    });

    // Toggle batch options visibility
    scheduleTypeRadios.forEach(radio => {
        radio.addEventListener('change', function() {
            singleBatchOptions.style.display = this.value === 'single' ? 'block' : 'none';
            multipleBatchOptions.style.display = this.value === 'multiple' ? 'block' : 'none';
        });
    });

    // Add chapters
    addChaptersForm.addEventListener('submit', function(e) {
        e.preventDefault();
        const formData = new FormData(addChaptersForm);
        const publishOption = formData.get('publishOption');
        const scheduleType = formData.get('scheduleType');

        if (publishOption === 'now') {
            addChaptersNow(formData);
        } else if (publishOption === 'schedule') {
            if (scheduleType === 'single') {
                scheduleSingleBatch(formData);
            } else if (scheduleType === 'multiple') {
                scheduleMultipleBatches(formData);
            }
        }
    });

    function loadNovels() {
        fetch('/api/novels')
            .then(response => response.json())
            .then(novels => {
                novelSelect.innerHTML = '<option value="">اختر رواية</option>';
                novels.forEach(novel => {
                    const option = document.createElement('option');
                    option.value = novel._id;
                    option.textContent = novel.title;
                    novelSelect.appendChild(option);
                });
            });
    }

    function loadChapters() {
        const novelId = novelSelect.value;
        if (!novelId) return;

        fetch(`/api/chapters/${novelId}`)
            .then(response => response.json())
            .then(chapters => {
                chapterList.innerHTML = '';
                chapters.forEach(chapter => {
                    const li = createChapterListItem(chapter);
                    chapterList.appendChild(li);
                });
            });
    }

    function createChapterListItem(chapter) {
        const li = document.createElement('div');
        li.className = 'bg-white shadow-md rounded-lg p-4 flex justify-between items-center';
        li.innerHTML = `
            <div>
                <h3 class="text-lg font-semibold">${chapter.title}</h3>
                <p class="text-sm text-gray-500">تاريخ الإضافة: ${new Date(chapter.uploadDate).toLocaleString()}</p>
                <p class="text-sm text-gray-500">تاريخ النشر: ${chapter.publishDate ? new Date(chapter.publishDate).toLocaleString() : 'غير محدد'}</p>
                <p class="text-sm ${chapter.isPublished ? 'text-green-500' : 'text-yellow-500'}">
                    ${chapter.isPublished ? 'منشور' : 'قيد الانتظار'}
                </p>
            </div>
            <div>
                ${!chapter.isPublished ? `
                    <button onclick="rescheduleChapter('${chapter._id}')" class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-1 px-2 rounded mr-2">
                        إعادة جدولة
                    </button>
                ` : ''}
                <button onclick="deleteChapter('${chapter._id}')" class="bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-2 rounded">
                    حذف
                </button>
            </div>
        `;
        return li;
    }

    function addChaptersNow(formData) {
        const novelId = formData.get('novelId');
        fetch(`/api/chapters/${novelId}`, {
            method: 'POST',
            body: formData,
        })
        .then(response => response.json())
        .then(newChapters => {
            newChapters.forEach(chapter => {
                const li = createChapterListItem(chapter);
                chapterList.prepend(li);
            });
            addChaptersForm.reset();
        });
    }

    function scheduleSingleBatch(formData) {
        const novelId = formData.get('novelId');
        const days = parseInt(document.getElementById('scheduleDays').value) || 0;
        const hours = parseInt(document.getElementById('scheduleHours').value) || 0;
        const minutes = parseInt(document.getElementById('scheduleMinutes').value) || 0;

        const publishDate = new Date();
        publishDate.setDate(publishDate.getDate() + days);
        publishDate.setHours(publishDate.getHours() + hours);
        publishDate.setMinutes(publishDate.getMinutes() + minutes);

        formData.append('publishDate', publishDate.toISOString());

        fetch(`/api/chapters/${novelId}/schedule`, {
            method: 'POST',
            body: formData,
        })
        .then(response => response.json())
        .then(newChapters => {
            newChapters.forEach(chapter => {
                const li = createChapterListItem(chapter);
                chapterList.prepend(li);
            });
            addChaptersForm.reset();
        });
    }

    function scheduleMultipleBatches(formData) {
        const novelId = formData.get('novelId');
        const batchCount = parseInt(document.getElementById('batchCount').value);
        const chaptersPerBatch = parseInt(document.getElementById('chaptersPerBatch').value);
        const batchInterval = parseInt(document.getElementById('batchInterval').value);

        formData.append('batchCount', batchCount);
        formData.append('chaptersPerBatch', chaptersPerBatch);
        formData.append('batchInterval', batchInterval);

        fetch(`/api/chapters/${novelId}/schedule-multiple`, {
            method: 'POST',
            body: formData,
        })
        .then(response => response.json())
        .then(newChapters => {
            newChapters.forEach(chapter => {
                const li = createChapterListItem(chapter);
                chapterList.prepend(li);
            });
            addChaptersForm.reset();
        });
    }

    window.deleteChapter = function(id) {
        if (confirm('هل أنت متأكد من حذف هذا الفصل؟')) {
            fetch(`/api/chapters/${id}`, {
                method: 'DELETE',
            })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Failed to delete chapter');
                }
                return response.json();
            })
            .then(() => {
                loadChapters();
                console.log('Chapter deleted successfully');
            })
            .catch(error => {
                console.error('Error deleting chapter:', error);
                alert('حدث خطأ أثناء حذف الفصل. يرجى المحاولة مرة أخرى.');
            });
        }
    }

    window.rescheduleChapter = function(id) {
        const newPublishDate = prompt('أدخل تاريخ النشر الجديد (YYYY-MM-DD HH:MM):');
        if (newPublishDate) {
            fetch(`/api/chapters/${id}/reschedule`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ newPublishDate }),
            })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Failed to reschedule chapter');
                }
                return response.json();
            })
            .then(() => {
                loadChapters();
                console.log('Chapter rescheduled successfully');
            })
            .catch(error => {
                console.error('Error rescheduling chapter:', error);
                alert('حدث خطأ أثناء إعادة جدولة الفصل. يرجى المحاولة مرة أخرى.');
            });
        }
    }

    novelSelect.addEventListener('change', loadChapters);
});






