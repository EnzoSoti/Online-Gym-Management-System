window.addEventListener('load', function() {
    Swal.fire({
        width: '800px',
        html: `
            <style>
                @keyframes subtle-pulse {
                    0% { transform: scale(1); }
                    50% { transform: scale(1.02); }
                    100% { transform: scale(1); }
                }

                .terms-container {
                    background: linear-gradient(135deg, #ff7e33 0%, #ff5e0e 100%);
                    border-radius: 12px;
                    padding: 2rem;
                    box-shadow: 0 15px 30px rgba(0,0,0,0.1);
                }

                .terms-header {
                    text-align: center;
                    margin-bottom: 2rem;
                    position: relative;
                }

                .terms-header::after {
                    content: '';
                    position: absolute;
                    bottom: -10px;
                    left: 50%;
                    transform: translateX(-50%);
                    width: 50px;
                    height: 3px;
                    background: rgba(255,255,255,0.5);
                    border-radius: 10px;
                }

                .terms-grid {
                    display: grid;
                    grid-template-columns: repeat(2, 1fr);
                    gap: 1rem;
                }

                .term-item {
                    display: flex;
                    align-items: center;
                    background: rgba(0,0,0,0.1);
                    border-radius: 8px;
                    padding: 0.75rem;
                    transition: all 0.3s ease;
                    border: 1px solid transparent;
                }

                .term-item:hover {
                    background: rgba(255,255,255,0.1);
                    border-color: rgba(255,255,255,0.2);
                    animation: subtle-pulse 1s infinite;
                }

                .icon-container {
                    background: rgba(255,255,255,0.2);
                    border-radius: 50%;
                    width: 40px;
                    height: 40px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    margin-right: 1rem;
                    transition: transform 0.3s ease;
                }

                .term-item:hover .icon-container {
                    transform: rotate(15deg);
                }

                .header-icon {
                    background: rgba(255,255,255,0.2);
                    width: 70px;
                    height: 70px;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    margin: 0 auto 1rem;
                }

                .checkbox-wrapper {
                    display: flex;
                    justify-content: center;
                    margin-top: 2rem;
                    background: rgba(0,0,0,0.1);
                    padding: 1rem;
                    border-radius: 8px;
                }
            </style>
            <div class="terms-container text-white">
                <div class="terms-header">
                    <div class="header-icon">
                        <i class="fas fa-file-contract text-4xl text-white opacity-90"></i>
                    </div>
                    <h2 class="text-2xl font-bold">Terms and Agreement</h2>
                </div>

                <div class="terms-grid">
                    <div class="space-y-3">
                        <div class="term-item text-white">
                            <div class="icon-container">
                                <i class="fas fa-dumbbell text-lg text-white"></i>
                            </div>
                            <span class="font-medium text-sm">No dropping dumbbells.</span>
                        </div>
                        <div class="term-item text-white">
                            <div class="icon-container">
                                <i class="fas fa-broom text-lg text-white"></i>
                            </div>
                            <span class="font-medium text-sm">Wipe down equipment.</span>
                        </div>
                        <div class="term-item text-white">
                            <div class="icon-container">
                                <i class="fas fa-directions text-lg text-white"></i>
                            </div>
                            <span class="font-medium text-sm">Follow instructions.</span>
                        </div>
                        <div class="term-item text-white">
                            <div class="icon-container">
                                <i class="fas fa-shield-alt text-lg text-white"></i>
                            </div>
                            <span class="font-medium text-sm">Not liable for injuries.</span>
                        </div>
                    </div>

                    <div class="space-y-3">
                        <div class="term-item text-white">
                            <div class="icon-container">
                                <i class="fas fa-tshirt text-lg text-white"></i>
                            </div>
                            <span class="font-medium text-sm">Proper attire required.</span>
                        </div>
                        <div class="term-item text-white">
                            <div class="icon-container">
                                <i class="fas fa-utensils text-lg text-white"></i>
                            </div>
                            <span class="font-medium text-sm">No food or drinks.</span>
                        </div>
                        <div class="term-item text-white">
                            <div class="icon-container">
                                <i class="fas fa-smoking-ban text-lg text-white"></i>
                            </div>
                            <span class="font-medium text-sm">No smoking.</span>
                        </div>
                        <div class="term-item text-white">
                            <div class="icon-container">
                                <i class="fas fa-eye text-lg text-white"></i>
                            </div>
                            <span class="font-medium text-sm">Watch belongings.</span>
                        </div>
                    </div>
                </div>

                <div class="checkbox-wrapper">
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