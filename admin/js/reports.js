
document.addEventListener('DOMContentLoaded', function() {
    loadReports();
});

async function loadReports() {
    try {
        const response = await fetch('/api/reports');
        
        if (!response.ok) {
            throw new Error('فشل في جلب البلاغات');
        }
        
        const reports = await response.json();
        displayReports(reports);
    } catch (error) {
        console.error('Error loading reports:', error);
        alert('حدث خطأ أثناء تحميل البلاغات: ' + error.message);
    }
}

function displayReports(reports) {
    const reportsList = document.getElementById('reportsList');
    reportsList.innerHTML = '';
    reports.forEach(report => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${report.user ? report.user.name : 'مجهول'}</td>
            <td>${report.novel ? report.novel.title : 'غير محدد'}</td>
            <td>${report.chapter ? `الفصل ${report.chapter.number}: ${report.chapter.title}` : 'غير محدد'}</td>
            <td>${report.message}</td>
            <td>${getStatusBadge(report.status)}</td>
            <td>${new Date(report.createdAt).toLocaleString('ar-EG')}</td>
            <td>
                <select onchange="updateReportStatus('${report._id}', this.value)">
                    <option value="pending" ${report.status === 'pending' ? 'selected' : ''}>قيد المراجعة</option>
                    <option value="resolved" ${report.status === 'resolved' ? 'selected' : ''}>تم الحل</option>
                    <option value="rejected" ${report.status === 'rejected' ? 'selected' : ''}>مرفوض</option>
                </select>
            </td>
        `;
        reportsList.appendChild(row);
    });
}

function getStatusBadge(status) {
    const statusClasses = {
        pending: 'bg-yellow-100 text-yellow-800',
        resolved: 'bg-green-100 text-green-800',
        rejected: 'bg-red-100 text-red-800'
    };
    const statusText = {
        pending: 'قيد المراجعة',
        resolved: 'تم الحل',
        rejected: 'مرفوض'
    };
    return `<span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${statusClasses[status]}">${statusText[status]}</span>`;
}

async function updateReportStatus(reportId, newStatus) {
    try {
        const response = await fetch(`/api/reports/${reportId}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ status: newStatus })
        });
        if (!response.ok) {
            throw new Error('فشل في تحديث حالة البلاغ');
        }
        loadReports(); // إعادة تحميل البلاغات لتحديث العرض
    } catch (error) {
        console.error('Error updating report status:', error);
        alert('حدث خطأ أثناء تحديث حالة البلاغ: ' + error.message);
    }
}
