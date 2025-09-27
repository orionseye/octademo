document.addEventListener('DOMContentLoaded', function() {
	const sections = document.querySelectorAll('.content-section');
	const progressBar = document.querySelector('.progress-bar');
	const sectionDots = document.querySelectorAll('.section-dot');
	const stickySection = document.querySelector('.sticky-section');
	
	let currentSection = 0;
	let isTransitioning = false;
	
	// Calculate dimensions
	const windowHeight = window.innerHeight;
	const stickySectionTop = stickySection.offsetTop;
	const stickySectionHeight = stickySection.offsetHeight;
	const scrollableDistance = stickySectionHeight - windowHeight;
	
	// Buffer zones (in pixels) at top and bottom where transitions won't trigger
	const bufferZone = 150; // Increased buffer for better UX
	
	// Function to update the active section based on scroll position
	function updateActiveSection() {
		if (isTransitioning) return;
		
		const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
		
		// Check if we're in the sticky section (with buffer zones)
		const effectiveStickyTop = stickySectionTop + bufferZone;
		const effectiveStickyBottom = stickySectionTop + stickySectionHeight - bufferZone;
		
		if (scrollTop >= effectiveStickyTop && scrollTop < effectiveStickyBottom) {
			// Calculate progress within the effective sticky section
			const effectiveScrollableDistance = effectiveStickyBottom - effectiveStickyTop;
			const scrollProgress = (scrollTop - effectiveStickyTop) / effectiveScrollableDistance;
			
			// Determine which section should be active
			const sectionCount = sections.length;
			const newSectionIndex = Math.min(
				sectionCount - 1, 
				Math.floor(scrollProgress * sectionCount)
			);
			
			// Update active section if it has changed
			if (newSectionIndex !== currentSection) {
				isTransitioning = true;
				activateSection(newSectionIndex);
				
				// Allow time for transition to complete
				setTimeout(() => {
					isTransitioning = false;
				}, 800);
			}
			
			// Update progress bar
			const overallProgress = ((scrollTop - stickySectionTop) / scrollableDistance) * 100;
			progressBar.style.width = Math.min(100, Math.max(0, overallProgress)) + '%';
		}
	}
	
	// Function to activate a specific section
	function activateSection(index) {
		if (index < 0 || index >= sections.length) return;
		
		// Remove active class from all sections
		sections.forEach(section => {
			section.classList.remove('active');
		});
		
		// Add active class to the current section
		sections[index].classList.add('active');
		
		// Update section indicator
		sectionDots.forEach(dot => {
			dot.classList.remove('active');
		});
		sectionDots[index].classList.add('active');
		
		currentSection = index;
	}
	
	// Add scroll event listener with throttling
	let scrollTimeout;
	window.addEventListener('scroll', function() {
		if (!scrollTimeout) {
			scrollTimeout = setTimeout(function() {
				scrollTimeout = null;
				updateActiveSection();
			}, 10);
		}
	});
	
	// Add click functionality to section dots
	sectionDots.forEach(dot => {
		dot.addEventListener('click', function() {
			const targetIndex = parseInt(this.getAttribute('data-section'));
			
			// Calculate the scroll position for this section (accounting for buffer)
			const sectionHeight = windowHeight;
			const targetScrollPosition = stickySectionTop + bufferZone + (targetIndex * sectionHeight);
			
			// Smooth scroll to the section
			window.scrollTo({
				top: targetScrollPosition,
				behavior: 'smooth'
			});
		});
	});
	
	// Add keyboard navigation
	window.addEventListener('keydown', function(e) {
		const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
		
		// Only respond to arrow keys if we're in the sticky section
		if (scrollTop >= stickySectionTop && scrollTop < stickySectionTop + stickySectionHeight) {
			if (e.key === 'ArrowDown' && currentSection < sections.length - 1) {
				const targetScrollPosition = stickySectionTop + bufferZone + ((currentSection + 1) * windowHeight);
				window.scrollTo({
					top: targetScrollPosition,
					behavior: 'smooth'
				});
				e.preventDefault();
			} else if (e.key === 'ArrowUp' && currentSection > 0) {
				const targetScrollPosition = stickySectionTop + bufferZone + ((currentSection - 1) * windowHeight);
				window.scrollTo({
					top: targetScrollPosition,
					behavior: 'smooth'
				});
				e.preventDefault();
			}
		}
	});
	
	// Initialize
	updateActiveSection();
});