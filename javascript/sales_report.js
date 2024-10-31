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

            // case 'regular':
            //     const regularId = generateUniqueId('R');
            //     newRow.innerHTML = `
            //         <td class="px-6 py-4 whitespace-nowrap">${regularId}</td>
            //         <td class="px-6 py-4 whitespace-nowrap">${formData.get('name')}</td>
            //         <td class="px-6 py-4 whitespace-nowrap">${formData.get('date')}</td>
            //         <td class="px-6 py-4 whitespace-nowrap">${formData.get('timeIn')}</td>
            //         <td class="px-6 py-4 whitespace-nowrap">₱${formData.get('amount')}</td>
            //     `;
            //     break;

            // case 'student':
            //     const studentId = generateUniqueId('S');
            //     newRow.innerHTML = `
            //         <td class="px-6 py-4 whitespace-nowrap">${studentId}</td>
            //         <td class="px-6 py-4 whitespace-nowrap">${formData.get('name')}</td>
            //         <td class="px-6 py-4 whitespace-nowrap">${formData.get('schoolId')}</td>
            //         <td class="px-6 py-4 whitespace-nowrap">${formData.get('date')}</td>
            //         <td class="px-6 py-4 whitespace-nowrap">${formData.get('timeIn')}</td>
            //         <td class="px-6 py-4 whitespace-nowrap">₱${formData.get('amount')}</td>
            //     `;
            //     break;

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

            // Fetch data for the active tab
            fetchDataForTab(targetId);
        });
    });

    // Function to fetch data for a specific tab
    async function fetchDataForTab(tabId) {
        let endpoint;
        switch (tabId) {
            case 'monthly':
                endpoint = 'http://localhost:3000/api/sales-reports/monthly-members';
                break;
            // case 'regular':
            //     endpoint = '/api/sales-reports/regular-members';
            //     break;
            // case 'student':
            //     endpoint = '/api/sales-reports/student-members';
            //     break;
            case 'supplements':
                endpoint = '/api/sales-reports/supplements';
                break;
            default:
                return;
        }

        try {
            const response = await fetch(endpoint);
            const data = await response.json();
            populateTable(tabId, data);
        } catch (error) {
            console.error('Error fetching data:', error);
        }
    }

    // Function to populate table with fetched data
    function populateTable(tabId, data) {
        const tableBody = document.getElementById(`${tabId}-members-table`);
        tableBody.innerHTML = ''; // Clear existing rows

        data.forEach(item => {
            const newRow = document.createElement('tr');
            switch (tabId) {
                case 'monthly':
                    newRow.innerHTML = `
                        <td class="px-6 py-4 whitespace-nowrap">MMR#${item.id}</td>
                        <td class="px-6 py-4 whitespace-nowrap">${item.member_name}</td>
                        <td class="px-6 py-4 whitespace-nowrap">
                            <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${item.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}">
                                ${item.status}
                            </span>
                        </td>
                        <td class="px-6 py-4 whitespace-nowrap">${formatDate(item.start_date)}</td>
                        <td class="px-6 py-4 whitespace-nowrap">${formatDate(item.end_date)}</td>
                        <td class="px-6 py-4 whitespace-nowrap">₱${item.amount}</td>
                    `;
                    break;
                // case 'regular':
                //     newRow.innerHTML = `
                //         <td class="px-6 py-4 whitespace-nowrap">${item.transaction_id}</td>
                //         <td class="px-6 py-4 whitespace-nowrap">${item.name}</td>
                //         <td class="px-6 py-4 whitespace-nowrap">${formatDate(item.date)}</td>
                //         <td class="px-6 py-4 whitespace-nowrap">${item.time_in}</td>
                //         <td class="px-6 py-4 whitespace-nowrap">₱${item.amount}</td>
                //     `;
                //     break;
                // case 'student':
                //     newRow.innerHTML = `
                //         <td class="px-6 py-4 whitespace-nowrap">${item.transaction_id}</td>
                //         <td class="px-6 py-4 whitespace-nowrap">${item.student_name}</td>
                //         <td class="px-6 py-4 whitespace-nowrap">${item.school_id}</td>
                //         <td class="px-6 py-4 whitespace-nowrap">${formatDate(item.date)}</td>
                //         <td class="px-6 py-4 whitespace-nowrap">${item.time_in}</td>
                //         <td class="px-6 py-4 whitespace-nowrap">₱${item.amount}</td>
                //     `;
                //     break;
                case 'supplements':
                    newRow.innerHTML = `
                        <td class="px-6 py-4 whitespace-nowrap">${item.product_id}</td>
                        <td class="px-6 py-4 whitespace-nowrap">${item.product_name}</td>
                        <td class="px-6 py-4 whitespace-nowrap">${item.quantity_sold}</td>
                        <td class="px-6 py-4 whitespace-nowrap">₱${item.total_amount}</td>
                    `;
                    break;
            }
            tableBody.appendChild(newRow);
        });
    }

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