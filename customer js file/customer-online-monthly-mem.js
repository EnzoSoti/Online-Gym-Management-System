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
            <div class="p-4">
                <h3 class="text-xl font-bold mb-4 text-center flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 mr-2 text-blue-500" viewBox="0 0 20 20" fill="currentColor">
                        <path fill-rule="evenodd" d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z" clip-rule="evenodd" />
                    </svg>
                    Payment Policy
                </h3>
                
                <div class="bg-gray-50 rounded p-4 mb-4 border">
                    <p class="text-gray-600 mb-4 italic">Before proceeding with your registration, please carefully review our payment guidelines:</p>
                    <div class="space-y-3 pl-4 border-l-2 border-blue-400">
                        <div class="flex items-start">
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2 text-blue-500 flex-shrink-0 mt-1" viewBox="0 0 20 20" fill="currentColor">
                                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.707l-3-3a1 1 0 00-1.414 1.414L10.586 9H7a1 1 0 100 2h3.586l-1.293 1.293a1 1 0 101.414 1.414l3-3a1 1 0 000-1.414z" clip-rule="evenodd" />
                            </svg>
                            <span class="text-gray-600">Payment must be made through <span class="font-semibold text-blue-600">GCash</span> before registration completion</span>
                        </div>
                        <div class="flex items-start">
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2 text-blue-500 flex-shrink-0 mt-1" viewBox="0 0 20 20" fill="currentColor">
                                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.707l-3-3a1 1 0 00-1.414 1.414L10.586 9H7a1 1 0 100 2h3.586l-1.293 1.293a1 1 0 101.414 1.414l3-3a1 1 0 000-1.414z" clip-rule="evenodd" />
                            </svg>
                            <span class="text-gray-600">Membership Rates: 
                                <span class="font-semibold text-blue-600">Regular ₱950</span> | 
                                <span class="font-semibold text-blue-600">Student ₱850</span>
                            </span>
                        </div>
                        <div class="flex items-start">
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2 text-blue-500 flex-shrink-0 mt-1" viewBox="0 0 20 20" fill="currentColor">
                                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.707l-3-3a1 1 0 00-1.414 1.414L10.586 9H7a1 1 0 100 2h3.586l-1.293 1.293a1 1 0 101.414 1.414l3-3a1 1 0 000-1.414z" clip-rule="evenodd" />
                            </svg>
                            <span class="text-gray-600">Membership activates only after <span class="font-semibold text-blue-600">payment verification</span></span>
                        </div>
                        <div class="flex items-start">
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2 text-blue-500 flex-shrink-0 mt-1" viewBox="0 0 20 20" fill="currentColor">
                                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.707l-3-3a1 1 0 00-1.414 1.414L10.586 9H7a1 1 0 100 2h3.586l-1.293 1.293a1 1 0 101.414 1.414l3-3a1 1 0 000-1.414z" clip-rule="evenodd" />
                            </svg>
                            <span class="text-gray-600">Prepare your <span class="font-semibold text-blue-600">GCash reference number</span> for verification</span>
                        </div>
                        <div class="flex items-start">
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2 text-red-500 flex-shrink-0 mt-1" viewBox="0 0 20 20" fill="currentColor">
                                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
                            </svg>
                            <span class="text-red-600">No refunds for incomplete or invalid payments</span>
                        </div>
                    </div>
                </div>
                
                <div class="flex items-center space-x-3 bg-gray-50 p-3 rounded border">
                    <input type="checkbox" id="policy-agreement" class="w-4 h-4 rounded border-gray-300 text-blue-500">
                    <label for="policy-agreement" class="text-gray-600">
                        I have read and agree to the payment policy
                    </label>
                </div>
            </div>
        `,
        confirmButtonText: 'Proceed to Registration',
        showCancelButton: true,
        customClass: {
            popup: 'rounded'
        },
        buttonsStyling: true,  // Enable default SweetAlert button styling
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
            <div class="p-4">
                <div class="space-y-3">
                    <div>
                        <label for="member_name" class="text-sm mb-1 block">Member Name</label>
                        <input type="text" id="member_name" class="w-full px-3 py-2 rounded border" value="${fullName || ''}" readonly>
                    </div>
    
                    <div>
                        <label for="email" class="text-sm mb-1 block">Email Address</label>
                        <input type="email" id="email" class="w-full px-3 py-2 rounded border" required>
                    </div>
    
                    <div>
                        <label for="membership_type" class="text-sm mb-1 block">Membership Type</label>
                        <select id="membership_type" class="w-full px-3 py-2 rounded border">
                            <option value="Regular">Regular (950₱)</option>
                            <option value="Student">Student (850₱)</option>
                        </select>
                    </div>
    
                    <div id="student-id-picture-field" style="display: none;">
                        <label for="school_id_picture" class="text-sm mb-1 block">Student ID Picture</label>
                        <input type="file" id="school_id_picture" class="w-full px-3 py-2 rounded border">
                    </div>
    
                    <div>
                        <label for="profile_picture" class="text-sm mb-1 block">Profile Picture</label>
                        <input type="file" id="profile_picture" class="w-full px-3 py-2 rounded border">
                    </div>
    
                    <div>
                        <label for="start_date" class="text-sm mb-1 block">Start Date</label>
                        <input type="date" id="start_date" class="w-full px-3 py-2 rounded border" readonly>
                    </div>
    
                    <div>
                        <label for="end_date" class="text-sm mb-1 block">End Date</label>
                        <input type="date" id="end_date" class="w-full px-3 py-2 rounded border" readonly>
                    </div>
                </div>
            </div>
        `,
        confirmButtonText: 'Register',
        showCancelButton: true,
        customClass: {
            popup: 'rounded',
            confirmButton: 'bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded',
            cancelButton: 'bg-gray-300 hover:bg-gray-400 text-gray-700 px-4 py-2 rounded'
        },
        buttonsStyling: false,
        preConfirm: () => {
            const member_name = document.getElementById('member_name').value;
            const email = document.getElementById('email').value;
            const membership_type = document.getElementById('membership_type').value;
            const start_date = document.getElementById('start_date').value;
            const end_date = document.getElementById('end_date').value;
            const school_id_picture = document.getElementById('school_id_picture').files[0];
            const profile_picture = document.getElementById('profile_picture').files[0];

            if (!member_name || !email || !membership_type || !start_date || !end_date) {
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
                email,
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
        const { member_name, email, membership_type, start_date, end_date, school_id_picture, profile_picture } = formValues;
        const expectedAmount = membership_type === 'Regular' ? 950 : 850;
        const paymentResult = await showPaymentDialogCustomer(expectedAmount, membership_type);
        
        if (paymentResult) {
            const formData = new FormData();
            formData.append('member_name', member_name);
            formData.append('email', email);
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

            await addMemberToDatabase(formData, paymentResult);
        }
    }
}

async function showPaymentDialogCustomer(expectedAmount, membershipType) {
    const { isConfirmed, value: paymentDetails } = await Swal.fire({
        title: 'Payment Details',
        html: `
            <div class="p-4">
                <div class="text-center mb-4">
                    <h3 class="text-lg font-bold">Total for ${membershipType}: ₱${expectedAmount}</h3>
                    <p class="text-sm">Scan QR code below via GCash</p>
                </div>
                
                <div class="mb-6 flex justify-center">
                    <div class="p-4 bg-gray-100 rounded">
                        <img 
                            src="../img/photo_2024-11-30_21-50-23.jpg" 
                            alt="GCash QR Code" 
                            class="mx-auto w-64 h-64 rounded object-cover"
                        >
                    </div>
                </div>
                
                <div class="text-center mb-4">
                    <p>Account: Enzo Daniela</p>
                    <p>Number: 09633226873</p>
                </div>
                
                <div class="space-y-3">
                    <div>
                        <label for="gcash_ref" class="block text-sm mb-1">GCash Ref. No.</label>
                        <input type="text" id="gcash_ref" 
                            class="w-full px-3 py-2 rounded border" 
                            placeholder="Enter reference number"
                        >
                    </div>
                    
                    <div>
                        <label for="gcash_name" class="block text-sm mb-1">Account Name</label>
                        <input type="text" id="gcash_name" 
                            class="w-full px-3 py-2 rounded border" 
                            placeholder="Enter account name"
                        >
                    </div>
                    
                    <div>
                        <label for="amount_paid" class="block text-sm mb-1">Amount Paid</label>
                        <input type="number" id="amount_paid" 
                            class="w-full px-3 py-2 rounded border" 
                            placeholder="Enter amount"
                        >
                    </div>
                </div>
            </div>
        `,
        confirmButtonText: 'Submit Payment Details',
        showCancelButton: true,
        customClass: {
            popup: 'rounded',
            confirmButton: 'bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded',
            cancelButton: 'bg-gray-300 hover:bg-gray-400 text-gray-700 px-4 py-2 rounded'
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

async function addMemberToDatabase(formData, paymentDetails) {
    try {
        formData.append('gcash_ref', paymentDetails.gcash_ref);
        formData.append('gcash_name', paymentDetails.gcash_name);
        formData.append('amount_paid', paymentDetails.amount);

        const response = await fetch(`${API_BASE_URL}/monthly-members/customer`, {
            method: 'POST',
            body: formData
        });

        const data = await response.json();
        if (response.ok) {
            playSound('success-sound');
            Swal.fire({
                title: 'Account Verification Pending',
                html: `
                    <div class="text-center">
                        <p>Member added successfully.</p>
                        <p>Please wait for admin verification.</p>
                        <div class="border-l-4 border-blue-500 p-4 mt-4">
                            <p>
                                An email will be sent to your provided address upon account verification.
                            </p>
                        </div>
                    </div>
                `,
                icon: 'info',
                confirmButtonText: 'Got It',
                customClass: {
                    popup: 'rounded',
                    title: 'text-xl',
                    confirmButton: 'bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded mt-4'
                },
                buttonsStyling: false,
                backdrop: 'rgba(0,0,0,0.4)'
            });
        }else {
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