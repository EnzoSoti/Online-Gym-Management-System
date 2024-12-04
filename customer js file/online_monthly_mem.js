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
        title: '<span class="text-2xl md:text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">Online Monthly Pass</span>',
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
        title: '<span class="text-2xl md:text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">Monthly Membership Registration</span>',
        html: `
            <div class="p-4 bg-gradient-to-b from-gray-900 to-gray-950 rounded-xl">
                <div class="space-y-4">
                    <div>
                        <label for="member_name" class="text-gray-400 text-xs mb-1 block">Member Name</label>
                        <div class="relative">
                            <input type="text" id="member_name" class="w-full px-3 py-2 pl-8 rounded-lg bg-gray-800 text-white text-sm placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-blue-500/50" value="${fullName || ''}" readonly>
                            <div class="absolute inset-y-0 left-0 pl-2 flex items-center pointer-events-none">
                                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-gray-500" viewBox="0 0 20 20" fill="currentColor">
                                    <path fill-rule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clip-rule="evenodd" />
                                </svg>
                            </div>
                        </div>
                    </div>

                    <div>
                        <label for="email" class="text-gray-400 text-xs mb-1 block">Email Address</label>
                        <div class="relative">
                            <input type="email" id="email" class="w-full px-3 py-2 pl-8 rounded-lg bg-gray-800 text-white text-sm placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-blue-500/50" required>
                            <div class="absolute inset-y-0 left-0 pl-2 flex items-center pointer-events-none">
                                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-gray-500" viewBox="0 0 20 20" fill="currentColor">
                                    <path d="M2.003 5.884l7.197 4.147L16.397 5.884 2.003 5.884zM17 6.5l-7.197 4.147L2.803 6.5 17 6.5zM17 8.5l-7.197 4.147L2.803 8.5 17 8.5zM17 10.5l-7.197 4.147L2.803 10.5 17 10.5z" />
                                </svg>
                            </div>
                        </div>
                    </div>

                    <div>
                        <label for="membership_type" class="text-gray-400 text-xs mb-1 block">Membership Type</label>
                        <div class="relative">
                            <select id="membership_type" class="w-full px-3 py-2 pl-8 rounded-lg bg-gray-800 text-white text-sm placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-blue-500/50">
                                <option value="Regular">Regular (950₱)</option>
                                <option value="Student">Student (850₱)</option>
                            </select>
                            <div class="absolute inset-y-0 left-0 pl-2 flex items-center pointer-events-none">
                                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-gray-500" viewBox="0 0 20 20" fill="currentColor">
                                    <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
                                </svg>
                            </div>
                        </div>
                    </div>

                    <div id="student-id-picture-field" style="display: none;" class="mb-4">
                        <label for="school_id_picture" class="text-gray-400 text-xs mb-1 block">Student ID Picture</label>
                        <div class="relative">
                            <input type="file" id="school_id_picture" class="w-full px-3 py-2 pl-8 rounded-lg bg-gray-800 text-white text-sm placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-blue-500/50">
                            <div class="absolute inset-y-0 left-0 pl-2 flex items-center pointer-events-none">
                                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-gray-500" viewBox="0 0 20 20" fill="currentColor">
                                    <path fill-rule="evenodd" d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a1 1 0 110 2h-3a1 1 0 01-1-1v-2a1 1 0 00-1-1H9a1 1 0 00-1 1v2a1 1 0 01-1 1H4a1 1 0 110-2V4zm3 1h2v2H7V5zm2 4H7v2h2V9zm2-4h2v2h-2V5zm2 4h-2v2h2V9z" clip-rule="evenodd" />
                                </svg>
                            </div>
                        </div>
                    </div>

                    <div>
                        <label for="profile_picture" class="text-gray-400 text-xs mb-1 block">Profile Picture</label>
                        <div class="relative">
                            <input type="file" id="profile_picture" class="w-full px-3 py-2 pl-8 rounded-lg bg-gray-800 text-white text-sm placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-blue-500/50">
                            <div class="absolute inset-y-0 left-0 pl-2 flex items-center pointer-events-none">
                                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-gray-500" viewBox="0 0 20 20" fill="currentColor">
                                    <path fill-rule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clip-rule="evenodd" />
                                </svg>
                            </div>
                        </div>
                    </div>

                    <div>
                        <label for="start_date" class="text-gray-400 text-xs mb-1 block">Start Date</label>
                        <div class="relative">
                            <input type="date" id="start_date" class="w-full px-3 py-2 pl-8 rounded-lg bg-gray-800 text-white text-sm placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-blue-500/50" readonly>
                            <div class="absolute inset-y-0 left-0 pl-2 flex items-center pointer-events-none">
                                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-gray-500" viewBox="0 0 20 20" fill="currentColor">
                                    <path fill-rule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clip-rule="evenodd" />
                                </svg>
                            </div>
                        </div>
                    </div>

                    <div>
                        <label for="end_date" class="text-gray-400 text-xs mb-1 block">End Date</label>
                        <div class="relative">
                            <input type="date" id="end_date" class="w-full px-3 py-2 pl-8 rounded-lg bg-gray-800 text-white text-sm placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-blue-500/50" readonly>
                            <div class="absolute inset-y-0 left-0 pl-2 flex items-center pointer-events-none">
                                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-gray-500" viewBox="0 0 20 20" fill="currentColor">
                                    <path fill-rule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clip-rule="evenodd" />
                                </svg>
                            </div>
                        </div>
                    </div>
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
        title: '<span class="text-2xl md:text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">Payment Details</span>',
        html: `
            <div class="p-4 bg-gradient-to-b from-gray-900 to-gray-950 rounded-xl">
                <div class="text-center mb-4">
                    <h3 class="text-lg font-bold text-white">Total for ${membershipType}: ₱${expectedAmount}</h3>
                    <p class="text-gray-400">Scan QR code below via GCash</p>
                </div>
                <div class="mb-4 text-center">
                    <img src="../img/photo_2024-11-30_21-50-23.jpg" alt="GCash QR Code" class="mx-auto w-48 h-48 rounded-lg">
                </div>
                <div class="text-center text-white mb-4">
                    <p>Account: Enzo Daniela</p>
                    <p>Number: 09633226873</p>
                </div>
                <div class="mb-4">
                    <label for="gcash_ref" class="block text-gray-400 text-xs mb-1">GCash Ref. No.</label>
                    <div class="relative">
                        <input type="text" id="gcash_ref" class="w-full px-3 py-2 pl-8 rounded-lg bg-gray-800 text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-blue-500/50">
                        <div class="absolute inset-y-0 left-0 pl-2 flex items-center pointer-events-none">
                            <svg class="h-4 w-4 text-gray-500" viewBox="0 0 20 20" fill="currentColor">
                                <path fill-rule="evenodd" d="M2 5a2 2 0 012-2h12a2 2 0 012 2v10a2 2 0 01-2 2H4a2 2 0 01-2-2V5zm14 0H4v10h12V5zm-2 2a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clip-rule="evenodd" />
                            </svg>
                        </div>
                    </div>
                </div>
                <div class="mb-4">
                    <label for="gcash_name" class="block text-gray-400 text-xs mb-1">Account Name</label>
                    <div class="relative">
                        <input type="text" id="gcash_name" class="w-full px-3 py-2 pl-8 rounded-lg bg-gray-800 text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-blue-500/50">
                        <div class="absolute inset-y-0 left-0 pl-2 flex items-center pointer-events-none">
                            <svg class="h-4 w-4 text-gray-500" viewBox="0 0 20 20" fill="currentColor">
                                <path fill-rule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clip-rule="evenodd" />
                            </svg>
                        </div>
                    </div>
                </div>
                <div class="mb-4">
                    <label for="amount_paid" class="block text-gray-400 text-xs mb-1">Amount Paid</label>
                    <div class="relative">
                        <input type="number" id="amount_paid" class="w-full px-3 py-2 pl-8 rounded-lg bg-gray-800 text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-blue-500/50">
                        <div class="absolute inset-y-0 left-0 pl-2 flex items-center pointer-events-none">
                            <svg class="h-4 w-4 text-gray-500" viewBox="0 0 20 20" fill="currentColor">
                                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clip-rule="evenodd" />
                            </svg>
                        </div>
                    </div>
                </div>
            </div>
        `,
        confirmButtonText: 'Submit Payment Details',
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
                    <div style="text-align: center;">
                        <p>Member added successfully.</p>
                        <p>Please wait for admin verification.</p>
                        <div class="bg-blue-100 border-l-4 border-blue-500 p-4 mt-4 rounded-lg">
                            <p class="text-blue-700 font-medium">
                                <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 inline-block mr-2 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                </svg>
                                An email will be sent to your provided address upon account verification.
                            </p>
                        </div>
                    </div>
                `,
                icon: 'info',
                confirmButtonText: 'Got It',
                customClass: {
                    popup: 'rounded-2xl bg-gray-900 border-2 border-gray-800/50',
                    title: 'text-xl font-bold text-blue-400',
                    content: 'text-gray-300',
                    confirmButton: 'bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-xl px-6 py-3 transition duration-300 mt-4',
                },
                buttonsStyling: false,
                backdrop: 'rgba(0,0,0,0.7)',
                grow: true,
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