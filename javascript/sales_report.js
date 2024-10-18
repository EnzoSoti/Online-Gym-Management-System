document.addEventListener('DOMContentLoaded', function() {
    // Function to generate unique IDs
    function generateUniqueId(prefix) {
        return `${prefix}${Date.now()}${Math.floor(Math.random() * 1000)}`;
    }

    // Function to format date to YYYY-MM-DD
    function formatDate(date) {
        return new Date(date).toISOString().split('T')[0];
    }

    // Function to add a new row to the table
    function addRowToTable(formData, tableId) {
        const table = document.querySelector(`#${tableId} tbody`);
        const newRow = document.createElement('tr');
        
        switch(tableId) {
            case 'monthly':
                const memberId = generateUniqueId('M');
                newRow.innerHTML = `
                    <td class="px-6 py-4 whitespace-nowrap">${memberId}</td>
                    <td class="px-6 py-4 whitespace-nowrap">${formData.get('name')}</td>
                    <td class="px-6 py-4 whitespace-nowrap">${formData.get('startDate')}</td>
                    <td class="px-6 py-4 whitespace-nowrap">${formData.get('endDate')}</td>
                    <td class="px-6 py-4 whitespace-nowrap">₱${formData.get('amount')}</td>
                    <td class="px-6 py-4 whitespace-nowrap">
                        <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                            Active
                        </span>
                    </td>
                `;
                break;

            case 'regular':
                const regularId = generateUniqueId('R');
                newRow.innerHTML = `
                    <td class="px-6 py-4 whitespace-nowrap">${regularId}</td>
                    <td class="px-6 py-4 whitespace-nowrap">${formData.get('name')}</td>
                    <td class="px-6 py-4 whitespace-nowrap">${formData.get('date')}</td>
                    <td class="px-6 py-4 whitespace-nowrap">${formData.get('timeIn')}</td>
                    <td class="px-6 py-4 whitespace-nowrap">₱${formData.get('amount')}</td>
                `;
                break;

            case 'student':
                const studentId = generateUniqueId('S');
                newRow.innerHTML = `
                    <td class="px-6 py-4 whitespace-nowrap">${studentId}</td>
                    <td class="px-6 py-4 whitespace-nowrap">${formData.get('name')}</td>
                    <td class="px-6 py-4 whitespace-nowrap">${formData.get('schoolId')}</td>
                    <td class="px-6 py-4 whitespace-nowrap">${formData.get('date')}</td>
                    <td class="px-6 py-4 whitespace-nowrap">${formData.get('timeIn')}</td>
                    <td class="px-6 py-4 whitespace-nowrap">₱${formData.get('amount')}</td>
                `;
                break;

            case 'supplements':
                const productId = generateUniqueId('P');
                newRow.innerHTML = `
                    <td class="px-6 py-4 whitespace-nowrap">${productId}</td>
                    <td class="px-6 py-4 whitespace-nowrap">${formData.get('productName')}</td>
                    <td class="px-6 py-4 whitespace-nowrap">${formData.get('quantity')}</td>
                    <td class="px-6 py-4 whitespace-nowrap">₱${formData.get('amount')}</td>
                `;
                break;
        }
        
        table.appendChild(newRow);
    }

    // Tab functionality
    const tabButtons = document.querySelectorAll('[role="tab"]');
    const tabPanels = document.querySelectorAll('[role="tabpanel"]');

    tabButtons.forEach(button => {
        const targetId = button.getAttribute('data-tabs-target').substring(1);
        button.setAttribute('aria-controls', targetId);

        button.addEventListener('click', () => {
            // Deactivate all tabs
            tabButtons.forEach(btn => {
                btn.classList.remove('border-blue-600');
                btn.classList.add('border-transparent');
                btn.setAttribute('aria-selected', 'false');
            });

            // Hide all tab panels
            tabPanels.forEach(panel => {
                panel.classList.add('hidden');
            });

            // Activate clicked tab
            button.classList.remove('border-transparent');
            button.classList.add('border-blue-600');
            button.setAttribute('aria-selected', 'true');

            // Show corresponding panel
            const targetPanel = document.getElementById(targetId);
            targetPanel.classList.remove('hidden');
        });
    });

    // Modal functionality
    const addButtons = document.querySelectorAll('button');

    // Handle "Add" button clicks
    addButtons.forEach(button => {
        if (button.textContent.toLowerCase().includes('add') && !button.closest('[role="tabpanel"][id^="reservation"]')) { // Ignore reservation related buttons
            button.addEventListener('click', () => {
                const tabPanel = button.closest('[role="tabpanel"]');
                if (tabPanel) {
                    const modalId = tabPanel.id + 'Modal';
                    const modal = document.getElementById(modalId);
                    if (modal) modal.classList.remove('hidden');
                }
            });
        }
    });

    // Handle modal closing
    document.querySelectorAll('.closeModal').forEach(button => {
        button.addEventListener('click', () => {
            button.closest('[id$="Modal"]').classList.add('hidden');
        });
    });

    // Close modal when clicking outside
    document.querySelectorAll('[id$="Modal"]').forEach(modal => {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.classList.add('hidden');
            }
        });
    });

    // Handle form submissions
    document.querySelectorAll('form').forEach(form => {
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            const formId = form.id;

            // Special handling for reservation booking
            if (formId === 'booking-form') {
                bookReservation(e);
            } else {
                // Existing logic for other forms
                const formData = new FormData(form);
                const tableId = formId.replace('Form', '');
                
                // Show SweetAlert confirmation
                Swal.fire({
                    title: 'Are you sure?',
                    text: 'Do you want to save the details?',
                    icon: 'warning',
                    showCancelButton: true,
                    confirmButtonColor: '#3085d6',
                    cancelButtonColor: '#d33',
                    confirmButtonText: 'Yes, save it!'
                }).then((result) => {
                    if (result.isConfirmed) {
                        // Simulate API call with a promise
                        new Promise((resolve, reject) => {
                            // Simulate API delay
                            setTimeout(() => {
                                resolve({ success: true, data: formData });
                            }, 500);
                        })
                        .then(response => {
                            if (response.success) {
                                // Add the new row to the table
                                addRowToTable(formData, tableId);
                                
                                // Show success message
                                Swal.fire(
                                    'Saved!',
                                    'Your data has been saved successfully.',
                                    'success'
                                ).then(() => {
                                    // Reset form and close modal
                                    form.reset();
                                    const modal = form.closest('[id$="Modal"]');
                                    if (modal) {
                                        modal.classList.add('hidden');
                                    }
                                });
                            } else {
                                throw new Error('Failed to save data');
                            }
                        })
                    }
                });
            }
        });
    });

    // Handle export/print functionality
    document.querySelectorAll('button').forEach(button => {
        if (button.textContent.toLowerCase().includes('export')) {
            button.addEventListener('click', () => {
                const tabPanel = button.closest('[role="tabpanel"]');
                const printContent = tabPanel.cloneNode(true);

                // Remove buttons and inputs from print view
                printContent.querySelectorAll('button, input').forEach(el => el.remove());

                // Create print window
                const printWindow = window.open('', '_blank');
                printWindow.document.write(
                    `<html>
                        <head>
                            <title>Print Report</title>
                            <link href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css" rel="stylesheet">
                            <style>
                                @media print {
                                    body { padding: 20px; }
                                    table { border-collapse: collapse; width: 100%; }
                                    th, td { border: 1px solid #000; padding: 8px; }
                                    button, input { display: none !important; }
                                }
                            </style>
                        </head>
                        <body class="p-8">
                            <div class="max-w-4xl mx-auto">
                                ${printContent.outerHTML}
                            </div>
                        </body>
                    </html>`
                );
                printWindow.document.close();
                setTimeout(() => {
                    printWindow.print();
                    printWindow.close();
                }, 250);
            });
        }
    });

    // Set initial active tab
    document.getElementById('monthly-tab').click();
});


