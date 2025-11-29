// Clientes (Customers) Module
(function() {
    'use strict';

    let customers = [];

    // Initialize on DOM ready
    document.addEventListener('DOMContentLoaded', function() {
        loadCustomers();
    });

    // Load customers
    function loadCustomers() {
        const stored = localStorage.getItem('customers');
        customers = stored ? JSON.parse(stored) : [];
        renderCustomersTable();
    }

    // Handle customer form submission
    window.handleCustomerSubmit = function(e) {
        e.preventDefault();
        
        const name = document.getElementById('customerName').value;
        const email = document.getElementById('customerEmail').value;
        const phone = document.getElementById('customerPhone').value;
        const rut = document.getElementById('customerRut').value;
        const address = document.getElementById('customerAddress').value;
        const city = document.getElementById('customerCity').value;

        if (!name) {
            alert('El nombre es requerido');
            return;
        }

        const customer = {
            id: Date.now(),
            name: name,
            email: email,
            phone: phone,
            rut: rut,
            address: address,
            city: city,
            registrationDate: new Date().toISOString().split('T')[0],
            totalSpent: 0,
            totalPurchases: 0
        };

        customers.push(customer);
        localStorage.setItem('customers', JSON.stringify(customers));

        // Reset form
        document.getElementById('customerForm').reset();
        renderCustomersTable();
        alert('Cliente creado exitosamente');
    };

    // Render customers table
    function renderCustomersTable() {
        const tbody = document.getElementById('customersTableBody');
        if (customers.length === 0) {
            tbody.innerHTML = '<tr><td colspan="8" style="text-align: center; color: #64748b;">No hay clientes registrados</td></tr>';
            return;
        }

        tbody.innerHTML = customers.map((customer, index) => `
            <tr>
                <td>#${customer.id}</td>
                <td><strong>${customer.name}</strong></td>
                <td>${customer.email || '-'}</td>
                <td>${customer.phone || '-'}</td>
                <td>${customer.rut || '-'}</td>
                <td>${customer.city || '-'}</td>
                <td>${customer.registrationDate}</td>
                <td>
                    <button class="btn-secondary" style="padding: 4px 8px; font-size: 12px; margin-right: 5px;" onclick="window.editCustomer(${index})">Editar</button>
                    <button class="btn-secondary" style="padding: 4px 8px; font-size: 12px;" onclick="window.deleteCustomer(${index})">Eliminar</button>
                </td>
            </tr>
        `).join('');
    }

    // Edit customer
    window.editCustomer = function(index) {
        const customer = customers[index];
        document.getElementById('customerName').value = customer.name;
        document.getElementById('customerEmail').value = customer.email || '';
        document.getElementById('customerPhone').value = customer.phone || '';
        document.getElementById('customerRut').value = customer.rut || '';
        document.getElementById('customerAddress').value = customer.address || '';
        document.getElementById('customerCity').value = customer.city || '';
        
        // Store current editing index
        document.getElementById('customerForm').dataset.editingIndex = index;
        
        const oldSubmit = document.getElementById('customerForm').onsubmit;
        document.getElementById('customerForm').onsubmit = function(e) {
            e.preventDefault();
            const editIndex = parseInt(this.dataset.editingIndex);
            const name = document.getElementById('customerName').value;
            const email = document.getElementById('customerEmail').value;
            const phone = document.getElementById('customerPhone').value;
            const rut = document.getElementById('customerRut').value;
            const address = document.getElementById('customerAddress').value;
            const city = document.getElementById('customerCity').value;

            customers[editIndex] = {
                ...customers[editIndex],
                name: name,
                email: email,
                phone: phone,
                rut: rut,
                address: address,
                city: city
            };

            localStorage.setItem('customers', JSON.stringify(customers));
            document.getElementById('customerForm').reset();
            delete this.dataset.editingIndex;
            this.onsubmit = oldSubmit;
            renderCustomersTable();
            alert('Cliente actualizado');
        };
    };

    // Delete customer
    window.deleteCustomer = function(index) {
        if (confirm('¿Estás seguro de eliminar este cliente?')) {
            customers.splice(index, 1);
            localStorage.setItem('customers', JSON.stringify(customers));
            renderCustomersTable();
        }
    };

    // Listen for updates
    window.addEventListener('storage', function(e) {
        if (e.key === 'customers') {
            loadCustomers();
        }
    });

    document.addEventListener('visibilitychange', function() {
        if (!document.hidden) {
            loadCustomers();
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
