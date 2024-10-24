

document.addEventListener('DOMContentLoaded', function() {
    const addNovelForm = document.getElementById('addNovelForm');
    const novelList = document.getElementById('novelList');
    const API_URL = 'http://localhost:5000/api';

    // Initialize Select2 for categories
    $('#categories').select2({
        placeholder: 'اختر التصنيفات',
        tags: true,
        tokenSeparators: [',', ' '],
    });

    // Load novels and categories
    loadNovels();
    loadCategories();

    // Add novel
    addNovelForm.addEventListener('submit', function(e) {
        e.preventDefault();
        const formData = new FormData(addNovelForm);
        addNovel(formData);
    });

    function loadNovels() {
        fetch(`${API_URL}/novels`)
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                return response.json();
            })
            .then(novels => {
                novelList.innerHTML = '';
                novels.forEach((novel) => {
                    const li = document.createElement('li');
                    li.className = 'flex justify-between items-center p-2 bg-gray-50 rounded mb-2';
                    li.innerHTML = `
                        <span>${novel.title}</span>
                        <div>
                            <button onclick="editNovel('${novel.slug}')" class="text-blue-500 hover:text-blue-700 mr-2">
                                <i class="fas fa-edit"></i> تعديل
                            </button>
                            <button onclick="deleteNovel('${novel.slug}')" class="text-red-500 hover:text-red-700">
                                <i class="fas fa-trash"></i> حذف
                            </button>
                        </div>
                    `;
                    novelList.appendChild(li);
                });
            })
            .catch(error => {
                console.error('Error loading novels:', error);
                alert('حدث خطأ أثناء تحميل الروايات. الرجاء المحاولة مرة أخرى.');
            });
    }

    function loadCategories() {
        fetch(`${API_URL}/categories`)
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                return response.json();
            })
            .then(categories => {
                const categorySelect = document.getElementById('categories');
                categorySelect.innerHTML = '';
                categories.forEach(category => {
                    const option = document.createElement('option');
                    option.value = category.name;
                    option.textContent = category.name;
                    categorySelect.appendChild(option);
                });
            })
            .catch(error => {
                console.error('Error loading categories:', error);
                alert('حدث خطأ أثناء تحميل التصنيفات. الرجاء المحاولة مرة أخرى.');
            });
    }

    function addNovel(formData) {
        fetch(`${API_URL}/novels`, {
          method: 'POST',
          body: formData,
        })
        .then(response => {
          if (!response.ok) {
            return response.json().then(err => { throw err; });
          }
          return response.json();
        })
        .then((novel) => {
          loadNovels();
          addNovelForm.reset();
          $('#categories').val(null).trigger('change');
          alert('تمت إضافة الرواية بنجاح');
        })
        .catch(error => {
          console.error('Error adding novel:', error);
          alert(`حدث خطأ أثناء إضافة الرواية: ${error.message}`);
        });
      }

    window.editNovel = function(slug) {
        fetch(`${API_URL}/novels/${slug}`)
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                return response.json();
            })
            .then(novel => {
                document.getElementById('title').value = novel.title;
                document.getElementById('description').value = novel.description;
                $('#categories').val(novel.categories).trigger('change');
                document.getElementById('completionStatus').value = novel.completionStatus;
                document.getElementById('section').value = novel.section;
                document.getElementById('supporters').value = novel.supporters.join(', ');

                // Change form submission to update instead of add
                addNovelForm.onsubmit = function(e) {
                    e.preventDefault();
                    const formData = new FormData(addNovelForm);
                    updateNovel(slug, formData);
                };
            })
            .catch(error => {
                console.error('Error fetching novel details:', error);
                alert('حدث خطأ أثناء تحميل بيانات الرواية. الرجاء المحاولة مرة أخرى.');
            });
    }

    function updateNovel(slug, formData) {
        fetch(`${API_URL}/novels/${slug}`, {
            method: 'PATCH',
            body: formData,
        })
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .then(() => {
            loadNovels();
            addNovelForm.reset();
            $('#categories').val(null).trigger('change');
            alert('تم تحديث الرواية بنجاح');
            // Reset form submission to add new novel
            addNovelForm.onsubmit = function(e) {
                e.preventDefault();
                const formData = new FormData(addNovelForm);
                addNovel(formData);
            };
        })
        .catch(error => {
            console.error('Error updating novel:', error);
            alert('حدث خطأ أثناء تحديث الرواية. الرجاء المحاولة مرة أخرى.');
        });
    }

    window.deleteNovel = async function(slug) {
        if (confirm('هل أنت متأكد من حذف هذه الرواية؟ سيتم حذف جميع فصولها أيضاً.')) {
          try {
            const response = await fetch(`${API_URL}/novels/${slug}`, {
              method: 'DELETE',
              headers: {
                'Content-Type': 'application/json',
              },
            });
      
            if (!response.ok) {
              return response.text().then(text => {
                throw new Error(`HTTP error! status: ${response.status}, message: ${text}`);
              });
            }
      
            const data = await response.json();
            alert('تم حذف الرواية وجميع فصولها بنجاح');
            loadNovels(); // إعادة تحميل قائمة الروايات
          } catch (error) {
            console.error('Error deleting novel:', error);
            alert(`حدث خطأ أثناء حذف الرواية: ${error.message}`);
          }
        }
      }
});









