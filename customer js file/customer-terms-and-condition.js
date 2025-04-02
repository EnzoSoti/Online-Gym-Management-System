window.addEventListener('load', function() {
    Swal.fire({
        width: '600px',
        html: `
            <style>
                .terms-container {
                    padding: 1.5rem;
                    max-width: 560px;
                    margin: 0 auto;
                    border-radius: 0.5rem;
                    background-color: #ffffff;
                }

                .terms-header {
                    margin-bottom: 1.5rem;
                    border-bottom: 2px solid #ea580c;
                    padding-bottom: 1rem;
                }

                .terms-header h2 {
                    font-size: 1.5rem;
                    font-weight: 700;
                    color: #ea580c;
                    margin-bottom: 0.25rem;
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                }

                .terms-header p {
                    color: #6b7280;
                    font-size: 0.875rem;
                }

                .terms-grid {
                    display: grid;
                    grid-template-columns: repeat(1, 1fr);
                    gap: 0.75rem;
                    margin-bottom: 1.5rem;
                }

                .term-item {
                    display: flex;
                    align-items: center;
                    padding: 0.75rem 1rem;
                    border-radius: 0.5rem;
                    background-color: #ffffff;
                    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
                    border-left: 3px solid #f97316;
                    transition: all 0.2s ease;
                }

                .term-item:hover {
                    background-color: #fffbeb;
                    transform: translateX(3px);
                    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
                }

                .icon-container {
                    width: 32px;
                    height: 32px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    margin-right: 1rem;
                    background-color: #f97316;
                    border-radius: 50%;
                    color: #ffffff;
                    font-size: 0.875rem;
                    transition: all 0.2s ease;
                }

                .term-item:hover .icon-container {
                    background-color: #ea580c;
                    transform: scale(1.1);
                }

                .term-text {
                    color: #1f2937;
                    font-size: 0.938rem;
                    font-weight: 500;
                    line-height: 1.4;
                }

                .checkbox-wrapper {
                    display: flex;
                    justify-content: center;
                    margin-top: 1.5rem;
                    padding: 1rem;
                    background-color: #fff7ed;
                    border-radius: 0.5rem;
                }

                .checkbox-label {
                    display: flex;
                    align-items: center;
                    cursor: pointer;
                    padding: 0.5rem;
                    transition: all 0.2s ease;
                }

                .checkbox-label:hover {
                    transform: translateY(-1px);
                }

                .checkbox-input {
                    width: 1.25rem;
                    height: 1.25rem;
                    margin-right: 0.75rem;
                    border: 2px solid #f97316;
                    border-radius: 0.25rem;
                    transition: all 0.2s ease;
                    cursor: pointer;
                    accent-color: #ea580c;
                }

                .checkbox-input:checked {
                    background-color: #ea580c;
                    border-color: #ea580c;
                }

                .checkbox-text {
                    font-size: 0.938rem;
                    color: #4b5563;
                    font-weight: 500;
                }

                .terms-container::-webkit-scrollbar {
                    width: 8px;
                }

                .terms-container::-webkit-scrollbar-track {
                    background: #f1f1f1;
                    border-radius: 4px;
                }

                .terms-container::-webkit-scrollbar-thumb {
                    background: #f97316;
                    border-radius: 4px;
                }

                .terms-container::-webkit-scrollbar-thumb:hover {
                    background: #ea580c;
                }
                
                .terms-footer {
                    text-align: center;
                    margin-top: 1.25rem;
                    padding-top: 1.25rem;
                    border-top: 1px dashed #fdba74;
                    color: #6b7280;
                    font-size: 0.75rem;
                }
                
                .proceed-btn {
                    margin-top: 1rem;
                    padding: 0.75rem 1.5rem;
                    background-color: #ea580c;
                    color: white;
                    border: none;
                    border-radius: 0.375rem;
                    font-weight: 600;
                    cursor: pointer;
                    transition: background-color 0.2s;
                }
                
                .proceed-btn:hover {
                    background-color: #c2410c;
                }
                
                @media (min-width: 640px) {
                    .terms-grid {
                        grid-template-columns: repeat(2, 1fr);
                    }
                }
            </style>
            <div class="terms-container">
                <div class="terms-header">
                    <h2>Gym Rules</h2>
                    <p>Please review and accept our policies before proceeding</p>
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
                
                <div class="terms-footer">
                    By accepting these terms, you acknowledge that you have read and understood all gym policies.
                </div>
            </div>
        `,
        showConfirmButton: true,
        confirmButtonText: 'Accept & Continue',
        confirmButtonColor: '#ea580c',
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