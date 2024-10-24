

document.addEventListener('DOMContentLoaded', function() {
    const addCategoryForm = document.getElementById('addCategoryForm');
    const categoryList = document.getElementById('categoryList');

    // Load categories
    loadCategories();

    // Add category
    addCategoryForm.addEventListener('submit', function(e) {
        e.preventDefault();
        const categoryName = document.getElementById('categoryName').value;
        addCategory(categoryName);
    });

    function loadCategories() {
        fetch('/api/categories')
            .then(response => response.json())
            .then(categories => {
                categoryList.innerHTML = '';
                categories.forEach(category => {
                    const li = document.createElement('li');
                    li.className = 'flex justify-between items-center p-2 bg-gray-50 rounded';
                    li.innerHTML = `
                        <span>${category.name}</span>
                        <div>
                            <button onclick="editCategory('${category._id}', '${category.name}')" class="text-blue-500 hover:text-blue-700 mr-2">
                                <i class="fas fa-edit"></i> تعديل
                            </button>
                            <button onclick="deleteCategory('${category._id}')" class="text-red-500 hover:text-red-700">
                                <i class="fas fa-trash"></i> حذف
                            </button>
                        </div>
                    `;
                    categoryList.appendChild(li);
                });
            });
    }

    function addCategory(name) {
        fetch('/api/categories', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ name }),
        })
        .then(response => response.json())
        .then(() => {
            loadCategories();
            addCategoryForm.reset();
        });
    }

    window.editCategory = function(id, currentName) {
        const newName = prompt('أدخل الاسم الجديد للتصنيف:', currentName);
        if (newName && newName !== currentName) {
            fetch(`/api/categories/${id}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ name: newName }),
            })
            .then(response => response.json())
            .then(() => loadCategories());
        }
    }

    window.deleteCategory = function(id) {
        if (confirm('هل أنت متأكد من حذف هذا التصنيف؟')) {
            fetch(`/api/categories/${id}`, {
                method: 'DELETE',
            })
            .then(() => loadCategories());
        }
    }
});










