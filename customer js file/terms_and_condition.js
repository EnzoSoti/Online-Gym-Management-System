window.addEventListener('load', function() {
    Swal.fire({
        width: '800px',
        html: `
            <style>
                @keyframes float {
                    0% { transform: translateY(0px); }
                    50% { transform: translateY(-3px); }
                    100% { transform: translateY(0px); }
                }

                .term-item {
                    transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
                    position: relative;
                    overflow: hidden;
                }

                .term-item::before {
                    content: '';
                    position: absolute;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background: linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0) 100%);
                    opacity: 0;
                    transition: opacity 0.3s ease;
                }

                .term-item:hover {
                    transform: scale(1.02);
                    box-shadow: 0 8px 16px rgba(234, 88, 12, 0.2);
                }

                .term-item:hover::before {
                    opacity: 1;
                }

                .terms-grid {
                    display: grid;
                    grid-template-columns: repeat(2, 1fr);
                    gap: 1rem;
                }

                .icon-container {
                    animation: float 3s ease-in-out infinite;
                }

                .header-icon {
                    display: inline-flex;
                    align-items: center;
                    justify-content: center;
                    padding: 0.75rem;
                    background: rgba(255, 255, 255, 0.1);
                    border-radius: 1rem;
                    margin-bottom: 1rem;
                }
            </style>
            <div class="p-6 bg-gradient-to-br from-orange-600 via-orange-500 to-orange-700 rounded-xl shadow-2xl">
                <div class="flex flex-col items-center mb-4">
                    <div class="header-icon">
                        <i class="fas fa-file-contract text-4xl text-white opacity-90"></i>
                    </div>
                    <h2 class="text-2xl font-bold text-white">Terms and Agreement</h2>
                </div>

                <div class="terms-grid">
                    <div class="space-y-3">
                        <div class="term-item bg-orange-700/40 p-3 rounded-lg text-white flex items-center gap-3 backdrop-blur-sm">
                            <div class="icon-container p-2 bg-orange-500/30 rounded-full">
                                <i class="fas fa-dumbbell text-lg text-orange-100"></i>
                            </div>
                            <span class="font-medium text-sm">No dropping dumbbells.</span>
                        </div>
                        <div class="term-item bg-orange-700/40 p-3 rounded-lg text-white flex items-center gap-3 backdrop-blur-sm">
                            <div class="icon-container p-2 bg-orange-500/30 rounded-full">
                                <i class="fas fa-broom text-lg text-orange-100"></i>
                            </div>
                            <span class="font-medium text-sm">Wipe down equipment.</span>
                        </div>
                        <div class="term-item bg-orange-700/40 p-3 rounded-lg text-white flex items-center gap-3 backdrop-blur-sm">
                            <div class="icon-container p-2 bg-orange-500/30 rounded-full">
                                <i class="fas fa-directions text-lg text-orange-100"></i>
                            </div>
                            <span class="font-medium text-sm">Follow instructions.</span>
                        </div>
                        <div class="term-item bg-orange-700/40 p-3 rounded-lg text-white flex items-center gap-3 backdrop-blur-sm">
                            <div class="icon-container p-2 bg-orange-500/30 rounded-full">
                                <i class="fas fa-shield-alt text-lg text-orange-100"></i>
                            </div>
                            <span class="font-medium text-sm">Not liable for injuries.</span>
                        </div>
                    </div>

                    <div class="space-y-3">
                        <div class="term-item bg-orange-700/40 p-3 rounded-lg text-white flex items-center gap-3 backdrop-blur-sm">
                            <div class="icon-container p-2 bg-orange-500/30 rounded-full">
                                <i class="fas fa-tshirt text-lg text-orange-100"></i>
                            </div>
                            <span class="font-medium text-sm">Proper attire required.</span>
                        </div>
                        <div class="term-item bg-orange-700/40 p-3 rounded-lg text-white flex items-center gap-3 backdrop-blur-sm">
                            <div class="icon-container p-2 bg-orange-500/30 rounded-full">
                                <i class="fas fa-utensils text-lg text-orange-100"></i>
                            </div>
                            <span class="font-medium text-sm">No food or drinks.</span>
                        </div>
                        <div class="term-item bg-orange-700/40 p-3 rounded-lg text-white flex items-center gap-3 backdrop-blur-sm">
                            <div class="icon-container p-2 bg-orange-500/30 rounded-full">
                                <i class="fas fa-smoking-ban text-lg text-orange-100"></i>
                            </div>
                            <span class="font-medium text-sm">No smoking.</span>
                        </div>
                        <div class="term-item bg-orange-700/40 p-3 rounded-lg text-white flex items-center gap-3 backdrop-blur-sm">
                            <div class="icon-container p-2 bg-orange-500/30 rounded-full">
                                <i class="fas fa-eye text-lg text-orange-100"></i>
                            </div>
                            <span class="font-medium text-sm">Watch belongings.</span>
                        </div>
                    </div>
                </div>

                <div class="mt-6 flex items-center justify-center">
                    <div class="bg-white/10 p-3 rounded-lg backdrop-blur-md transform hover:scale-105 transition-transform">
                        <label class="flex items-center space-x-3 cursor-pointer">
                            <input 
                                type="checkbox" 
                                id="agreeCheckbox" 
                                class="form-checkbox h-5 w-5 text-orange-500 rounded border-orange-200 focus:ring-orange-400"
                            >
                            <span class="text-sm text-white font-medium">I agree to the terms and conditions</span>
                        </label>
                    </div>
                </div>
            </div>
        `,
        showConfirmButton: true,
        confirmButtonText: 'Accept & Continue',
        confirmButtonColor: '#ea580c',
        allowOutsideClick: false,
        allowEscapeKey: false,
        showClass: {
            popup: 'animate__animated animate__fadeInUp animate__faster'
        },
        hideClass: {
            popup: 'animate__animated animate__fadeOutDown animate__faster'
        },
        preConfirm: () => {
            const agreeCheckbox = Swal.getPopup().querySelector('#agreeCheckbox');
            if (!agreeCheckbox.checked) {
                Swal.showValidationMessage('You must agree to the terms to proceed');
            }
            return agreeCheckbox.checked;
        },
        willClose: () => {
            if (typeof formSection !== 'undefined') {
                formSection.classList.remove('hidden');
            }
        }
    });
});