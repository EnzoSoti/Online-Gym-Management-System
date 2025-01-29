document.addEventListener('DOMContentLoaded', function() {
    const supplementsCardsContainer = document.getElementById('supplementsCardsContainer');
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
    const POLLING_INTERVAL = 1000; // Check for updates every 1 second

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

    // Display supplements in cards
    function displaySupplements(supplementsToDisplay) {
        supplementsCardsContainer.innerHTML = supplementsToDisplay.map(supplement => `
            <div class="bg-white rounded-2xl p-5 border border-slate-100 shadow-md transition-all duration-300 hover:shadow-xl relative overflow-hidden">
                <div class="absolute top-0 right-0 ${supplement.quantity > 0 
                    ? 'bg-emerald-500 text-white' 
                    : 'bg-rose-500 text-white'} 
                    px-4 py-1.5 rounded-bl-xl text-xs font-medium tracking-wide">
                    ${supplement.quantity > 0 ? `${supplement.quantity} In Stock` : 'Sold Out'}
                </div>

                <div class="flex items-center mb-4">
                    <div class="flex-grow">
                        <h3 class="text-xl font-bold text-slate-900 mb-1">${supplement.supplement_name}</h3>
                        <p class="text-sm text-slate-500">Product ID: PRDC#${supplement.id}</p>
                    </div>
                </div>

                <div class="grid grid-cols-2 gap-2 mb-4 bg-slate-50 p-3 rounded-lg">
                    <div>
                        <span class="block text-xs text-slate-500 uppercase tracking-wider">Quantity</span>
                        <span class="text-base font-semibold ${supplement.quantity > 0 ? 'text-emerald-600' : 'text-rose-600'}">
                            ${supplement.quantity}
                        </span>
                    </div>
                    <div>
                        <span class="block text-xs text-slate-500 uppercase tracking-wider">Price</span>
                        <span class="text-base font-semibold text-slate-800">₱${supplement.price}</span>
                    </div>
                </div>

                <button class="buy-button w-full py-3 rounded-lg text-sm font-semibold uppercase tracking-wider transition-all duration-300 ${supplement.quantity > 0 
                    ? 'bg-orange-500 text-white hover:bg-orange-600 active:bg-orange-700' 
                    : 'bg-slate-200 text-slate-500 cursor-not-allowed'}"
                    data-supplement-id="${supplement.id}"
                    data-supplement-name="${supplement.supplement_name}"
                    data-supplement-price="${supplement.price}"
                    data-supplement-stock="${supplement.quantity}"
                    ${supplement.quantity === 0 ? 'disabled' : ''}>
                    ${supplement.quantity > 0 ? 'Sell Product' : 'Out of Stock'}
                </button>
            </div>
        `).join('');

        // Add event listeners to new buy buttons
        document.querySelectorAll('.buy-button').forEach(button => {
            button.addEventListener('click', openBuyModal);
        });
    }

    function openBuyModal(event) {
        const supplementId = event.target.getAttribute('data-supplement-id');
        const supplementName = event.target.getAttribute('data-supplement-name');
        const supplementPrice = event.target.getAttribute('data-supplement-price');
        const supplementStock = event.target.getAttribute('data-supplement-stock');

        // Your modal opening logic here
        console.log(`Opening modal for ${supplementName} (ID: ${supplementId})`);
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
            
                await Swal.fire({
                    title: 'Purchase Successful!',
                    text: 'Your supplement has been purchased.',
                    icon: 'success'
                });
                
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