// Movimientos (Transaction Log) Module
(function() {
    'use strict';

    let movements = [];
    let allMovements = [];

    // Initialize on DOM ready
    document.addEventListener('DOMContentLoaded', function() {
        loadMovements();
        generateMovementsFromStoredData();
    });

    // Load movements log
    function loadMovements() {
        const stored = localStorage.getItem('movements');
        allMovements = stored ? JSON.parse(stored) : [];
        movements = [...allMovements];
        renderMovementsTable();
    }

    // Generate movements from existing data
    function generateMovementsFromStoredData() {
        // Log sales
        const sales = JSON.parse(localStorage.getItem('sales') || '[]');
        sales.forEach(sale => {
            if (!allMovements.find(m => m.referenceId === sale.id)) {
                allMovements.push({
                    date: sale.date,
                    time: '00:00',
                    type: 'Venta',
                    referenceId: sale.id,
                    description: sale.items.map(i => i.name).join(', '),
                    quantity: sale.items.reduce((sum, i) => sum + i.quantity, 0),
                    value: sale.total,
                    user: 'Sistema'
                });
            }
        });

        // Log purchases
        const purchases = JSON.parse(localStorage.getItem('purchases') || '[]');
        purchases.forEach(purchase => {
            if (!allMovements.find(m => m.referenceId === purchase.id)) {
                allMovements.push({
                    date: purchase.date,
                    time: '00:00',
                    type: 'Compra',
                    referenceId: purchase.id,
                    description: purchase.productName + ' (de ' + purchase.supplierName + ')',
                    quantity: purchase.quantity,
                    value: purchase.totalCost,
                    user: 'Sistema'
                });
            }
        });

        // Sort by date descending
        allMovements.sort((a, b) => {
            const dateA = new Date(a.date + ' ' + a.time);
            const dateB = new Date(b.date + ' ' + b.time);
            return dateB - dateA;
        });

        localStorage.setItem('movements', JSON.stringify(allMovements));
        movements = [...allMovements];
        renderMovementsTable();
    }

    // Render movements table
    function renderMovementsTable() {
        const tbody = document.getElementById('movementsTableBody');
        if (movements.length === 0) {
            tbody.innerHTML = '<tr><td colspan="8" style="text-align: center; color: #64748b;">No hay movimientos registrados</td></tr>';
            return;
        }

        tbody.innerHTML = movements.slice(0, 100).map(movement => `
            <tr>
                <td>${movement.date}</td>
                <td>${movement.time}</td>
                <td>
                    <span class="badge-status ${movement.type === 'Venta' ? 'active' : movement.type === 'Compra' ? 'medium' : 'warning'}">
                        ${movement.type}
                    </span>
                </td>
                <td><strong>${movement.referenceId}</strong></td>
                <td>${movement.description}</td>
                <td>${movement.quantity}</td>
                <td>$${movement.value.toLocaleString()}</td>
                <td>${movement.user}</td>
            </tr>
        `).join('');
    }

    // Apply filters
    window.applyFilters = function() {
        const typeFilter = document.getElementById('filterType').value;
        const fromDate = document.getElementById('filterFromDate').value;
        const toDate = document.getElementById('filterToDate').value;

        movements = allMovements.filter(m => {
            const typeMatch = !typeFilter || m.type === typeFilter;
            const dateMatch = (!fromDate || m.date >= fromDate) && (!toDate || m.date <= toDate);
            return typeMatch && dateMatch;
        });

        renderMovementsTable();
    };

    // Clear filters
    window.clearFilters = function() {
        document.getElementById('filterType').value = '';
        document.getElementById('filterFromDate').value = '';
        document.getElementById('filterToDate').value = '';
        movements = [...allMovements];
        renderMovementsTable();
    };

    // Export movements to CSV
    window.exportMovements = function() {
        let csv = 'Fecha,Hora,Tipo,ID Referencia,Descripción,Cantidad,Valor,Usuario\n';
        
        movements.forEach(movement => {
            csv += `"${movement.date}","${movement.time}","${movement.type}","${movement.referenceId}","${movement.description}","${movement.quantity}","${movement.value}","${movement.user}"\n`;
        });

        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = 'movimientos_' + new Date().toISOString().split('T')[0] + '.csv';
        link.click();
    };

    // Modal & Add Movement handlers
    window.openAddMovementModal = function() {
        const modal = document.getElementById('addMovementModal');
        if (modal) {
            modal.style.display = 'flex';
            // Set today's date
            const today = new Date().toISOString().split('T')[0];
            const dateInput = document.getElementById('mv_date');
            if (dateInput && !dateInput.value) {
                dateInput.value = today;
            }
        }
    };

    window.closeAddMovementModal = function() {
        const modal = document.getElementById('addMovementModal');
        if (modal) modal.style.display = 'none';
        const form = document.getElementById('addMovementForm');
        if (form) form.reset();
    };

    window.submitAddMovement = function() {
        const date = document.getElementById('mv_date').value;
        const time = document.getElementById('mv_time').value;
        const type = document.getElementById('mv_type').value;
        const ref = document.getElementById('mv_ref').value || '';
        const desc = document.getElementById('mv_desc').value || '';
        const qty = parseFloat(document.getElementById('mv_qty').value) || 0;
        const value = parseFloat(document.getElementById('mv_value').value) || 0;
        const user = document.getElementById('mv_user').value || 'Sistema';

        if (!date || !time || !type || !desc) {
            alert('Complete Fecha, Hora, Tipo y Descripción.');
            return;
        }

        const datetime = date + ' ' + time;
        const id = 'm_' + Date.now();

        const newMovement = {
            id: id,
            date: date,
            time: time,
            datetime: datetime,
            type: type,
            referenceId: ref,
            description: desc,
            quantity: qty,
            value: value,
            user: user
        };

        // ensure allMovements is current
        allMovements = allMovements || [];
        allMovements.unshift(newMovement);
        // persist
        localStorage.setItem('movements', JSON.stringify(allMovements));

        // update view
        movements = [...allMovements];
        renderMovementsTable();
        
        // Create an in-app notification for the new movement (if notifications module loaded)
        try {
            if (typeof window.addNotification === 'function') {
                window.addNotification({
                    title: `Nuevo Movimiento: ${newMovement.type}`,
                    message: `${newMovement.description} (Ref: ${newMovement.referenceId || '-'})`,
                    type: newMovement.type || 'Movimiento'
                });
            }
        } catch (err) {
            console.warn('No se pudo enviar notificación:', err);
        }
        
        window.closeAddMovementModal();
        alert('Movimiento agregado exitosamente');
    };

    // Listen for updates - regenerate movements when data changes
    window.addEventListener('storage', function(e) {
        if (e.key === 'sales' || e.key === 'purchases' || e.key === 'movements') {
            loadMovements();
            generateMovementsFromStoredData();
        }
    });

    window.addEventListener('productsUpdated', function(e) {
        generateMovementsFromStoredData();
    });

    document.addEventListener('visibilitychange', function() {
        if (!document.hidden) {
            loadMovements();
            generateMovementsFromStoredData();
        }
    });
})();

// Global dropdown functions
window.toggleProfileMenu = function() {
    const dropdown = document.getElementById('userDropdown');
    if (dropdown) {
        dropdown.classList.toggle('show');
    }
};

document.addEventListener('click', function(e) {
    const profileWrapper = document.querySelector('.user-profile-wrapper');
    const dropdown = document.getElementById('userDropdown');
    if (profileWrapper && !profileWrapper.contains(e.target) && dropdown) {
        dropdown.classList.remove('show');
    }
});

// Modal functions
function openUserProfile(event) {
    event.preventDefault();
    const modal = document.getElementById('userProfileModal');
    if (modal) modal.style.display = 'flex';
}

function openSettings(event) {
    event.preventDefault();
    const modal = document.getElementById('settingsModal');
    if (modal) modal.style.display = 'flex';
}

function closeModalById(id) {
    const modal = document.getElementById(id);
    if (modal) modal.style.display = 'none';
}
