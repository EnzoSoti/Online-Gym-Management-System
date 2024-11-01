document.addEventListener('DOMContentLoaded', function() {
    const supplementsTableBody = document.getElementById('supplementsTableBody');
    const buyModal = document.getElementById('buyModal');
    const closeModalBtn = document.getElementById('closeModalBtn');
    const buyForm = document.getElementById('buyForm');
    const searchInput = document.getElementById('searchInput');
    
    const productIdInput = document.getElementById('productId');
    const productNameInput = document.getElementById('productName');
    const productPriceInput = document.getElementById('productPrice');
    const productStockInput = document.getElementById('productStock');
    const productQuantityInput = document.getElementById('productQuantity');
    const totalPriceInput = document.getElementById('totalPrice');

    let supplements = []; // Store all supplements data
    let lastFetchTimestamp = 0; // Track last fetch time
    const POLLING_INTERVAL = 5000; // Check for updates every 5 seconds

    // Fetch and display supplements with timestamp comparison
    async function fetchSupplements(isInitialLoad = false) {
        try {
            const response = await fetch('http://localhost:3000/api/supplements');
            const newSupplements = await response.json();
            
            // Compare data to check for changes
            const hasChanges = JSON.stringify(supplements) !== JSON.stringify(newSupplements);
            
            if (hasChanges || isInitialLoad) {
                supplements = newSupplements;
                displaySupplements(supplements);
                
                // If there are changes and it's not the initial load, show a notification
                if (!isInitialLoad && hasChanges) {
                    Swal.fire({
                        toast: true,
                        position: 'top-end',
                        icon: 'info',
                        title: 'Inventory updated!',
                        showConfirmButton: false,
                        timer: 2000
                    });
                }
            }
            
            lastFetchTimestamp = Date.now();
        } catch (error) {
            console.error('Error fetching supplements:', error);
            Swal.fire('Error', 'Failed to fetch supplements', 'error');
        }
    }

    // Start polling for updates
    function startPolling() {
        setInterval(async () => {
            // Only fetch if the modal is not open
            if (buyModal.classList.contains('hidden')) {
                await fetchSupplements();
            }
        }, POLLING_INTERVAL);
    }

    // Display supplements in the table
    function displaySupplements(supplementsToDisplay) {
        supplementsTableBody.innerHTML = supplementsToDisplay.map(supplement => `
            <tr>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-slate-900">PRDC#${supplement.id}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-slate-900">${supplement.supplement_name}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-slate-900">${supplement.quantity}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-slate-900">₱${supplement.price}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm">
                    <button class="buy-button px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all duration-200 ${supplement.quantity === 0 ? 'opacity-50 cursor-not-allowed' : ''}"
                            data-supplement-id="${supplement.id}"
                            data-supplement-name="${supplement.supplement_name}"
                            data-supplement-price="${supplement.price}"
                            data-supplement-stock="${supplement.quantity}"
                            ${supplement.quantity === 0 ? 'disabled' : ''}>
                        ${supplement.quantity === 0 ? 'Out of Stock' : 'Buy'}
                    </button>
                </td>
            </tr>
        `).join('');

        // Add event listeners to new buy buttons
        document.querySelectorAll('.buy-button').forEach(button => {
            button.addEventListener('click', openBuyModal);
        });
    }

    // Open buy modal
    function openBuyModal(event) {
        const button = event.currentTarget;
        const supplementId = button.dataset.supplementId;
        const supplementName = button.dataset.supplementName;
        const supplementPrice = button.dataset.supplementPrice;
        const supplementStock = button.dataset.supplementStock;

        productIdInput.value = supplementId;
        productNameInput.value = supplementName;
        productPriceInput.value = `₱${supplementPrice}`;
        productStockInput.value = supplementStock;
        productQuantityInput.value = "1";
        productQuantityInput.max = supplementStock;
        updateTotalPrice();

        buyModal.classList.remove('hidden');
    }

    // Update total price when quantity changes
    function updateTotalPrice() {
        const quantity = parseInt(productQuantityInput.value);
        const price = parseFloat(productPriceInput.value.replace('₱', ''));
        totalPriceInput.value = `₱${(quantity * price).toFixed(2)}`;
    }

    // Handle form submission
    async function handlePurchase(event) {
        event.preventDefault();
        
        const supplementId = productIdInput.value;
        const quantity = parseInt(productQuantityInput.value);
        const availableStock = parseInt(productStockInput.value);

        if (quantity > availableStock) {
            Swal.fire('Error', 'Requested quantity exceeds available stock', 'error');
            return;
        }

        try {
            const response = await fetch('http://localhost:3000/api/buy-supplement', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    supplementId: supplementId,
                    quantity: quantity
                })
            });

            if (!response.ok) {
                throw new Error('Purchase failed');
            }

            await Swal.fire('Success', 'Purchase completed successfully', 'success');
            buyModal.classList.add('hidden');
            await fetchSupplements(); // Immediate refresh after purchase
        } catch (error) {
            console.error('Error processing purchase:', error);
            Swal.fire('Error', 'Failed to process purchase', 'error');
        }
    }

    // Handle search functionality with real-time filtering
    function handleSearch(event) {
        const searchTerm = event.target.value.toLowerCase();
        const filteredSupplements = supplements.filter(supplement =>
            supplement.supplement_name.toLowerCase().includes(searchTerm)
        );
        displaySupplements(filteredSupplements);
    }

    // Event listeners
    closeModalBtn.addEventListener('click', function() {
        buyModal.classList.add('hidden');
    });

    buyForm.addEventListener('submit', handlePurchase);
    productQuantityInput.addEventListener('input', updateTotalPrice);
    searchInput.addEventListener('input', handleSearch);

    // Initial load and start polling
    fetchSupplements(true); // true indicates initial load
    startPolling();
});