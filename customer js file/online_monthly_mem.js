document.addEventListener('DOMContentLoaded', function() {
    const subscriptionFormBtn = document.getElementById('subscription-form');
    if (subscriptionFormBtn) {
        subscriptionFormBtn.addEventListener('click', function(e) {
            e.preventDefault();
            showSubscriptionForm();
        });
    }
});

async function showSubscriptionForm() {
    const { value: formValues } = await Swal.fire({
        title: 'Monthly Membership Registration',
        html: `
            <div class="p-6 bg-gradient-to-b from-gray-900 to-gray-950 rounded-3xl">
                <div class="mb-6">
                    <label for="member_name" class="block text-gray-400 text-sm mb-2">Member Name</label>
                    <input type="text" id="member_name" class="w-full px-4 py-3 rounded-xl bg-gray-800 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all">
                </div>
                <div class="mb-6">
                    <label for="membership_type" class="block text-gray-400 text-sm mb-2">Membership Type</label>
                    <select id="membership_type" class="w-full px-4 py-3 rounded-xl bg-gray-800 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all">
                        <option value="Regular">Regular (950₱)</option>
                        <option value="Student">Student (850₱)</option>
                    </select>
                </div>
                <div class="mb-6">
                    <label for="start_date" class="block text-gray-400 text-sm mb-2">Start Date</label>
                    <input type="date" id="start_date" class="w-full px-4 py-3 rounded-xl bg-gray-800 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all" readonly>
                </div>
                <div class="mb-6">
                    <label for="end_date" class="block text-gray-400 text-sm mb-2">End Date</label>
                    <input type="date" id="end_date" class="w-full px-4 py-3 rounded-xl bg-gray-800 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all" readonly>
                </div>
            </div>
        `,
        confirmButtonText: 'Register',
        showCancelButton: true,
        customClass: {
            popup: 'rounded-2xl bg-gray-900 border-2 border-gray-800/50',
            confirmButton: 'bg-green-500 hover:bg-green-600 text-white font-semibold rounded-xl px-6 py-3 transition duration-300',
            cancelButton: 'bg-gray-800 hover:bg-gray-700 text-gray-300 font-semibold rounded-xl px-6 py-3 transition duration-300 border border-gray-700/50',
        },
        buttonsStyling: false,
        preConfirm: () => {
            const member_name = document.getElementById('member_name').value;
            const membership_type = document.getElementById('membership_type').value;
            const start_date = document.getElementById('start_date').value;
            const end_date = document.getElementById('end_date').value;

            if (!member_name || !membership_type || !start_date || !end_date) {
                Swal.showValidationMessage('Please fill in all required fields');
                return false;
            }

            return {
                member_name,
                membership_type,
                start_date,
                end_date
            };
        },
        didOpen: () => {
            const today = new Date();
            const startDateInput = document.getElementById('start_date');
            const endDateInput = document.getElementById('end_date');

            startDateInput.value = today.toISOString().split('T')[0];
            today.setMonth(today.getMonth() + 1);
            endDateInput.value = today.toISOString().split('T')[0];
        }
    });

    if (formValues) {
        const { member_name, membership_type, start_date, end_date } = formValues;
        const expectedAmount = membership_type === 'Regular' ? 950 : 850;
        const paymentResult = await showPaymentDialogCustomer(expectedAmount, membership_type);
        
        if (paymentResult) {
            await addMemberToDatabase(member_name, 'Active', membership_type, start_date, end_date, expectedAmount);
        }
    }
}

async function showPaymentDialogCustomer(expectedAmount, membershipType) {
    const { isConfirmed, value: paymentDetails } = await Swal.fire({
        title: 'Payment Details',
        html: `
            <div class="p-6 bg-gradient-to-b from-gray-900 to-gray-950 rounded-3xl">
                <div class="mb-6 text-center">
                    <h3 class="text-xl font-bold text-white mb-2">Total Amount for ${membershipType} Membership: ₱${expectedAmount}</h3>
                    <p class="text-gray-400">Please enter your GCash transaction information</p>
                </div>
                <div class="mb-6">
                    <label for="gcash_ref" class="block text-gray-400 text-sm mb-2">GCash Reference Number</label>
                    <input type="text" id="gcash_ref" class="w-full px-4 py-3 rounded-xl bg-gray-800 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all">
                </div>
                <div class="mb-6">
                    <label for="gcash_name" class="block text-gray-400 text-sm mb-2">Account Name</label>
                    <input type="text" id="gcash_name" class="w-full px-4 py-3 rounded-xl bg-gray-800 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all">
                </div>
                <div class="mb-6">
                    <label for="amount_paid" class="block text-gray-400 text-sm mb-2">Amount Paid</label>
                    <input type="number" id="amount_paid" class="w-full px-4 py-3 rounded-xl bg-gray-800 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all">
                </div>
            </div>
        `,
        confirmButtonText: 'Confirm Payment',
        showCancelButton: true,
        customClass: {
            popup: 'rounded-2xl bg-gray-900 border-2 border-gray-800/50',
            confirmButton: 'bg-green-500 hover:bg-green-600 text-white font-semibold rounded-xl px-6 py-3 transition duration-300',
            cancelButton: 'bg-gray-800 hover:bg-gray-700 text-gray-300 font-semibold rounded-xl px-6 py-3 transition duration-300 border border-gray-700/50',
        },
        buttonsStyling: false,
        preConfirm: () => {
            const gcash_ref = document.getElementById('gcash_ref').value;
            const gcash_name = document.getElementById('gcash_name').value;
            const amount_paid = Number(document.getElementById('amount_paid').value);

            if (!gcash_ref || !gcash_name || !amount_paid) {
                Swal.showValidationMessage('Please fill in all GCash payment details');
                return false;
            }

            if (amount_paid !== expectedAmount) {
                Swal.showValidationMessage(`Please pay the exact amount of ₱${expectedAmount} for ${membershipType} membership`);
                return false;
            }

            return {
                gcash_ref,
                gcash_name,
                amount: amount_paid
            };
        }
    });

    return isConfirmed ? paymentDetails : null;
}

async function addMemberToDatabase(member_name, status, type, start_date, end_date, amount) {
    try {
        const response = await fetch(`${API_BASE_URL}/monthly-members/customer`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                member_name,
                status,
                type,
                start_date,
                end_date,
                amount
            })
        });

        const data = await response.json();
        if (response.ok) {
            Swal.fire({
                title: 'Success!',
                text: 'Member added successfully',
                icon: 'success',
                confirmButtonText: 'OK',
                customClass: {
                    popup: 'rounded-2xl bg-gray-900 border-2 border-gray-800/50',
                    confirmButton: 'bg-green-500 hover:bg-green-600 text-white font-semibold rounded-xl px-6 py-3 transition duration-300',
                },
                buttonsStyling: false
            });
        } else {
            Swal.fire({
                title: 'Error!',
                text: data.error || 'Failed to add member',
                icon: 'error',
                confirmButtonText: 'OK',
                customClass: {
                    popup: 'rounded-2xl bg-gray-900 border-2 border-gray-800/50',
                    confirmButton: 'bg-red-500 hover:bg-red-600 text-white font-semibold rounded-xl px-6 py-3 transition duration-300',
                },
                buttonsStyling: false
            });
        }
    } catch (error) {
        console.error('Error adding member:', error);
        Swal.fire({
            title: 'Error!',
            text: 'Failed to add member',
            icon: 'error',
            confirmButtonText: 'OK',
            customClass: {
                popup: 'rounded-2xl bg-gray-900 border-2 border-gray-800/50',
                confirmButton: 'bg-red-500 hover:bg-red-600 text-white font-semibold rounded-xl px-6 py-3 transition duration-300',
            },
            buttonsStyling: false
        });
    }
}