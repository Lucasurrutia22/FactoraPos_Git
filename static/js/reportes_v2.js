// Reportes V2 - Conectado correctamente con Inventario
// Script para gestionar reportes sincronizados con datos del inventario

// Toggle dropdown menu
function toggleProfileMenu() {
    const dropdown = document.getElementById('userDropdown');
    dropdown.classList.toggle('show');
}

// Close dropdown when clicking outside
document.addEventListener('click', (e) => {
    const dropdown = document.getElementById('userDropdown');
    const userProfile = document.querySelector('.user-profile-wrapper');
    
    if (userProfile && !userProfile.contains(e.target)) {
        dropdown.classList.remove('show');
    }
});

// logoutSession provided centrally in js/auth.js

// Open user profile
function openUserProfile(event) {
    event.preventDefault();
    const user = JSON.parse(sessionStorage.getItem('factora_user') || 'null') || { username: 'Admin Usuario', email: '', role: 'Administrador' };
    document.getElementById('profileUsername').value = user.username || '';
    document.getElementById('profileEmail').value = user.email || '';
    document.getElementById('profileRole').value = user.role || 'Administrador';
    openModalById('userProfileModal');
}

// Open settings
function openSettings(event) {
    event.preventDefault();
    const settings = JSON.parse(localStorage.getItem('factora_settings') || 'null') || { theme: 'light', notifications: true };
    document.getElementById('settingTheme').value = settings.theme || 'light';
    document.getElementById('settingNotifications').checked = !!settings.notifications;
    openModalById('settingsModal');
}

// Modal helpers
function openModalById(id) {
    const m = document.getElementById(id);
    if (m) m.classList.add('active');
}

function closeModalById(id) {
    const m = document.getElementById(id);
    if (m) m.classList.remove('active');
}

function saveUserProfile(e) {
    e.preventDefault();
    const username = document.getElementById('profileUsername').value.trim();
    const email = document.getElementById('profileEmail').value.trim();
    const role = document.getElementById('profileRole').value;

    const user = { username, email, role };
    sessionStorage.setItem('factora_user', JSON.stringify(user));

    const welcomeEl = document.getElementById('welcomeText');
    const roleEl = document.getElementById('roleText');
    const avatarEl = document.getElementById('userAvatar');
    if (welcomeEl) welcomeEl.textContent = username;
    if (roleEl) roleEl.textContent = role;
    if (avatarEl) avatarEl.textContent = username.charAt(0) || 'A';

    closeModalById('userProfileModal');
}

function saveSettings(e) {
    e.preventDefault();
    const theme = document.getElementById('settingTheme').value;
    const notifications = document.getElementById('settingNotifications').checked;
    const settings = { theme, notifications };
    localStorage.setItem('factora_settings', JSON.stringify(settings));

    applyTheme(theme);
    closeModalById('settingsModal');
}

function applyTheme(theme) {
    if (theme === 'dark') document.body.classList.add('theme-dark');
    else document.body.classList.remove('theme-dark');
}

// Apply theme on load
const savedSettings = JSON.parse(localStorage.getItem('factora_settings') || 'null');
if (savedSettings && savedSettings.theme) applyTheme(savedSettings.theme);

// ============== FUNCIONES DE REPORTES ==============

// Obtener productos del inventario en tiempo real
function getInventoryProducts() {
    return JSON.parse(localStorage.getItem('products')) || [];
}

let currentPage = 1;
let itemsPerPage = 10;
let filteredData = [];
let chartsInstances = {};
let products = [];

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    refreshInventoryData();
    updateReportView();
    setupEventListeners();
});

// Refrescar datos del inventario
function refreshInventoryData() {
    products = getInventoryProducts();
}

function setupEventListeners() {
    document.getElementById('reportPeriod').addEventListener('change', (e) => {
        if (e.target.value === 'personalizado') {
            document.getElementById('dateRangeGroup').style.display = 'flex';
        } else {
            document.getElementById('dateRangeGroup').style.display = 'none';
        }
    });

    document.getElementById('prevPage').addEventListener('click', () => {
        if (currentPage > 1) {
            currentPage--;
            renderTable();
        }
    });

    document.getElementById('nextPage').addEventListener('click', () => {
        const maxPages = Math.ceil(filteredData.length / itemsPerPage);
        if (currentPage < maxPages) {
            currentPage++;
            renderTable();
        }
    });
}

function updateReportView() {
    const reportType = document.getElementById('reportType').value;
    
    currentPage = 1;
    refreshInventoryData(); // Siempre obtener datos frescos
    
    switch(reportType) {
        case 'ventas':
            generateSalesReport();
            break;
        case 'inventario':
            generateInventoryReport();
            break;
        case 'productos':
            generateTopProductsReport();
            break;
        case 'stock':
            generateStockReport();
            break;
    }
    
    renderTable();
    updateStats();
    updateCharts(reportType);
}

function generateSalesReport() {
    document.getElementById('reportTitle').textContent = 'Reporte de Inventario (Ventas Potenciales)';
    
    filteredData = products.map(p => ({
        fecha: new Date().toISOString().split('T')[0],
        producto: p.name || p.nombre || 'Sin nombre',
        cantidad: p.stock || 0,
        monto: ((p.salePrice || p.precio || 0) * (p.stock || 0)),
        margen: parseFloat((((p.salePrice || 0) - (p.costPrice || 0)) / (p.costPrice || 1) * 100).toFixed(1)) || 0
    }));
    
    const headers = ['Fecha', 'Producto', 'Cantidad', 'Monto Potencial', 'Margen %'];
    renderTableHeaders(headers);
}

function generateInventoryReport() {
    document.getElementById('reportTitle').textContent = 'Reporte de Inventario Detallado';
    
    filteredData = products.map(p => ({
        sku: p.sku || 'N/A',
        producto: p.name || p.nombre || 'Sin nombre',
        categoria: p.category || p.categoria || 'Sin categoría',
        stock: p.stock || 0,
        precioCompra: p.costPrice || p.precioCompra || 0,
        precioVenta: p.salePrice || p.precio || 0,
        margen: parseFloat((((p.salePrice || 0) - (p.costPrice || 0)) / (p.costPrice || 1) * 100).toFixed(1)) || 0,
        valorTotal: ((p.costPrice || 0) * (p.stock || 0))
    }));
    
    const headers = ['SKU', 'Producto', 'Categoría', 'Stock', 'Precio Compra', 'Precio Venta', 'Margen %', 'Valor Total'];
    renderTableHeaders(headers);
}

function generateTopProductsReport() {
    document.getElementById('reportTitle').textContent = 'Productos en Inventario (Por Valor Total)';
    
    filteredData = products
        .map(p => ({
            producto: p.name || p.nombre || 'Sin nombre',
            sku: p.sku || 'N/A',
            stock: p.stock || 0,
            categoria: p.category || p.categoria || 'Sin categoría',
            precioVenta: p.salePrice || p.precio || 0,
            margen: parseFloat((((p.salePrice || 0) - (p.costPrice || 0)) / (p.costPrice || 1) * 100).toFixed(1)) || 0,
            valorInventario: ((p.costPrice || 0) * (p.stock || 0))
        }))
        .sort((a, b) => b.valorInventario - a.valorInventario);
    
    const headers = ['Producto', 'SKU', 'Stock', 'Categoría', 'Precio Venta', 'Margen %', 'Valor Inventario'];
    renderTableHeaders(headers);
}

function generateStockReport() {
    document.getElementById('reportTitle').textContent = 'Estado de Stock';
    
    filteredData = products
        .map(p => ({
            producto: p.name || p.nombre || 'Sin nombre',
            sku: p.sku || 'N/A',
            stock: p.stock || 0,
            minStock: p.minStock || 5,
            estado: (p.stock || 0) === 0 ? 'Agotado' : (p.stock || 0) <= (p.minStock || 5) ? 'Stock Bajo' : 'Disponible',
            categoria: p.category || p.categoria || 'Sin categoría',
            precioVenta: p.salePrice || p.precio || 0
        }))
        .sort((a, b) => a.stock - b.stock);
    
    const headers = ['Producto', 'SKU', 'Stock Actual', 'Stock Mínimo', 'Estado', 'Categoría', 'Precio Venta'];
    renderTableHeaders(headers);
}

function renderTableHeaders(headers) {
    const thead = document.getElementById('reportTableHeader');
    thead.innerHTML = headers.map(h => `<th>${h}</th>`).join('');
}

function renderTable() {
    const tbody = document.getElementById('reportTableBody');
    tbody.innerHTML = '';
    
    const start = (currentPage - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    const pageData = filteredData.slice(start, end);
    
    pageData.forEach(row => {
        const tr = document.createElement('tr');
        tr.innerHTML = Object.values(row)
            .map(val => {
                if (typeof val === 'number') {
                    if (val > 1000 && val === Math.floor(val)) {
                        return `<td>$${val.toLocaleString()}</td>`;
                    }
                    return `<td>${val.toFixed ? val.toFixed(2) : val}</td>`;
                }
                return `<td>${val}</td>`;
            })
            .join('');
        tbody.appendChild(tr);
    });
    
    updatePagination();
}

function updatePagination() {
    const maxPages = Math.ceil(filteredData.length / itemsPerPage) || 1;
    document.getElementById('pageInfo').textContent = `Página ${currentPage} de ${maxPages}`;
    
    document.getElementById('prevPage').disabled = currentPage === 1;
    document.getElementById('nextPage').disabled = currentPage === maxPages;
}

function updateStats() {
    const reportType = document.getElementById('reportType').value;
    
    if (reportType === 'ventas') {
        const totalSales = filteredData.reduce((sum, d) => sum + (d.monto || 0), 0);
        const totalUnits = filteredData.reduce((sum, d) => sum + (d.cantidad || 0), 0);
        const avgMargin = filteredData.length > 0 ? (filteredData.reduce((sum, d) => sum + (d.margen || 0), 0) / filteredData.length).toFixed(1) : 0;
        
        document.getElementById('totalSales').textContent = '$' + totalSales.toLocaleString();
        document.getElementById('totalUnits').textContent = totalUnits;
        document.getElementById('avgMargin').textContent = avgMargin + '%';
        document.getElementById('growth').textContent = 'Potencial';
    } else if (reportType === 'inventario') {
        const totalValue = filteredData.reduce((sum, d) => sum + (d.valorTotal || 0), 0);
        const totalStock = filteredData.reduce((sum, d) => sum + (d.stock || 0), 0);
        const avgMargin = filteredData.length > 0 ? (filteredData.reduce((sum, d) => sum + (d.margen || 0), 0) / filteredData.length).toFixed(1) : 0;
        
        document.getElementById('totalSales').textContent = '$' + totalValue.toLocaleString();
        document.getElementById('totalUnits').textContent = totalStock + ' unidades';
        document.getElementById('avgMargin').textContent = avgMargin + '%';
        document.getElementById('growth').textContent = filteredData.length + ' productos';
    } else if (reportType === 'productos') {
        const totalValue = filteredData.reduce((sum, d) => sum + (d.valorInventario || 0), 0);
        const totalStock = filteredData.reduce((sum, d) => sum + (d.stock || 0), 0);
        const avgMargin = filteredData.length > 0 ? (filteredData.reduce((sum, d) => sum + (d.margen || 0), 0) / filteredData.length).toFixed(1) : 0;
        
        document.getElementById('totalSales').textContent = '$' + totalValue.toLocaleString();
        document.getElementById('totalUnits').textContent = totalStock + ' unidades';
        document.getElementById('avgMargin').textContent = avgMargin + '%';
        document.getElementById('growth').textContent = 'Top ' + Math.min(5, filteredData.length);
    } else if (reportType === 'stock') {
        const totalStock = filteredData.reduce((sum, d) => sum + (d.stock || 0), 0);
        const agotados = filteredData.filter(d => d.estado === 'Agotado').length;
        const bajos = filteredData.filter(d => d.estado === 'Stock Bajo').length;
        const disponibles = filteredData.filter(d => d.estado === 'Disponible').length;
        
        document.getElementById('totalSales').textContent = totalStock + ' unidades';
        document.getElementById('totalUnits').textContent = agotados + ' agotados';
        document.getElementById('avgMargin').textContent = bajos + ' bajos';
        document.getElementById('growth').textContent = disponibles + ' disponibles';
    }
}

function updateCharts(reportType) {
    if (reportType === 'ventas' || reportType === 'inventario') {
        updateCategoryChart();
        updateProductChart();
    } else if (reportType === 'productos') {
        updateProductChart();
        updateInventoryCharts();
    } else if (reportType === 'stock') {
        updateStockCharts();
        updateCategoryChart();
    }
}

function updateCategoryChart() {
    const ctx = document.getElementById('categoryChart');
    if (!ctx) return;
    
    const reportType = document.getElementById('reportType').value;
    const categories = {};
    
    filteredData.forEach(d => {
        const key = d.categoria || 'Sin categoría';
        if (reportType === 'ventas' || reportType === 'inventario') {
            categories[key] = (categories[key] || 0) + (d.monto || d.valorTotal || 0);
        } else if (reportType === 'stock') {
            categories[d.estado || 'Desconocido'] = (categories[d.estado || 'Desconocido'] || 0) + 1;
        }
    });
    
    if (chartsInstances.categoryChart) chartsInstances.categoryChart.destroy();
    
    chartsInstances.categoryChart = new Chart(ctx, {
        type: reportType === 'stock' ? 'doughnut' : 'bar',
        data: {
            labels: Object.keys(categories),
            datasets: [{
                label: reportType === 'stock' ? 'Estado de Stock' : 'Valor por Categoría',
                data: Object.values(categories),
                backgroundColor: reportType === 'stock' 
                    ? ['#10b981', '#f59e0b', '#ef4444']
                    : ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'],
                borderColor: '#ffffff',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: {
                    position: reportType === 'stock' ? 'bottom' : 'top'
                }
            }
        }
    });
}

function updateProductChart() {
    const ctx = document.getElementById('trendsChart');
    if (!ctx) return;
    
    const reportType = document.getElementById('reportType').value;
    const topProducts = filteredData.slice(0, 8);
    
    if (chartsInstances.trendsChart) chartsInstances.trendsChart.destroy();
    
    chartsInstances.trendsChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: topProducts.map(d => (d.producto || 'Sin nombre').substring(0, 15)),
            datasets: [{
                label: reportType === 'inventario' ? 'Valor Inventario' : reportType === 'productos' ? 'Valor Total' : 'Stock',
                data: topProducts.map(d => 
                    reportType === 'ventas' ? (d.monto || 0) : 
                    reportType === 'inventario' ? (d.valorTotal || 0) :
                    reportType === 'productos' ? (d.valorInventario || 0) :
                    (d.stock || 0)
                ),
                backgroundColor: '#3b82f6',
                borderColor: '#2563eb',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            indexAxis: 'y',
            plugins: {
                legend: {
                    display: true
                }
            },
            scales: {
                x: {
                    beginAtZero: true
                }
            }
        }
    });
}

function updateInventoryCharts() {
    const ctx = document.getElementById('categoryChart');
    if (!ctx) return;
    
    const byCategory = {};
    filteredData.forEach(d => {
        const key = d.categoria || 'Sin categoría';
        byCategory[key] = (byCategory[key] || 0) + (d.stock || 0);
    });
    
    if (chartsInstances.categoryChart) chartsInstances.categoryChart.destroy();
    
    chartsInstances.categoryChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: Object.keys(byCategory),
            datasets: [{
                label: 'Stock por Categoría',
                data: Object.values(byCategory),
                backgroundColor: '#10b981'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: {
                    display: false
                }
            }
        }
    });
}

function updateStockCharts() {
    const ctx = document.getElementById('trendsChart');
    if (!ctx) return;
    
    const states = { 'Disponible': 0, 'Stock Bajo': 0, 'Agotado': 0 };
    filteredData.forEach(d => {
        states[d.estado]++;
    });
    
    if (chartsInstances.trendsChart) chartsInstances.trendsChart.destroy();
    
    chartsInstances.trendsChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: Object.keys(states),
            datasets: [{
                data: Object.values(states),
                backgroundColor: ['#10b981', '#f59e0b', '#ef4444']
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: {
                    position: 'bottom'
                }
            }
        }
    });
}

function resetFilters() {
    document.getElementById('reportType').value = 'inventario';
    document.getElementById('reportPeriod').value = 'mes';
    document.getElementById('startDate').value = '';
    document.getElementById('endDate').value = '';
    document.getElementById('dateRangeGroup').style.display = 'none';
    
    updateReportView();
}

function printReport() {
    window.print();
}

function exportReportCSV() {
    const headers = Array.from(document.querySelectorAll('#reportTableHeader th')).map(th => th.textContent);
    const rows = Array.from(document.querySelectorAll('#reportTableBody tr')).map(tr => 
        Array.from(tr.querySelectorAll('td')).map(td => td.textContent)
    );
    
    let csv = headers.join(',') + '\n';
    rows.forEach(row => {
        csv += row.map(val => `"${val}"`).join(',') + '\n';
    });
    
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `reporte_inventario_${new Date().toISOString().split('T')[0]}.csv`);
    link.click();
}

function exportReportPDF() {
    const reportType = document.getElementById('reportType').value;
    const reportPeriod = document.getElementById('reportPeriod').value;
    
    // Obtener solo la tabla de reporte actual (la más reciente)
    const tables = document.querySelectorAll('.report-table');
    if (tables.length === 0) {
        alert('No hay datos para exportar');
        return;
    }
    
    // Usar la última tabla (la más reciente)
    const table = tables[tables.length - 1];

    // Crear un contenedor temporal para imprimir
    const printElement = document.createElement('div');
    printElement.style.padding = '20px';
    printElement.style.backgroundColor = 'white';
    printElement.style.color = 'black';
    printElement.style.fontFamily = 'Arial, sans-serif';
    
    // Agregar título
    const title = document.createElement('h2');
    title.textContent = `Reporte de ${reportType.charAt(0).toUpperCase() + reportType.slice(1)} - ${reportPeriod}`;
    title.style.textAlign = 'center';
    title.style.marginBottom = '10px';
    title.style.color = '#333';
    printElement.appendChild(title);
    
    // Agregar fecha de generación
    const dateInfo = document.createElement('p');
    dateInfo.textContent = `Fecha de generación: ${new Date().toLocaleString('es-CL')}`;
    dateInfo.style.fontSize = '12px';
    dateInfo.style.marginBottom = '20px';
    dateInfo.style.color = '#666';
    dateInfo.style.textAlign = 'center';
    printElement.appendChild(dateInfo);
    
    // Clonar la tabla
    const tableClone = table.cloneNode(true);
    tableClone.style.width = '100%';
    tableClone.style.borderCollapse = 'collapse';
    tableClone.style.fontSize = '11px';
    
    // Estilos para la tabla
    const rows = tableClone.querySelectorAll('tr');
    rows.forEach((row, index) => {
        row.style.borderBottom = '1px solid #ccc';
        
        // Encabezados
        if (index === 0) {
            row.style.backgroundColor = '#4282f6';
            row.style.color = 'white';
        } else {
            // Alternar colores
            row.style.backgroundColor = index % 2 === 0 ? '#f9f9f9' : 'white';
        }
        
        row.querySelectorAll('td, th').forEach(cell => {
            cell.style.padding = '8px';
            cell.style.textAlign = 'left';
            cell.style.border = '1px solid #ddd';
        });
    });
    
    printElement.appendChild(tableClone);
    
    // Guardar el contenido actual
    const originalContent = document.body.innerHTML;
    
    // Reemplazar contenido temporalmente
    document.body.innerHTML = printElement.outerHTML;
    
    // Imprimir (se abrirá el diálogo de impresión)
    window.print();
    
    // Restaurar contenido original
    setTimeout(() => {
        document.body.innerHTML = originalContent;
        // Re-ejecutar scripts si es necesario
        location.reload();
    }, 1000);
}

// Escuchar cambios en el inventario desde otras pestañas/ventanas
window.addEventListener('storage', (e) => {
    if (e.key === 'products') {
        console.log('Inventario actualizado, refrescando reportes...');
        updateReportView();
    }
});
