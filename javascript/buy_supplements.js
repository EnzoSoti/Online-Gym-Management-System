document.addEventListener('DOMContentLoaded', function() {
    const buyButtons = document.querySelectorAll('.buy-button');
    const buyModal = document.getElementById('buyModal');
    const closeModalBtn = document.getElementById('closeModalBtn');
    const productIdInput = document.getElementById('productId');
    const productNameInput = document.getElementById('productName');
    const productPriceInput = document.getElementById('productPrice');
    const productQuantityInput = document.getElementById('productQuantity');

    buyButtons.forEach(button => {
        button.addEventListener('click', function() {
            const productId = this.getAttribute('data-product-id');
            const productName = this.getAttribute('data-product-name');
            const productPrice = this.getAttribute('data-product-price');

            productIdInput.value = productId;
            productNameInput.value = productName;
            productPriceInput.value = `$${productPrice}`;

            buyModal.classList.remove('hidden');
        });
    });

    // Add the event listener for the close button
    closeModalBtn.addEventListener('click', function() {
        buyModal.classList.add('hidden');
    });

    document.getElementById('buyForm').addEventListener('submit', function(event) {
        event.preventDefault();
        Swal.fire({
            title: 'Are you sure?',
            text: "You are about to purchase this product!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Yes, buy it!'
        }).then((result) => {
            if (result.isConfirmed) {
                // Handle form submission here (e.g., send data to server)
                Swal.fire(
                    'Purchased!',
                    'Your product has been purchased.',
                    'success'
                ).then(() => {
                    buyModal.classList.add('hidden');
                });
            }
        });
    });
});