// Gallery functionality for Bella Nails

document.addEventListener('DOMContentLoaded', function() {
    initGalleryFilters();
    initImageModal();
    initMasonry();
});

/**
 * Gallery Filter Functionality
 */
function initGalleryFilters() {
    const filterButtons = document.querySelectorAll('.filter-btn');
    const galleryItems = document.querySelectorAll('.gallery-item');
    
    if (filterButtons.length === 0 || galleryItems.length === 0) return;
    
    filterButtons.forEach(button => {
        button.addEventListener('click', function() {
            const filter = this.getAttribute('data-filter');
            
            // Update active button
            filterButtons.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');
            
            // Filter gallery items
            filterGalleryItems(galleryItems, filter);
        });
    });
}

/**
 * Filter gallery items based on category
 */
function filterGalleryItems(items, filter) {
    items.forEach(item => {
        const category = item.getAttribute('data-category');
        const shouldShow = filter === 'all' || category === filter;
        
        if (shouldShow) {
            // Show item with animation
            item.style.display = 'block';
            item.style.opacity = '0';
            item.style.transform = 'scale(0.8)';
            
            // Animate in
            setTimeout(() => {
                item.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
                item.style.opacity = '1';
                item.style.transform = 'scale(1)';
            }, 50);
        } else {
            // Hide item with animation
            item.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
            item.style.opacity = '0';
            item.style.transform = 'scale(0.8)';
            
            setTimeout(() => {
                item.style.display = 'none';
            }, 300);
        }
    });
}

/**
 * Image Modal Functionality
 */
function initImageModal() {
    const modal = document.getElementById('image-modal');
    const modalImage = document.getElementById('modal-image');
    const closeModal = document.getElementById('close-modal');
    const galleryImages = document.querySelectorAll('.gallery-item img');
    
    if (!modal || !modalImage || !closeModal) return;
    
    // Open modal when clicking on gallery images
    galleryImages.forEach(img => {
        img.parentElement.addEventListener('click', function(e) {
            e.preventDefault();
            const imgSrc = img.src;
            const imgAlt = img.alt;
            
            modalImage.src = imgSrc;
            modalImage.alt = imgAlt;
            modal.classList.remove('hidden');
            modal.classList.add('flex');
            
            // Add fade-in animation
            modal.style.opacity = '0';
            setTimeout(() => {
                modal.style.transition = 'opacity 0.3s ease';
                modal.style.opacity = '1';
            }, 10);
            
            // Prevent body scroll
            document.body.style.overflow = 'hidden';
            
            // Focus management for accessibility
            closeModal.focus();
        });
    });
    
    // Close modal functions
    function closeImageModal() {
        modal.style.opacity = '0';
        setTimeout(() => {
            modal.classList.add('hidden');
            modal.classList.remove('flex');
            document.body.style.overflow = '';
        }, 300);
    }
    
    // Close on X button click
    closeModal.addEventListener('click', closeImageModal);
    
    // Close on backdrop click
    modal.addEventListener('click', function(e) {
        if (e.target === modal) {
            closeImageModal();
        }
    });
    
    // Close on Escape key
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && !modal.classList.contains('hidden')) {
            closeImageModal();
        }
    });
    
    // Navigation with arrow keys
    let currentImageIndex = 0;
    const allImages = Array.from(galleryImages);
    
    document.addEventListener('keydown', function(e) {
        if (modal.classList.contains('hidden')) return;
        
        if (e.key === 'ArrowLeft') {
            e.preventDefault();
            currentImageIndex = (currentImageIndex - 1 + allImages.length) % allImages.length;
            updateModalImage(allImages[currentImageIndex]);
        } else if (e.key === 'ArrowRight') {
            e.preventDefault();
            currentImageIndex = (currentImageIndex + 1) % allImages.length;
            updateModalImage(allImages[currentImageIndex]);
        }
    });
    
    function updateModalImage(img) {
        modalImage.style.opacity = '0';
        setTimeout(() => {
            modalImage.src = img.src;
            modalImage.alt = img.alt;
            modalImage.style.opacity = '1';
        }, 150);
    }
    
    // Set current index when opening modal
    galleryImages.forEach((img, index) => {
        img.parentElement.addEventListener('click', function() {
            currentImageIndex = index;
        });
    });
}

/**
 * Masonry Layout (Optional Enhancement)
 */
function initMasonry() {
    const galleryGrid = document.getElementById('gallery-grid');
    if (!galleryGrid) return;
    
    // Simple masonry-like layout using CSS Grid
    function layoutMasonry() {
        const items = galleryGrid.children;
        const columnWidth = 300; // Approximate item width
        const gap = 24;
        const containerWidth = galleryGrid.offsetWidth;
        const columns = Math.floor(containerWidth / (columnWidth + gap));
        
        // Set CSS Grid properties
        galleryGrid.style.gridTemplateColumns = `repeat(${columns}, 1fr)`;
    }
    
    // Layout on load and resize
    window.addEventListener('load', layoutMasonry);
    window.addEventListener('resize', BellaNails.debounce(layoutMasonry, 250));
}

/**
 * Lazy Loading for Gallery Images
 */
function initGalleryLazyLoading() {
    const galleryImages = document.querySelectorAll('.gallery-item img');
    
    if ('IntersectionObserver' in window) {
        const imageObserver = new IntersectionObserver(function(entries) {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    
                    // Add loading animation
                    img.classList.add('opacity-0');
                    
                    // Load image
                    if (img.dataset.src) {
                        img.src = img.dataset.src;
                    }
                    
                    img.onload = function() {
                        img.classList.remove('opacity-0');
                        img.classList.add('opacity-100', 'transition-opacity', 'duration-300');
                    };
                    
                    imageObserver.unobserve(img);
                }
            });
        }, {
            threshold: 0.1,
            rootMargin: '50px'
        });
        
        galleryImages.forEach(img => {
            imageObserver.observe(img);
        });
    }
}

/**
 * Search Functionality (Optional)
 */
function initGallerySearch() {
    const searchInput = document.getElementById('gallery-search');
    if (!searchInput) return;
    
    searchInput.addEventListener('input', BellaNails.debounce(function() {
        const searchTerm = this.value.toLowerCase();
        const galleryItems = document.querySelectorAll('.gallery-item');
        
        galleryItems.forEach(item => {
            const title = item.querySelector('h3')?.textContent.toLowerCase() || '';
            const description = item.querySelector('p')?.textContent.toLowerCase() || '';
            const alt = item.querySelector('img')?.alt.toLowerCase() || '';
            
            const matches = title.includes(searchTerm) || 
                          description.includes(searchTerm) || 
                          alt.includes(searchTerm);
            
            if (matches || searchTerm === '') {
                item.style.display = 'block';
            } else {
                item.style.display = 'none';
            }
        });
    }, 300));
}

/**
 * Social Sharing for Images
 */
function initSocialSharing() {
    const shareButtons = document.querySelectorAll('.share-btn');
    
    shareButtons.forEach(button => {
        button.addEventListener('click', function() {
            const imageUrl = this.dataset.imageUrl;
            const title = this.dataset.title || 'Bella Nails - Création';
            const text = `Découvrez cette magnifique création de Bella Nails : ${title}`;
            
            if (navigator.share) {
                // Use Web Share API if available
                navigator.share({
                    title: title,
                    text: text,
                    url: imageUrl
                }).catch(console.error);
            } else {
                // Fallback to social media URLs
                const platform = this.dataset.platform;
                let shareUrl = '';
                
                switch (platform) {
                    case 'facebook':
                        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(imageUrl)}`;
                        break;
                    case 'twitter':
                        shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(imageUrl)}`;
                        break;
                    case 'instagram':
                        // Instagram doesn't support direct URL sharing, show message
                        BellaNails.showSuccessMessage('Suivez-nous sur Instagram @bellanails_villedubois pour voir plus de créations !');
                        return;
                    default:
                        return;
                }
                
                if (shareUrl) {
                    window.open(shareUrl, '_blank', 'width=600,height=400');
                }
            }
        });
    });
}

/**
 * Image Loading Performance
 */
function optimizeImageLoading() {
    const images = document.querySelectorAll('.gallery-item img');
    
    images.forEach(img => {
        // Add loading="lazy" for native lazy loading
        img.loading = 'lazy';
        
        // Add decoding="async" for better performance
        img.decoding = 'async';
        
        // Preload critical images
        if (img.closest('.gallery-item[data-priority="high"]')) {
            const link = document.createElement('link');
            link.rel = 'preload';
            link.as = 'image';
            link.href = img.src;
            document.head.appendChild(link);
        }
    });
}

// Initialize image optimization
document.addEventListener('DOMContentLoaded', optimizeImageLoading);

/**
 * Gallery Analytics (Optional)
 */
function trackGalleryEvents() {
    const galleryItems = document.querySelectorAll('.gallery-item');
    
    galleryItems.forEach((item, index) => {
        item.addEventListener('click', function() {
            const category = this.dataset.category;
            const title = this.querySelector('h3')?.textContent || 'Unknown';
            
            // Track with Google Analytics or similar
            if (typeof gtag !== 'undefined') {
                gtag('event', 'gallery_image_view', {
                    'event_category': 'Gallery',
                    'event_label': `${category} - ${title}`,
                    'value': index + 1
                });
            }
            
            console.log('Gallery item viewed:', { category, title, index });
        });
    });
    
    // Track filter usage
    const filterButtons = document.querySelectorAll('.filter-btn');
    filterButtons.forEach(button => {
        button.addEventListener('click', function() {
            const filter = this.dataset.filter;
            
            if (typeof gtag !== 'undefined') {
                gtag('event', 'gallery_filter_use', {
                    'event_category': 'Gallery',
                    'event_label': filter
                });
            }
            
            console.log('Gallery filter used:', filter);
        });
    });
}

// Initialize analytics if in production
if (window.location.hostname !== 'localhost') {
    document.addEventListener('DOMContentLoaded', trackGalleryEvents);
}