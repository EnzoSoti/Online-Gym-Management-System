document.addEventListener('DOMContentLoaded', function() {
    const POLLING_INTERVAL = 5000; // 5 seconds
    let activeTabId = 'monthly';
    let lastPolledData = {
        monthly: null,
        supplements: null
    };
    let notificationPermission = false;

    // Request notification permission on load
    async function requestNotificationPermission() {
        try {
            if ('Notification' in window) {
                const permission = await Notification.requestPermission();
                notificationPermission = permission === 'granted';
            }
        } catch (error) {
            console.error('Notification permission error:', error);
        }
    }

    // Notification function
    function sendNotification(tabId, changes) {
        const tabNames = {
            monthly: 'Monthly Members',
            supplements: 'Supplements'
        };

        const title = `${tabNames[tabId]} Updated`;
        const message = `${changes.added ? `Added: ${changes.added} items\n` : ''}${changes.removed ? `Removed: ${changes.removed} items\n` : ''}${changes.modified ? `Modified: ${changes.modified} items` : ''}`;

        if (notificationPermission && 'Notification' in window) {
            // Browser notification
            new Notification(title, {
                body: message,
                icon: '/path/to/your/icon.png', // Add your notification icon path
                tag: 'data-update'
            });
        } else {
            // Fallback to SweetAlert2 toast
            Swal.fire({
                toast: true,
                position: 'top-end',
                title: title,
                text: message,
                icon: 'info',
                showConfirmButton: false,
                timer: 3000,
                timerProgressBar: true
            });
        }
    }

    // Function to detect specific changes in data
    function detectChanges(newData, oldData) {
        if (!oldData) return { added: newData.length };

        const changes = {
            added: 0,
            removed: 0,
            modified: 0
        };

        // Create maps for easier comparison
        const oldMap = new Map(oldData.map(item => [item.id, item]));
        const newMap = new Map(newData.map(item => [item.id, item]));

        // Check for added and modified items
        newMap.forEach((newItem, id) => {
            if (!oldMap.has(id)) {
                changes.added++;
            } else {
                const oldItem = oldMap.get(id);
                if (JSON.stringify(oldItem) !== JSON.stringify(newItem)) {
                    changes.modified++;
                }
            }
        });

        // Check for removed items
        oldMap.forEach((_, id) => {
            if (!newMap.has(id)) {
                changes.removed++;
            }
        });

        return changes;
    }

    // Function to generate unique IDs
    function generateUniqueId(prefix) {
        return `${prefix}${Date.now()}${Math.floor(Math.random() * 1000)}`;
    }

    // Function to format date to YYYY-MM-DD
    function formatDate(date) {
        return new Date(date).toISOString().split('T')[0];
    }

    // Function to compare data for changes
    function hasDataChanged(newData, lastData) {
        return JSON.stringify(newData) !== JSON.stringify(lastData);
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
                    <td class="px-6 py-4 whitespace-nowrap">${formData.get('type')}</td>
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

    // Polling function for active tab
    function startPolling() {
        setInterval(async () => {
            // Poll both tabs regardless of which is active
            await Promise.all([
                fetchDataForTab('monthly', true),
                fetchDataForTab('supplements', true)
            ]);
        }, POLLING_INTERVAL);
    }

    // Tab functionality
    const tabButtons = document.querySelectorAll('[role="tab"]');
    const tabPanels = document.querySelectorAll('[role="tabpanel"]');

    tabButtons.forEach(button => {
        const targetId = button.getAttribute('data-tabs-target').substring(1);
        button.setAttribute('aria-controls', targetId);

        button.addEventListener('click', () => {
            activeTabId = targetId;
            
            tabButtons.forEach(btn => {
                btn.classList.remove('border-blue-600');
                btn.classList.add('border-transparent');
                btn.setAttribute('aria-selected', 'false');
            });

            tabPanels.forEach(panel => {
                panel.classList.add('hidden');
            });

            button.classList.remove('border-transparent');
            button.classList.add('border-blue-600');
            button.setAttribute('aria-selected', 'true');

            const targetPanel = document.getElementById(targetId);
            targetPanel.classList.remove('hidden');

            fetchDataForTab(targetId, false);
        });
    });

    // Function to fetch data for a specific tab
    async function fetchDataForTab(tabId, isPolling = false) {
        let endpoint;
        switch (tabId) {
            case 'monthly':
                endpoint = 'http://localhost:3000/api/sales-reports/monthly-members';
                break;
            case 'supplements':
                endpoint = 'http://localhost:3000/api/sales-reports/supplements';
                break;
            default:
                return;
        }

        try {
            const response = await fetch(endpoint);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();

            if (!isPolling || hasDataChanged(data, lastPolledData[tabId])) {
                const changes = detectChanges(data, lastPolledData[tabId]);
                
                // Only send notification if there are actual changes
                if (changes.added || changes.removed || changes.modified) {
                    sendNotification(tabId, changes);
                }

                lastPolledData[tabId] = data;
                if (tabId === activeTabId) {
                    populateTable(tabId, data);
                }
            }
        } catch (error) {
            console.error('Error fetching data:', error);
        }
    }

    // Function to populate table with fetched data
    function populateTable(tabId, data) {
        const tableBody = document.querySelector(`#${tabId}-members-table`);
        if (!tableBody) return;

        const scrollPos = tableBody.parentElement.scrollTop;
        tableBody.innerHTML = '';

        data.forEach(item => {
            const newRow = document.createElement('tr');
            switch (tabId) {
                case 'monthly':
                    newRow.innerHTML = `
                        <td class="px-6 py-4 whitespace-nowrap">MMR#${item.id}</td>
                        <td class="px-6 py-4 whitespace-nowrap">${item.member_name}</td>
                        <td class="px-6 py-4 whitespace-nowrap">${item.type}</td>
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

        tableBody.parentElement.scrollTop = scrollPos;
    }

    // Handle export/print functionality
    // Find and replace the existing export button event listener code
document.querySelectorAll('button').forEach(button => {
    if (button.textContent.toLowerCase().includes('export')) {
        button.addEventListener('click', () => {
            const tabPanel = button.closest('[role="tabpanel"]');
            const tableContent = tabPanel.querySelector('table').cloneNode(true);
            
            // Calculate total amount
            let totalAmount = 0;
            tableContent.querySelectorAll('tbody tr').forEach(row => {
                const amountCell = row.querySelector('td:last-child');
                if (amountCell) {
                    const amount = parseFloat(amountCell.textContent.replace('₱', '').replace(',', ''));
                    if (!isNaN(amount)) {
                        totalAmount += amount;
                    }
                }
            });

            // Format current date
            const currentDate = new Date().toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });

            // Add total row to table
            const totalRow = document.createElement('tr');
            totalRow.className = 'total-row';
            const colSpan = tableContent.querySelectorAll('thead th').length - 1;
            totalRow.innerHTML = `
                <td colspan="${colSpan}" style="text-align: right; font-weight: bold;">Total Amount:</td>
                <td style="text-align: left; font-weight: bold;">₱${totalAmount.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</td>
            `;
            tableContent.querySelector('tbody').appendChild(totalRow);

            const printWindow = window.open('', '_blank');
            printWindow.document.write(`
                <html>
                    <head>
                        <title>Fitworx GYM - Sales Report</title>
                        <style>
                            @media print {
                                body { 
                                    padding: 20px;
                                    font-family: Arial, sans-serif;
                                }
                                .header {
                                    text-align: center;
                                    margin-bottom: 30px;
                                }
                                .header h1 {
                                    font-size: 24px;
                                    margin: 0;
                                }
                                .header p {
                                    margin: 5px 0;
                                }
                                table { 
                                    border-collapse: collapse; 
                                    width: 100%;
                                    margin: 20px 0;
                                }
                                th, td { 
                                    border: 1px solid #000; 
                                    padding: 8px; 
                                }
                                .total-row {
                                    font-weight: bold;
                                    background-color: #f0f0f0;
                                }
                                .footer {
                                    margin-top: 50px;
                                    display: flex;
                                    justify-content: space-between;
                                    align-items: flex-end;
                                }
                                .prepared-by {
                                    text-align: center;
                                }
                                .signature-line {
                                    border-top: 1px solid #000;
                                    width: 200px;
                                    margin-bottom: 5px;
                                }
                                .page-number {
                                    position: fixed;
                                    bottom: 20px;
                                    right: 20px;
                                }
                            }
                        </style>
                    </head>
                    <body>
                        <div class="max-w-4xl mx-auto">
                            <div class="header">
                                <h1>Fitworx GYM</h1>
                                <p>Q28V+QMG, Capt. F. S. Samano, Caloocan, Metro Manila</p>
                                <p>0933 874 5377</p>
                                <h2>Daily Sales Report</h2>
                                <p>As of ${currentDate}</p>
                            </div>
                            
                            <div class="content">
                                ${tableContent.outerHTML}
                            </div>

                            <div class="footer">
                                <div class="prepared-by">
                                    <div class="signature-line"></div>
                                    <p>Prepared By</p>
                                </div>
                                <p>Printed Date: ${currentDate}</p>
                            </div>

                            <div class="page-number"></div>
                        </div>

                        <script>
                            // Add page numbers
                            const pages = document.querySelectorAll('.page-number');
                            pages.forEach((page, index) => {
                                page.textContent = 'Page ' + (index + 1);
                            });
                        </script>
                    </body>
                </html>
            `);
            printWindow.document.close();
            
            setTimeout(() => {
                printWindow.print();
                printWindow.close();
            }, 250);
        });
    }
});

    // Initialize
    requestNotificationPermission();
    document.getElementById('monthly-tab').click();
    startPolling();
});