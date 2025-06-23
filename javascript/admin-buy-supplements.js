document.addEventListener('DOMContentLoaded', function () {

    // ========== DOM ELEMENTS ==========
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

    // ========== STATE ==========
    let supplements = [];
    const POLLING_INTERVAL = 10000;

    // ========== FETCH SUPPLEMENTS ==========
    async function fetchSupplements(isInitialLoad = false) {
        try {
            const response = await fetch('http://localhost:3000/api/supplements');
            const newSupplements = await response.json();

            const hasChanges = JSON.stringify(supplements) !== JSON.stringify(newSupplements);

            if (hasChanges || isInitialLoad) {
                supplements = newSupplements;
                displaySupplements(supplements);

                if (!isInitialLoad && hasChanges) {
                    showToast('Inventory updated!', 'info');
                }
            }
        } catch (error) {
            console.error('Error fetching supplements:', error);
            showToast('Failed to fetch supplements', 'error');
        }
    }

    // ========== POLLING ==========
    function startPolling() {
        setInterval(async () => {
            if (buyModal.classList.contains('hidden')) {
                await fetchSupplements();
            }
        }, POLLING_INTERVAL);
    }

    // ========== CARD RENDERING ==========
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

        document.querySelectorAll('.buy-button').forEach(button => {
            button.addEventListener('click', openBuyModal);
        });
    }

    // ========== OPEN BUY MODAL ==========
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

    // ========== TOTAL PRICE UPDATER ==========
    function updateTotalPrice() {
        const quantity = parseInt(productQuantityInput.value);
        const price = parseFloat(productPriceInput.value.replace('₱', ''));
        totalPriceInput.value = `₱${(quantity * price).toFixed(2)}`;
    }

    // ========== PURCHASE HANDLER ==========
    async function handlePurchase(event) {
        event.preventDefault();

        const supplementId = productIdInput.value;
        const quantity = parseInt(productQuantityInput.value);
        const availableStock = parseInt(productStockInput.value);

        if (quantity > availableStock) {
            showToast('Requested quantity exceeds available stock', 'error');
            return;
        }

        try {
            const response = await fetch('http://localhost:3000/api/buy-supplement', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ supplementId, quantity })
            });

            if (!response.ok) throw new Error('Purchase failed');

            showToast('Purchase successful!', 'success');

            buyModal.classList.add('hidden');
            await fetchSupplements();
        } catch (error) {
            console.error('Error processing purchase:', error);
            showToast('Failed to process purchase', 'error');
        }
    }

    // ========== SEARCH HANDLER ==========
    function handleSearch(event) {
        const searchTerm = event.target.value.toLowerCase();
        const filtered = supplements.filter(supplement =>
            supplement.supplement_name.toLowerCase().includes(searchTerm)
        );
        displaySupplements(filtered);
    }

    // ========== TOAST HELPER ==========
    function showToast(message, type = 'info') {
        Toastify({
            text: message,
            duration: 3000,
            gravity: 'top',
            position: 'right',
            backgroundColor: type === 'success' ? "#10B981"
                            : type === 'error' ? "#EF4444"
                            : "#3B82F6",
            stopOnFocus: true
        }).showToast();
    }

    // ========== EVENT LISTENERS ==========
    closeModalBtn.addEventListener('click', () => buyModal.classList.add('hidden'));
    buyForm.addEventListener('submit', handlePurchase);
    productQuantityInput.addEventListener('input', updateTotalPrice);
    searchInput.addEventListener('input', handleSearch);

    // ========== INIT ==========
    fetchSupplements(true);
    startPolling();
});
