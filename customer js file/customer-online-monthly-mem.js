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
    // Fetch HTML content from external file
    let htmlContent = '';
    
    try {
        const response = await fetch('../templates/policy-agreement.html');
        htmlContent = await response.text();
        
        // Extract just the body content (remove html, head, body tags)
        const parser = new DOMParser();
        const doc = parser.parseFromString(htmlContent, 'text/html');
        htmlContent = doc.body.innerHTML;
        
    } catch (error) {
        console.error('Error loading policy agreement HTML:', error);
        // Fallback to inline HTML if file loading fails
        htmlContent = `
            <div class="p-4 sm:p-6">
                <div class="text-center mb-6 relative">
                    <div class="bg-gradient-to-r from-orange-500 to-orange-600 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center shadow-lg">
                        <i class="fas fa-dumbbell text-white text-2xl"></i>
                    </div>
                    <h3 class="text-xl sm:text-2xl font-bold text-gray-800 mb-2">Membership Policy</h3>
                    <div class="w-24 h-1 bg-gradient-to-r from-orange-500 to-orange-600 mx-auto rounded"></div>
                </div>
                <!-- Add your fallback content here -->
                <p class="text-center text-gray-600">Error loading policy content. Please try again.</p>
            </div>
        `;
    }

    const { isConfirmed } = await Swal.fire({
        title: 'Monthly Membership',
        html: htmlContent,
        confirmButtonText: '<i class="fas fa-dumbbell mr-2"></i>Start My Journey',
        cancelButtonText: '<i class="fas fa-times mr-2"></i>Maybe Later',
        showCancelButton: true,
        customClass: {
            popup: 'rounded-2xl max-w-lg mx-auto shadow-2xl',
            confirmButton: 'bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white px-6 py-3 rounded-xl font-bold text-lg shadow-lg transform hover:scale-105 transition-all duration-200',
            cancelButton: 'bg-gray-500 hover:bg-gray-600 text-white px-6 py-3 rounded-xl font-medium shadow-lg transform hover:scale-105 transition-all duration-200 ml-3'
        },
        buttonsStyling: false,
        width: 'auto',
        backdrop: 'rgba(0,0,0,0.8)',
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

    // Fetch HTML content from external file
    let htmlContent = '';
    
    try {
        const response = await fetch('../templates/subscription-form.html');
        const fullHtml = await response.text();
        
        // Extract just the body content
        const parser = new DOMParser();
        const doc = parser.parseFromString(fullHtml, 'text/html');
        htmlContent = doc.body.innerHTML;
        
    } catch (error) {
        console.error('Error loading subscription form HTML:', error);
        // Fallback to basic HTML if file loading fails
        htmlContent = `
            <div class="p-4 sm:p-6">
                <div class="text-center mb-6">
                    <i class="fas fa-user-plus text-orange-500 text-3xl mb-2"></i>
                    <h3 class="text-xl font-bold text-gray-800">Membership Registration</h3>
                </div>
                <div class="space-y-4">
                    <div>
                        <label for="member_name" class="text-sm mb-1 block font-medium">Member Name</label>
                        <input type="text" id="member_name" class="w-full px-3 py-2 rounded border" readonly>
                    </div>
                    <div>
                        <label for="email" class="text-sm mb-1 block font-medium">Email Address</label>
                        <input type="email" id="email" class="w-full px-3 py-2 rounded border" required>
                    </div>
                    <div>
                        <label for="membership_type" class="text-sm mb-1 block font-medium">Membership Type</label>
                        <select id="membership_type" class="w-full px-3 py-2 rounded border">
                            <option value="Regular">Regular (₱950)</option>
                            <option value="Student">Student (₱850)</option>
                        </select>
                    </div>
                    <div id="student-id-picture-field" style="display: none;">
                        <label for="school_id_picture" class="text-sm mb-1 block font-medium">Student ID Picture</label>
                        <input type="file" id="school_id_picture" class="w-full px-3 py-2 rounded border">
                    </div>
                    <div>
                        <label for="profile_picture" class="text-sm mb-1 block font-medium">Profile Picture</label>
                        <input type="file" id="profile_picture" class="w-full px-3 py-2 rounded border">
                    </div>
                    <div class="grid grid-cols-2 gap-4">
                        <div>
                            <label for="start_date" class="text-sm mb-1 block font-medium">Start Date</label>
                            <input type="date" id="start_date" class="w-full px-3 py-2 rounded border" readonly>
                        </div>
                        <div>
                            <label for="end_date" class="text-sm mb-1 block font-medium">End Date</label>
                            <input type="date" id="end_date" class="w-full px-3 py-2 rounded border" readonly>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    const { value: formValues } = await Swal.fire({
        title: 'Monthly Membership Registration',
        html: htmlContent,
        confirmButtonText: '<i class="fas fa-rocket mr-2"></i>Complete Registration',
        cancelButtonText: '<i class="fas fa-arrow-left mr-2"></i>Go Back',
        showCancelButton: true,
        customClass: {
            popup: 'rounded-2xl max-w-2xl mx-auto shadow-2xl',
            confirmButton: 'bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white px-6 py-3 rounded-xl font-bold text-lg shadow-lg transform hover:scale-105 transition-all duration-200',
            cancelButton: 'bg-gray-500 hover:bg-gray-600 text-white px-6 py-3 rounded-xl font-medium shadow-lg transform hover:scale-105 transition-all duration-200 ml-3'
        },
        buttonsStyling: false,
        width: 'auto',
        backdrop: 'rgba(0,0,0,0.8)',
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
            const memberNameInput = document.getElementById('member_name');

            // Set the member name from sessionStorage
            if (memberNameInput) {
                memberNameInput.value = fullName || '';
            }

            // Set start date to today
            if (startDateInput) {
                startDateInput.value = today.toISOString().split('T')[0];
            }

            // Set end date to one month from today
            if (endDateInput) {
                const endDate = new Date(today);
                endDate.setMonth(endDate.getMonth() + 1);
                endDateInput.value = endDate.toISOString().split('T')[0];
            }

            // Handle membership type change
            if (membershipTypeSelect && studentIdPictureField) {
                membershipTypeSelect.addEventListener('change', function() {
                    if (this.value === 'Student') {
                        studentIdPictureField.style.display = 'block';
                        // Add smooth animation
                        studentIdPictureField.style.opacity = '0';
                        studentIdPictureField.style.transform = 'translateY(-10px)';
                        setTimeout(() => {
                            studentIdPictureField.style.transition = 'all 0.3s ease';
                            studentIdPictureField.style.opacity = '1';
                            studentIdPictureField.style.transform = 'translateY(0)';
                        }, 10);
                    } else {
                        studentIdPictureField.style.transition = 'all 0.3s ease';
                        studentIdPictureField.style.opacity = '0';
                        studentIdPictureField.style.transform = 'translateY(-10px)';
                        setTimeout(() => {
                            studentIdPictureField.style.display = 'none';
                        }, 300);
                    }
                });
            }

            // Add file input preview functionality
            const profilePictureInput = document.getElementById('profile_picture');
            const schoolIdPictureInput = document.getElementById('school_id_picture');

            function addFilePreview(input, labelText) {
                if (input) {
                    input.addEventListener('change', function(e) {
                        const file = e.target.files[0];
                        if (file) {
                            const reader = new FileReader();
                            reader.onload = function(e) {
                                // You can add image preview logic here if needed
                                console.log(`${labelText} selected:`, file.name);
                            };
                            reader.readAsDataURL(file);
                        }
                    });
                }
            }

            addFilePreview(profilePictureInput, 'Profile Picture');
            addFilePreview(schoolIdPictureInput, 'School ID Picture');
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
    // Fetch HTML content from external file
    let htmlContent = '';
    
    try {
        const response = await fetch('../templates/payment-dialog.html');
        htmlContent = await response.text();
        
        // Extract just the body content (remove html, head, body tags)
        const parser = new DOMParser();
        const doc = parser.parseFromString(htmlContent, 'text/html');
        htmlContent = doc.body.innerHTML;
        
        // Replace placeholders with actual values
        htmlContent = htmlContent.replace('{{membershipType}}', membershipType);
        htmlContent = htmlContent.replace(/{{expectedAmount}}/g, expectedAmount);
        
    } catch (error) {
        console.error('Error loading payment dialog HTML:', error);
        
        // Try to load error template as secondary fallback
        try {
            const errorResponse = await fetch('../templates/error/payment-error.html');
            htmlContent = await errorResponse.text();
            
            // Extract just the body content
            const parser = new DOMParser();
            const doc = parser.parseFromString(htmlContent, 'text/html');
            htmlContent = doc.body.innerHTML;
            
            // Replace placeholders with actual values
            htmlContent = htmlContent.replace('{{membershipType}}', membershipType);
            htmlContent = htmlContent.replace(/{{expectedAmount}}/g, expectedAmount);
            
        } catch (secondaryError) {
            console.error('Error loading backup template:', secondaryError);
            
            // Final fallback - simple inline HTML
            htmlContent = `
                <div class="p-4 sm:p-6 max-w-md mx-auto">
                    <div class="text-center mb-6">
                        <div class="bg-gradient-to-r from-orange-500 to-orange-600 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center shadow-lg">
                            <i class="fas fa-exclamation-triangle text-white text-2xl"></i>
                        </div>
                        <h3 class="text-xl font-bold text-gray-800 mb-4">Payment Form</h3>
                        <div class="bg-orange-50 border border-orange-200 rounded-lg p-3 mb-4">
                            <p class="text-orange-800 font-semibold">Total: ₱${expectedAmount}</p>
                            <p class="text-orange-600 text-sm">Please scan QR code via GCash</p>
                        </div>
                    </div>
                    
                    <div class="mb-4 text-center">
                        <img src="../img/photo_2024-11-30_21-50-23.jpg" alt="GCash QR" class="mx-auto w-48 h-48 rounded-lg">
                        <p class="mt-2 text-sm text-gray-600">Enzo Daniela - 09633226873</p>
                    </div>
                    
                    <div class="space-y-3">
                        <input type="text" id="gcash_ref" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-orange-500 focus:outline-none" placeholder="GCash Reference Number">
                        <input type="text" id="gcash_name" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-orange-500 focus:outline-none" placeholder="Account Name">
                        <input type="number" id="amount_paid" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-orange-500 focus:outline-none" placeholder="Amount Paid">
                    </div>
                </div>
            `;
        }
    }

    const { isConfirmed, value: paymentDetails } = await Swal.fire({
        title: 'Complete Your Payment',
        html: htmlContent,
        confirmButtonText: '<i class="fas fa-check-circle mr-2"></i>Submit Payment',
        cancelButtonText: '<i class="fas fa-times mr-2"></i>Cancel',
        showCancelButton: true,
        customClass: {
            popup: 'rounded-2xl max-w-lg mx-auto shadow-2xl',
            title: 'text-2xl font-bold text-gray-800 mb-4',
            confirmButton: 'bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white px-6 py-3 rounded-xl font-bold text-lg shadow-lg transform hover:scale-105 transition-all duration-200',
            cancelButton: 'bg-gray-500 hover:bg-gray-600 text-white px-6 py-3 rounded-xl font-medium shadow-lg transform hover:scale-105 transition-all duration-200 ml-3'
        },
        buttonsStyling: false,
        width: 'auto',
        backdrop: 'rgba(0,0,0,0.8)',
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