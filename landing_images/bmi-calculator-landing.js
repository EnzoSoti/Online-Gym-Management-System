document.getElementById('bmiForm').addEventListener('submit', function(e) {
    e.preventDefault();
    const height = document.getElementById('height').value / 100; 
    const weight = document.getElementById('weight').value;
    const bmi = weight / (height * height);
    
    let category = '';
    if (bmi < 18.5) category = 'Underweight';
    else if (bmi < 25) category = 'Normal weight';
    else if (bmi < 30) category = 'Overweight';
    else category = 'Obese';

    document.getElementById('bmiValue').textContent = bmi.toFixed(1);
    document.getElementById('bmiCategory').textContent = `Category: ${category}`;
    document.getElementById('bmiResult').classList.remove('hidden');
});

// Calorie
document.getElementById('calorieForm').addEventListener('submit', function(e) {
    e.preventDefault();
    const age = parseInt(document.getElementById('age').value);
    const gender = document.getElementById('gender').value;
    const activity = parseFloat(document.getElementById('activity').value);
    const weight = parseFloat(document.getElementById('weight').value);
    const height = parseFloat(document.getElementById('height').value);

    let bmr;
    if (gender === 'male') {
        bmr = (10 * weight) + (6.25 * height) - (5 * age) + 5;
    } else {
        bmr = (10 * weight) + (6.25 * height) - (5 * age) - 161;
    }

    const calories = Math.round(bmr * activity);

    document.getElementById('calorieValue').textContent = calories;
    document.getElementById('calorieDescription').textContent = 'Daily calories needed to maintain current weight';
    document.getElementById('calorieResult').classList.remove('hidden');
});