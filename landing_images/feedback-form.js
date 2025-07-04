const feedbackForm = document.getElementById('feedback-form');
if (feedbackForm) {
  feedbackForm.addEventListener('submit', async function (e) {
    e.preventDefault();
    const name = feedbackForm.name.value.trim();
    const email = feedbackForm.email.value.trim();
    const feedback = feedbackForm.feedback.value.trim();
    const rating = feedbackForm.rating.value;

    // Simple validation
    if (!name || !email || !feedback || !rating) {
      Swal.fire({
        icon: 'warning',
        title: 'Please fill in all fields and select a rating.',
        confirmButtonColor: '#f97316',
      });
      return;
    }

    try {
      const response = await fetch('http://localhost:3000/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, feedback, rating }),
      });
      if (response.ok) {
        Swal.fire({
          icon: 'success',
          title: 'Thank you for your feedback!',
          text: 'We appreciate your input.',
          confirmButtonColor: '#f97316',
        });
        feedbackForm.reset();
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Submission failed',
          text: 'Please try again later.',
          confirmButtonColor: '#f97316',
        });
      }
    } catch (err) {
      Swal.fire({
        icon: 'error',
        title: 'Network error',
        text: 'Please check your connection and try again.',
        confirmButtonColor: '#f97316',
      });
    }
  });
} 