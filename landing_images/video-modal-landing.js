// Video modal functionality
      const watchDemoBtn = document.getElementById('watchDemoBtn');
      const videoModal = document.getElementById('videoModal');
      const closeVideoBtn = document.getElementById('closeVideoBtn');
      const demoVideo = document.getElementById('demoVideo');

      // Open video modal with animation
      watchDemoBtn.addEventListener('click', function() {
        videoModal.classList.remove('hidden');
        document.body.style.overflow = 'hidden';
        
        // Add entrance animation and play video with sound
        setTimeout(() => {
          videoModal.style.animation = 'fadeIn 0.3s ease-out';
          // Play video with sound after user interaction
          demoVideo.muted = false; // Unmute the video
          demoVideo.play().catch(e => {
            console.log('Video play failed:', e);
            // If autoplay fails, user can still click play manually
          });
        }, 10);
      });

      // Close video modal
      function closeVideo() {
        // Add exit animation
        videoModal.style.animation = 'fadeOut 0.3s ease-in';
        
        setTimeout(() => {
          videoModal.classList.add('hidden');
          demoVideo.pause();
          demoVideo.currentTime = 0;
          document.body.style.overflow = 'auto';
          videoModal.style.animation = '';
        }, 300);
      }

      closeVideoBtn.addEventListener('click', closeVideo);

      // Close modal when clicking outside the video
      videoModal.addEventListener('click', function(e) {
        if (e.target === videoModal) {
          closeVideo();
        }
      });

      // Close modal with Escape key
      document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && !videoModal.classList.contains('hidden')) {
          closeVideo();
        }
      });