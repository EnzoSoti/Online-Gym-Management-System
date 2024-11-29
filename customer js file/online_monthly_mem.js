document.addEventListener('DOMContentLoaded', function() {
    const subscriptionFormBtn = document.getElementById('subscription-form');
    if (subscriptionFormBtn) {
        subscriptionFormBtn.addEventListener('click', function(e) {
            e.preventDefault();
            showPolicyAgreement();
        });
    }
});

async function showPolicyAgreement() {
    const { isConfirmed } = await Swal.fire({
        title: 'Online Monthly Pass',
        html: `
            <div class="p-6 bg-gradient-to-b from-gray-900 to-gray-950 rounded-3xl">
                <h3 class="text-xl font-semibold text-white mb-4 text-center">Payment Policy</h3>
                
                <div class="text-left text-gray-300 space-y-3 mb-6">
                    <p>Before proceeding with your registration, please note our payment policy:</p>
                    <ul class="list-disc pl-6 space-y-2">
                        <li>Payment must be made through GCash before registration can be completed</li>
                        <li>Regular Membership: ₱950</li>
                        <li>Student Membership: ₱850</li>
                        <li>Your membership will only be activated after payment verification</li>
                        <li>Please prepare your GCash reference number for verification</li>
                        <li>No refunds will be issued for incomplete or invalid payments</li>
                    </ul>
                </div>
                
                <div class="flex items-center space-x-2 mb-6">
                    <input type="checkbox" id="policy-agreement" class="w-4 h-4 rounded border-gray-600 bg-gray-800 text-blue-500">
                    <label for="policy-agreement" class="text-gray-300">
                        I have read and agree to the payment policy
                    </label>
                </div>
            </div>
        `,
        confirmButtonText: 'Proceed to Registration',
        showCancelButton: true,
        customClass: {
            popup: 'rounded-2xl bg-gray-900 border-2 border-gray-800/50',
            confirmButton: 'bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-xl px-6 py-3 transition duration-300',
            cancelButton: 'bg-gray-800 hover:bg-gray-700 text-gray-300 font-semibold rounded-xl px-6 py-3 transition duration-300 border border-gray-700/50',
        },
        buttonsStyling: false,
        preConfirm: () => {
            const checkbox = document.getElementById('policy-agreement');
            if (!checkbox.checked) {
                Swal.showValidationMessage('Please agree to the payment policy to proceed');
                return false;
            }
            return true;
        }
    });

    if (isConfirmed) {
        showSubscriptionForm();
    }
}

async function showSubscriptionForm() {
    // Retrieve the full name from sessionStorage
    const fullName = sessionStorage.getItem('full_name');

    const { value: formValues } = await Swal.fire({
        title: 'Monthly Membership Registration',
        html: `
            <div class="p-6 bg-gradient-to-b from-gray-900 to-gray-950 rounded-3xl">
                <div class="mb-6">
                    <label for="member_name" class="block text-gray-400 text-sm mb-2">Member Name</label>
                    <input type="text" id="member_name" class="w-full px-4 py-3 rounded-xl bg-gray-800 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all" value="${fullName || ''}" readonly>
                </div>
                <div class="mb-6">
                    <label for="membership_type" class="block text-gray-400 text-sm mb-2">Membership Type</label>
                    <select id="membership_type" class="w-full px-4 py-3 rounded-xl bg-gray-800 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all">
                        <option value="Regular">Regular (950₱)</option>
                        <option value="Student">Student (850₱)</option>
                    </select>
                </div>
                <div id="student-id-picture-field" style="display: none;" class="mb-6">
                    <label for="school_id_picture" class="block text-gray-400 text-sm mb-2">Student ID Picture</label>
                    <input type="file" id="school_id_picture" class="w-full px-4 py-3 rounded-xl bg-gray-800 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all">
                </div>
                <div class="mb-6">
                    <label for="profile_picture" class="block text-gray-400 text-sm mb-2">Profile Picture</label>
                    <input type="file" id="profile_picture" class="w-full px-4 py-3 rounded-xl bg-gray-800 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all">
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
            const school_id_picture = document.getElementById('school_id_picture').files[0];
            const profile_picture = document.getElementById('profile_picture').files[0];

            if (!member_name || !membership_type || !start_date || !end_date) {
                playSound('error-sound');
                Swal.showValidationMessage('Please fill in all required fields');
                return false;
            }

            if (membership_type === 'Student' && !school_id_picture) {
                playSound('error-sound');
                Swal.showValidationMessage('Please upload your Student ID picture');
                return false;
            }

            if (!profile_picture) {
                playSound('error-sound');
                Swal.showValidationMessage('Please upload your Profile Picture');
                return false;
            }

            return {
                member_name,
                membership_type,
                start_date,
                end_date,
                school_id_picture,
                profile_picture
            };
        },
        didOpen: () => {
            const today = new Date();
            const startDateInput = document.getElementById('start_date');
            const endDateInput = document.getElementById('end_date');
            const membershipTypeSelect = document.getElementById('membership_type');
            const studentIdPictureField = document.getElementById('student-id-picture-field');

            startDateInput.value = today.toISOString().split('T')[0];
            today.setMonth(today.getMonth() + 1);
            endDateInput.value = today.toISOString().split('T')[0];

            membershipTypeSelect.addEventListener('change', function() {
                if (this.value === 'Student') {
                    studentIdPictureField.style.display = 'block';
                } else {
                    studentIdPictureField.style.display = 'none';
                }
            });
        }
    });

    if (formValues) {
        const { member_name, membership_type, start_date, end_date, school_id_picture, profile_picture } = formValues;
        const expectedAmount = membership_type === 'Regular' ? 950 : 850;
        const paymentResult = await showPaymentDialogCustomer(expectedAmount, membership_type);
        
        if (paymentResult) {
            const formData = new FormData();
            formData.append('member_name', member_name);
            formData.append('status', 'Pending'); // Set status to Pending
            formData.append('type', membership_type);
            formData.append('start_date', start_date);
            formData.append('end_date', end_date);
            formData.append('amount', expectedAmount);
            if (school_id_picture) {
                formData.append('school_id_picture', school_id_picture);
            }
            if (profile_picture) {
                formData.append('profile_picture', profile_picture);
            }

            await addMemberToDatabase(formData);
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

function playSound(soundId) {
    const sound = document.getElementById(soundId);
    sound.play();
}

async function addMemberToDatabase(formData) {
    try {
        const response = await fetch(`${API_BASE_URL}/monthly-members/customer`, {
            method: 'POST',
            body: formData
        });

        const data = await response.json();
        if (response.ok) {
            playSound('success-sound');
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