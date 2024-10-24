

document.addEventListener('DOMContentLoaded', function() {
    loadUsers();
});

async function loadUsers() {
    try {
        const response = await fetch('/api/users');
        if (!response.ok) {
            throw new Error('Failed to fetch users');
        }
        const users = await response.json();
        displayUsers(users);
    } catch (error) {
        console.error('Error loading users:', error);
        alert('حدث خطأ أثناء تحميل بيانات المستخدمين');
    }
}

function displayUsers(users) {
    const userList = document.getElementById('userList');
    userList.innerHTML = '';
    users.forEach(user => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${user.name}</td>
            <td>${user.email}</td>
            <td>${new Date(user.createdAt).toLocaleDateString()}</td>
            <td>
                <button onclick="deleteUser('${user._id}')" class="bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-2 rounded">
                    حذف
                </button>
            </td>
        `;
        userList.appendChild(row);
    });
}

async function deleteUser(userId) {
    if (confirm('هل أنت متأكد من حذف هذا المستخدم؟')) {
        try {
            const response = await fetch(`/api/users/${userId}`, {
                method: 'DELETE'
            });
            if (!response.ok) {
                throw new Error('Failed to delete user');
            }
            loadUsers(); // إعادة تحميل قائمة المستخدمين
            alert('تم حذف المستخدم بنجاح');
        } catch (error) {
            console.error('Error deleting user:', error);
            alert('حدث خطأ أثناء حذف المستخدم');
        }
    }
}

