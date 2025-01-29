window.addEventListener('load', function() {
    Swal.fire({
        width: '600px',
        html: `
            <style>
                .terms-container {
                    padding: 1.5rem;
                    max-width: 560px;
                    margin: 0 auto;
                }

                .terms-header {
                    text-align: center;
                    margin-bottom: 1.5rem;
                }

                .terms-header h2 {
                    font-size: 1.25rem;
                    font-weight: 600;
                    color: #1f2937;
                    margin-bottom: 0.25rem;
                }

                .terms-header p {
                    color: #6b7280;
                    font-size: 0.875rem;
                }

                .terms-grid {
                    display: grid;
                    grid-template-columns: repeat(2, 1fr);
                    gap: 1rem;
                    margin-bottom: 1.5rem;
                }

                .term-item {
                    display: flex;
                    align-items: center;
                    padding: 0.625rem;
                    border-radius: 0.375rem;
                    background-color: #f9fafb;
                    transition: all 0.2s ease;
                }

                .term-item:hover {
                    background-color: #f3f4f6;
                    transform: translateY(-1px);
                    box-shadow: 0 2px 4px -1px rgba(0, 0, 0, 0.06);
                }

                .icon-container {
                    width: 28px;
                    height: 28px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    margin-right: 0.75rem;
                    background-color: #ffffff;
                    border-radius: 0.25rem;
                    color: #3b82f6;
                    font-size: 0.875rem;
                    transition: all 0.2s ease;
                }

                .term-item:hover .icon-container {
                    background-color: #3b82f6;
                    color: #ffffff;
                }

                .term-text {
                    color: #374151;
                    font-size: 0.813rem;
                    font-weight: 500;
                    line-height: 1.3;
                }

                .checkbox-wrapper {
                    display: flex;
                    justify-content: center;
                    margin-top: 1.25rem;
                    padding-top: 1.25rem;
                    border-top: 1px solid #e5e7eb;
                }

                .checkbox-label {
                    display: flex;
                    align-items: center;
                    cursor: pointer;
                    padding: 0.5rem 0.75rem;
                    border-radius: 0.25rem;
                    transition: background-color 0.2s ease;
                }

                .checkbox-label:hover {
                    background-color: #f9fafb;
                }

                .checkbox-input {
                    width: 1rem;
                    height: 1rem;
                    margin-right: 0.75rem;
                    border: 2px solid #d1d5db;
                    border-radius: 0.25rem;
                    transition: all 0.2s ease;
                    cursor: pointer;
                }

                .checkbox-input:checked {
                    background-color: #3b82f6;
                    border-color: #3b82f6;
                }

                .checkbox-text {
                    font-size: 0.813rem;
                    color: #374151;
                    font-weight: 500;
                }

                .terms-container::-webkit-scrollbar {
                    width: 6px;
                }

                .terms-container::-webkit-scrollbar-track {
                    background: #f1f1f1;
                    border-radius: 3px;
                }

                .terms-container::-webkit-scrollbar-thumb {
                    background: #c5c5c5;
                    border-radius: 3px;
                }

                .terms-container::-webkit-scrollbar-thumb:hover {
                    background: #a8a8a8;
                }
            </style>
            <div class="terms-container">
                <div class="terms-header">
                    <h2>Terms and Agreement</h2>
                    <p>Please review our gym rules and policies</p>
                </div>

                <div class="terms-grid">
                    <div class="term-item">
                        <div class="icon-container">
                            <i class="fas fa-dumbbell"></i>
                        </div>
                        <span class="term-text">No dropping dumbbells</span>
                    </div>
                    <div class="term-item">
                        <div class="icon-container">
                            <i class="fas fa-broom"></i>
                        </div>
                        <span class="term-text">Wipe down equipment</span>
                    </div>
                    <div class="term-item">
                        <div class="icon-container">
                            <i class="fas fa-directions"></i>
                        </div>
                        <span class="term-text">Follow instructions</span>
                    </div>
                    <div class="term-item">
                        <div class="icon-container">
                            <i class="fas fa-shield-alt"></i>
                        </div>
                        <span class="term-text">Not liable for injuries</span>
                    </div>
                    <div class="term-item">
                        <div class="icon-container">
                            <i class="fas fa-tshirt"></i>
                        </div>
                        <span class="term-text">Proper attire required</span>
                    </div>
                    <div class="term-item">
                        <div class="icon-container">
                            <i class="fas fa-utensils"></i>
                        </div>
                        <span class="term-text">No food or drinks</span>
                    </div>
                    <div class="term-item">
                        <div class="icon-container">
                            <i class="fas fa-smoking-ban"></i>
                        </div>
                        <span class="term-text">No smoking</span>
                    </div>
                    <div class="term-item">
                        <div class="icon-container">
                            <i class="fas fa-eye"></i>
                        </div>
                        <span class="term-text">Watch belongings</span>
                    </div>
                </div>

                <div class="checkbox-wrapper">
                    <label class="checkbox-label">
                        <input 
                            type="checkbox" 
                            id="agreeCheckbox" 
                            class="checkbox-input"
                        >
                        <span class="checkbox-text">I have read and agree to the terms and conditions</span>
                    </label>
                </div>
            </div>
        `,
        showConfirmButton: true,
        confirmButtonText: 'Accept & Continue',
        confirmButtonColor: '#3b82f6',
        allowOutsideClick: false,
        allowEscapeKey: false,
        background: '#ffffff',
        showClass: {
            popup: 'animate__animated animate__fadeIn animate__faster'
        },
        hideClass: {
            popup: 'animate__animated animate__fadeOut animate__faster'
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