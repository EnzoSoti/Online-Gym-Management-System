// Add reservation tab to the polling and tab functionality
document.addEventListener('DOMContentLoaded', function() {
    const POLLING_INTERVAL = 1000; // 5 seconds
    let activeTabId = 'monthly';
    let lastPolledData = {
        monthly: null,
        supplements: null,
        regular: null,
        student: null,
        reservations: null 
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
            supplements: 'Supplements',
            regular: 'Regular Check-ins',
            student: 'Student Check-ins',
            reservations: 'Reservations'
        };

        const title = `${tabNames[tabId]} Updated`;
        const message = `${changes.added ? `Added: ${changes.added} items\n` : ''}${changes.removed ? `Removed: ${changes.removed} items\n` : ''}${changes.modified ? `Modified: ${changes.modified} items` : ''}`;

        if (notificationPermission && 'Notification' in window) {
            new Notification(title, {
                body: message,
                icon: '/path/to/your/icon.png',
                tag: 'data-update'
            });
        } else {
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

        const oldMap = new Map(oldData.map(item => [item.id, item]));
        const newMap = new Map(newData.map(item => [item.id, item]));

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

    // Function to format datetime
    function formatDateTime(datetime) {
        return new Date(datetime).toLocaleString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    }

    // Function to compare data for changes
    function hasDataChanged(newData, lastData) {
        return JSON.stringify(newData) !== JSON.stringify(lastData);
    }

    // Polling function for active tab
    function startPolling() {
        setInterval(async () => {
            await Promise.all([
                fetchDataForTab('monthly', true),
                fetchDataForTab('supplements', true),
                fetchDataForTab('regular', true),
                fetchDataForTab('student', true),
                fetchDataForTab('reservations', true) 
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
                btn.classList.remove('bg-white', 'shadow-sm', 'text-orange-600');
                btn.classList.add('text-slate-600', 'hover:bg-white/50');
                btn.setAttribute('aria-selected', 'false');
            });

            tabPanels.forEach(panel => {
                panel.classList.add('hidden');
            });

            button.classList.remove('text-slate-600', 'hover:bg-white/50');
            button.classList.add('bg-white', 'shadow-sm', 'text-orange-600');
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
            case 'regular':
                endpoint = 'http://localhost:3000/api/check-ins/regular';
                break;
            case 'student':
                endpoint = 'http://localhost:3000/api/check-ins/student';
                break;
            case 'reservations':
                endpoint = 'http://localhost:3000/api/reservations'; 
                break;
            default:
                console.error('Invalid tab ID:', tabId);
                return;
        }

        try {
            const response = await fetch(endpoint);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            let data = await response.json();
            
            // Apply filters
            const filterElement = document.getElementById(`${tabId}-month-filter`) || 
                                document.getElementById(`${tabId}-date-filter`);
            const filterValue = filterElement?.value;
            
            if (filterValue) {
                data = filterData(data, filterValue, tabId);
            }
            
            if (!isPolling || hasDataChanged(data, lastPolledData[tabId])) {
                const changes = detectChanges(data, lastPolledData[tabId]);
                
                if (changes.added || changes.removed || changes.modified) {
                    sendNotification(tabId, changes);
                }

                lastPolledData[tabId] = data;
                populateTable(tabId, data);
            }
        } catch (error) {
            console.error(`Error fetching ${tabId} data:`, error);
        }
    }

    // Function to populate table with fetched data
function populateTable(tabId, data) {
    const tableBody = document.querySelector(`#${tabId} tbody`);
    if (!tableBody) {
        console.error(`Table body not found for ${tabId}`);
        return;
    }

    const scrollPos = tableBody.parentElement.scrollTop;
    tableBody.innerHTML = '';

    data.forEach((item, index) => {
        const newRow = document.createElement('tr');
        newRow.classList.add(
            'transition-colors', 
            'duration-200', 
            'ease-in-out',
            'hover:bg-blue-50/50',
            index % 2 === 0 ? 'bg-white' : 'bg-slate-50/30'
        );

        switch (tabId) {
            case 'monthly':
                newRow.innerHTML = `
                    <td class="px-4 py-3 text-sm font-medium text-gray-700 border-b border-gray-200">MMR#${item.id}</td>
                    <td class="px-4 py-3 text-sm text-gray-800 border-b border-gray-200">${item.member_name}</td>
                    <td class="px-4 py-3 text-sm text-gray-600 border-b border-gray-200">${item.type}</td>
                    <td class="px-4 py-3 border-b border-gray-200">
                        <span class="px-2 py-1 text-xs rounded-full ${item.status === 'Active' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'}">
                            ${item.status}
                        </span>
                    </td>
                    <td class="px-4 py-3 text-sm text-gray-600 border-b border-gray-200">${formatDate(item.start_date)}</td>
                    <td class="px-4 py-3 text-sm text-gray-600 border-b border-gray-200">${formatDate(item.end_date)}</td>
                    <td class="px-4 py-3 text-sm font-semibold text-gray-800 border-b border-gray-200">₱${item.amount || 0}</td>
                    <td class="px-4 py-3 text-sm font-semibold text-gray-800 border-b border-gray-200">₱${item.renewal_amount || 0}</td>
                `;
                break;
            case 'supplements':
                newRow.innerHTML = `
                    <td class="px-4 py-3 text-sm font-medium text-gray-700 border-b border-gray-200">PRDT#${item.id || ''}</td>
                    <td class="px-4 py-3 text-sm text-gray-800 border-b border-gray-200">${item.supplement_name || ''}</td>
                    <td class="px-4 py-3 text-sm text-gray-600 border-b border-gray-200">${item.quantity || 0}</td>
                    <td class="px-4 py-3 text-sm text-gray-800 border-b border-gray-200">₱${item.price || 0}</td>
                    <td class="px-4 py-3 text-sm text-gray-600 border-b border-gray-200">${item.quantity_sold || 0}</td>
                    <td class="px-4 py-3 text-sm font-semibold text-gray-800 border-b border-gray-200">${item.total_sales || 0}</td>
                `;
                break;
            case 'regular':
            case 'student':
                newRow.innerHTML = `
                    <td class="px-4 py-3 text-sm font-medium text-gray-700 border-b border-gray-200">CHK#${item.id}</td>
                    <td class="px-4 py-3 text-sm text-gray-600 border-b border-gray-200">${item.client_type}</td>
                    <td class="px-4 py-3 text-sm text-gray-800 border-b border-gray-200">${item.client_name}</td>
                    <td class="px-4 py-3 text-sm text-gray-600 border-b border-gray-200">${formatDateTime(item.time_in)}</td>
                    <td class="px-4 py-3 text-sm font-semibold text-gray-800 border-b border-gray-200">₱${item.amount}</td>
                `;
                break;
            case 'reservations':
                newRow.innerHTML = `
                    <td class="px-4 py-3 text-sm font-medium text-gray-700 border-b border-gray-200">RES#${item.id}</td>
                    <td class="px-4 py-3 text-sm text-gray-600 border-b border-gray-200">${item.service_type}</td>
                    <td class="px-4 py-3 text-sm text-gray-800 border-b border-gray-200">${item.customer_name}</td>
                    <td class="px-4 py-3 text-sm text-gray-600 border-b border-gray-200">${item.start_time}</td>
                    <td class="px-4 py-3 text-sm text-gray-600 border-b border-gray-200">${item.end_time}</td>
                    <td class="px-4 py-3 text-sm text-gray-600 border-b border-gray-200">${formatDate(item.reservation_date)}</td>
                    <td class="px-4 py-3 text-sm text-gray-600 border-b border-gray-200">${item.additional_members}</td>
                    <td class="px-4 py-3 text-sm font-semibold text-gray-800 border-b border-gray-200">₱${item.price}</td>
                `;
                break;
        }
        tableBody.appendChild(newRow);
    });

    tableBody.parentElement.scrollTop = scrollPos;
}

    // Handle export/print functionality
    document.querySelectorAll('button').forEach(button => {
        if (button.textContent.toLowerCase().includes('export')) {
            button.addEventListener('click', () => {
                const tabPanel = button.closest('[role="tabpanel"]');
                const tabId = tabPanel.id;
                const filterElement = document.getElementById(`${tabId}-month-filter`) || 
                                    document.getElementById(`${tabId}-date-filter`);
                const filterValue = filterElement?.value;

                const tableContent = tabPanel.querySelector('table').cloneNode(true);
                
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

                const currentDate = new Date().toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                });

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
                                    ${filterValue ? `<p>Filtered by: ${filterValue}</p>` : '<p>All Records</p>'}
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

    // Add filter-related functions
    function filterData(data, filterValue, tabId) {
        if (!filterValue) return data;

        return data.filter(item => {
            let itemDate;
            
            switch(tabId) {
                case 'monthly':
                    itemDate = new Date(item.start_date);
                    const filterDate = new Date(filterValue);
                    return itemDate.getFullYear() === filterDate.getFullYear() && 
                           itemDate.getMonth() === filterDate.getMonth();
                
                case 'supplements':
                    // For supplements, we might need to add a date field in the database
                    // For now, we'll return all data
                    return true;
                
                case 'regular':
                case 'student':
                    itemDate = new Date(item.time_in);
                    return formatDate(itemDate) === filterValue;
                
                case 'reservations':
                    itemDate = new Date(item.reservation_date);
                    return formatDate(itemDate) === filterValue;
                
                default:
                    return true;
            }
        });
    }

    function clearFilter(tabId) {
        const filterElement = document.getElementById(`${tabId}-month-filter`) || 
                            document.getElementById(`${tabId}-date-filter`);
        if (filterElement) {
            filterElement.value = '';
            fetchDataForTab(tabId, false);
        }
    }

    function addFilterControls() {
        const tabs = ['monthly', 'supplements', 'regular', 'student', 'reservations'];
        
        tabs.forEach(tabId => {
            const tabPanel = document.getElementById(tabId);
            const filterContainer = document.createElement('div');
            filterContainer.className = 'mb-4 flex gap-4 items-center';
            
            if (tabId === 'monthly' || tabId === 'supplements') {
                filterContainer.innerHTML = `
                    <div class="flex items-center gap-2">
                        <label class="text-sm font-medium text-gray-700">Filter by Month:</label>
                        <input type="month" id="${tabId}-month-filter" 
                               class="rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500">
                    </div>
                `;
            } else {
                filterContainer.innerHTML = `
                    <div class="flex items-center gap-2">
                        <label class="text-sm font-medium text-gray-700">Filter by Date:</label>
                        <input type="date" id="${tabId}-date-filter" 
                               class="rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500">
                    </div>
                `;
            }
            
            const clearButton = document.createElement('button');
            clearButton.textContent = 'Clear Filter';
            clearButton.className = 'px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded-md text-gray-600';
            clearButton.onclick = () => clearFilter(tabId);
            filterContainer.appendChild(clearButton);
            
            const table = tabPanel.querySelector('table');
            table.parentNode.insertBefore(filterContainer, table);
        });

        // Add event listeners for filter changes
        tabs.forEach(tabId => {
            const monthFilter = document.getElementById(`${tabId}-month-filter`);
            const dateFilter = document.getElementById(`${tabId}-date-filter`);

            if (monthFilter) {
                monthFilter.addEventListener('change', () => fetchDataForTab(tabId, false));
            }
            if (dateFilter) {
                dateFilter.addEventListener('change', () => fetchDataForTab(tabId, false));
            }
        });
    }

    // Initialize
    addFilterControls();
    requestNotificationPermission();
    document.getElementById('monthly-tab').click();
    startPolling();
});