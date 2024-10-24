

async function fetchData(url, options = {}) {
  try {
    const response = await fetch(url, options);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching data:', error);
    alert('حدث خطأ أثناء جلب البيانات. الرجاء المحاولة مرة أخرى.');
  }
}

// تصدير الوظائف التي قد تحتاجها الملفات الأخرى
window.adminUtils = {
  fetchData
};

