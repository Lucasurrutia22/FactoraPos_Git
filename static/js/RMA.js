// RMA (Warranty/Returns) Module
(function() {
    'use strict';

    let customers = [];
    let products = [];
    let rmaRequests = [];

    // Initialize on DOM ready
    document.addEventListener('DOMContentLoaded', function() {
        loadDataFromAPI();
    });

    // Load all data from Oracle APIs
    async function loadDataFromAPI() {
        try {
            // Cargar clientes desde Oracle
            const customersRes = await fetch('/ventas/api/clientes/');
            const customersData = await customersRes.json();
            if (customersData.success) {
                customers = customersData.data.map(c => ({
                    id: c.id_cliente,
                    name: c.nombre
                }));
            }
        } catch (error) {
            console.error('Error cargando clientes:', error);
            // Fallback a localStorage
            const customersStored = localStorage.getItem('customers');
            customers = customersStored ? JSON.parse(customersStored) : [];
        }

        try {
            // Cargar productos desde Oracle
            const productsRes = await fetch('/inventario/api/productos/');
            const productsData = await productsRes.json();
            if (productsData.success) {
                products = productsData.data.map(p => ({
                    id: p.id_producto,
                    name: p.nombre
                }));
            }
        } catch (error) {
            console.error('Error cargando productos:', error);
            // Fallback a localStorage
            const productsStored = localStorage.getItem('products');
            products = productsStored ? JSON.parse(productsStored) : [];
        }

        // Cargar RMAs desde localStorage (por ahora)
        const rmaStored = localStorage.getItem('rma');
        rmaRequests = rmaStored ? JSON.parse(rmaStored) : [];

        populateSelects();
        renderRmaTable();
    }

    // Populate select dropdowns
    function populateSelects() {
        const customerSelect = document.getElementById('rmaCustomer');
        const productSelect = document.getElementById('rmaProduct');

        if (customerSelect) {
            customerSelect.innerHTML = '<option value="">-- Seleccionar Cliente --</option>' + 
                customers.map(c => `<option value="${c.id}">${c.name}</option>`).join('');
        }

        if (productSelect) {
            productSelect.innerHTML = '<option value="">-- Seleccionar Producto --</option>' + 
                products.map(p => `<option value="${p.id}">${p.name}</option>`).join('');
        }
        
        console.log('Clientes cargados:', customers.length);
        console.log('Productos cargados:', products.length);
    }

    // Handle RMA form submission
    window.handleRmaSubmit = function(e) {
        e.preventDefault();
        
        const customerId = parseInt(document.getElementById('rmaCustomer').value);
        const productId = parseInt(document.getElementById('rmaProduct').value);
        const rmaType = document.getElementById('rmaType').value;
        const purchaseDate = document.getElementById('rmaPurchaseDate').value;
        const description = document.getElementById('rmaDescription').value;

        if (!customerId || !productId || !rmaType || !purchaseDate || !description) {
            alert('Por favor completa todos los campos requeridos');
            return;
        }

        const customer = customers.find(c => c.id === customerId);
        const product = products.find(p => p.id === productId);

        const rmaRequest = {
            id: 'RMA-' + Date.now(),
            customerId: customerId,
            customerName: customer?.name || 'Desconocido',
            productId: productId,
            productName: product?.name || 'Desconocido',
            type: rmaType,
            purchaseDate: purchaseDate,
            description: description,
            requestDate: new Date().toISOString().split('T')[0],
            status: 'Pendiente'
        };

        rmaRequests.push(rmaRequest);
        localStorage.setItem('rma', JSON.stringify(rmaRequests));

        // Reset form
        document.getElementById('rmaForm').reset();
        renderRmaTable();
        alert('Solicitud RMA creada: ' + rmaRequest.id);
    };

    // Render RMA table
    function renderRmaTable() {
        const tbody = document.getElementById('rmaTableBody');
        if (rmaRequests.length === 0) {
            tbody.innerHTML = '<tr><td colspan="7" style="text-align: center; color: #64748b;">No hay solicitudes RMA</td></tr>';
            return;
        }

        tbody.innerHTML = rmaRequests.map((rma, index) => `
            <tr>
                <td><strong>${rma.id}</strong></td>
                <td>${rma.customerName}</td>
                <td>${rma.productName}</td>
                <td>${rma.type}</td>
                <td>${rma.requestDate}</td>
                <td><span class="badge-status ${rma.status === 'Resuelto' ? 'active' : rma.status === 'En Proceso' ? 'medium' : 'low'}">${rma.status}</span></td>
                <td>
                    <div class="action-buttons">
                        <button class="btn-action btn-edit" onclick="window.updateRmaStatus(${index})" title="Actualizar Estado" ${rma.status === 'Resuelto' ? 'disabled' : ''}>
                            ✏️
                        </button>
                        <button class="btn-action btn-delete" onclick="window.deleteRma(${index})" title="Eliminar">
                            🗑️
                        </button>
                    </div>
                </td>
            </tr>
        `).join('');
    }

    // Update RMA status
    window.updateRmaStatus = function(index) {
        const rma = rmaRequests[index];
        const statuses = ['Pendiente', 'En Proceso', 'Resuelto'];
        const currentStatusIndex = statuses.indexOf(rma.status);
        const nextStatus = statuses[(currentStatusIndex + 1) % statuses.length];

        rma.status = nextStatus;
        localStorage.setItem('rma', JSON.stringify(rmaRequests));
        renderRmaTable();
        alert('Estado actualizado a: ' + nextStatus);
    };

    // Delete RMA
    window.deleteRma = function(index) {
        if (confirm('¿Estás seguro de eliminar esta solicitud RMA?')) {
            rmaRequests.splice(index, 1);
            localStorage.setItem('rma', JSON.stringify(rmaRequests));
            renderRmaTable();
        }
    };

    // Listen for updates
    window.addEventListener('storage', function(e) {
        if (e.key === 'customers' || e.key === 'products' || e.key === 'rma') {
            loadData();
            populateSelects();
        }
    });

    window.addEventListener('productsUpdated', function(e) {
        loadData();
        populateSelects();
    });

    document.addEventListener('visibilitychange', function() {
        if (!document.hidden) {
            loadData();
            populateSelects();
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
