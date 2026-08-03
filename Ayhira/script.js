/**
 * Ayhira by A&T — Main JavaScript
 * Premium E-Commerce Interactions
 */

(function () {
  'use strict';

  // ===== DOM REFERENCES =====
  const header = document.getElementById('header');
  const mobileMenuToggle = document.getElementById('mobile-menu-toggle');
  const navMain = document.getElementById('nav-main');
  const sidebar = document.getElementById('sidebar');
  const sidebarOverlay = document.getElementById('sidebar-overlay');
  const sidebarCloseBtn = document.getElementById('sidebar-close-btn');
  const mobileFilterBtn = document.getElementById('mobile-filter-btn');
  const backToTop = document.getElementById('back-to-top');
  const sortSelect = document.getElementById('sort-select');
  const newsletterForm = document.getElementById('newsletter-form');

  // ===== HEADER SCROLL EFFECT =====
  let lastScrollY = 0;
  let ticking = false;

  function handleScroll() {
    const scrollY = window.scrollY;

    // Add shadow on scroll
    if (header && scrollY > 10) {
      header.classList.add('scrolled');
    } else if (header) {
      header.classList.remove('scrolled');
    }

    // Back to top visibility
    if (backToTop) {
      if (scrollY > 400) {
        backToTop.classList.add('visible');
      } else {
        backToTop.classList.remove('visible');
      }
    }

    lastScrollY = scrollY;
    ticking = false;
  }

  window.addEventListener('scroll', function () {
    if (!ticking) {
      window.requestAnimationFrame(handleScroll);
      ticking = true;
    }
  }, { passive: true });

  // ===== MOBILE MENU =====
  mobileMenuToggle.addEventListener('click', function () {
    this.classList.toggle('active');
    navMain.classList.toggle('open');
    document.body.style.overflow = navMain.classList.contains('open') ? 'hidden' : '';
  });

  // Close mobile menu when clicking a nav link
  navMain.querySelectorAll('a:not(.nav-dropdown-toggle)').forEach(function (link) {
    link.addEventListener('click', function () {
      if (window.innerWidth <= 992) {
        mobileMenuToggle.classList.remove('active');
        navMain.classList.remove('open');
        document.body.style.overflow = '';
      }
    });
  });

  // Mobile dropdown handling
  document.querySelectorAll('.nav-dropdown-toggle').forEach(function (toggle) {
    toggle.addEventListener('click', function (e) {
      if (window.innerWidth <= 992) {
        e.preventDefault();
        this.closest('.nav-dropdown').classList.toggle('open');
      }
    });
  });

  // ===== SIDEBAR FILTERS =====
  // Toggle sidebar sections
  document.querySelectorAll('.sidebar-header').forEach(function (header) {
    header.addEventListener('click', function () {
      const section = this.closest('.sidebar-section');
      section.classList.toggle('collapsed');

      const isExpanded = !section.classList.contains('collapsed');
      this.setAttribute('aria-expanded', isExpanded);
    });

    // Keyboard accessibility
    header.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        this.click();
      }
    });
  });

  // Mobile filter sidebar
  if (mobileFilterBtn) {
    mobileFilterBtn.addEventListener('click', function () {
      sidebar.classList.add('open');
      sidebarOverlay.classList.add('active');
      sidebarOverlay.style.display = 'block';
      document.body.style.overflow = 'hidden';
    });
  }

  function closeSidebar() {
    sidebar.classList.remove('open');
    sidebarOverlay.classList.remove('active');
    setTimeout(function () {
      sidebarOverlay.style.display = '';
    }, 300);
    document.body.style.overflow = '';
  }

  if (sidebarCloseBtn) {
    sidebarCloseBtn.addEventListener('click', closeSidebar);
  }

  if (sidebarOverlay) {
    sidebarOverlay.addEventListener('click', closeSidebar);
  }

  // ===== WISHLIST TOGGLE =====
  document.querySelectorAll('.wishlist-btn').forEach(function (btn) {
    btn.addEventListener('click', function (e) {
      e.stopPropagation();
      this.classList.toggle('active');

      // Subtle animation
      this.style.transform = 'scale(1.3)';
      setTimeout(function () {
        btn.style.transform = '';
      }, 200);
    });
  });

  // ===== BACK TO TOP =====
  if (backToTop) {
    backToTop.addEventListener('click', function () {
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    });
  }

  // ===== SORT FUNCTIONALITY =====
  if (sortSelect) {
    sortSelect.addEventListener('change', function () {
      const grid = document.getElementById('product-grid');
      const cards = Array.from(grid.querySelectorAll('.product-card'));
      const sortValue = this.value;

      cards.sort(function (a, b) {
        const nameA = a.querySelector('.product-card-title').textContent;
        const nameB = b.querySelector('.product-card-title').textContent;
        const priceA = getPrice(a);
        const priceB = getPrice(b);

        switch (sortValue) {
          case 'price-low':
            return priceA - priceB;
          case 'price-high':
            return priceB - priceA;
          case 'name-az':
            return nameA.localeCompare(nameB);
          case 'name-za':
            return nameB.localeCompare(nameA);
          default:
            return 0;
        }
      });

      // Re-render with animation
      cards.forEach(function (card, index) {
        card.style.opacity = '0';
        card.style.transform = 'translateY(20px)';
      });

      setTimeout(function () {
        cards.forEach(function (card) {
          grid.appendChild(card);
        });

        cards.forEach(function (card, index) {
          setTimeout(function () {
            card.style.opacity = '1';
            card.style.transform = 'translateY(0)';
            card.style.transition = 'opacity 0.4s ease, transform 0.4s ease';
          }, index * 60);
        });
      }, 200);
    });
  }

  function getPrice(card) {
    const salePrice = card.querySelector('.price-sale');
    const regularPrice = card.querySelector('.price-regular');
    const priceEl = salePrice || regularPrice;
    if (!priceEl) return 0;

    const priceText = priceEl.textContent.replace(/[^0-9]/g, '');
    return parseInt(priceText, 10) || 0;
  }

  // ===== NEWSLETTER FORM =====
  if (newsletterForm) {
    newsletterForm.addEventListener('submit', function (e) {
      e.preventDefault();
      const emailInput = document.getElementById('newsletter-email');
      const submitBtn = document.getElementById('newsletter-submit');

      if (emailInput.value) {
        const originalText = submitBtn.textContent;
        submitBtn.textContent = 'Subscribed ✓';
        submitBtn.style.background = '#25D366';
        submitBtn.style.borderColor = '#25D366';
        emailInput.value = '';

        setTimeout(function () {
          submitBtn.textContent = originalText;
          submitBtn.style.background = '';
          submitBtn.style.borderColor = '';
        }, 3000);
      }
    });
  }

  // ===== PRODUCT CARD CLICK =====
  document.querySelectorAll('.product-card').forEach(function (card) {
    card.addEventListener('click', function (e) {
      // Don't navigate if clicking buttons
      if (e.target.closest('button') || e.target.closest('.quick-action-btn')) {
        return;
      }
      // In a real app, this would navigate to the product page
      const title = this.querySelector('.product-card-title').textContent;
      console.log('Navigate to product:', title);
    });
  });

  // ===== ADD TO CART ANIMATION =====
  document.querySelectorAll('[id^="add-cart-"]').forEach(function (btn) {
    btn.addEventListener('click', function (e) {
      e.stopPropagation();
      const cartCount = document.getElementById('cart-count');
      const currentCount = parseInt(cartCount.textContent, 10);
      cartCount.textContent = currentCount + 1;

      // Button feedback
      const originalText = this.textContent;
      this.textContent = 'Added ✓';
      this.style.background = 'var(--color-gold)';
      this.style.color = 'var(--color-white)';

      // Cart count animation
      cartCount.style.transform = 'scale(1.4)';
      setTimeout(function () {
        cartCount.style.transform = 'scale(1)';
        cartCount.style.transition = 'transform 0.3s ease';
      }, 200);

      var self = this;
      setTimeout(function () {
        self.textContent = originalText;
        self.style.background = '';
        self.style.color = '';
      }, 1500);
    });
  });

  // ===== INTERSECTION OBSERVER FOR ANIMATIONS =====
  if ('IntersectionObserver' in window) {
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.style.animationPlayState = 'running';
          observer.unobserve(entry.target);
        }
      });
    }, {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
    });

    document.querySelectorAll('.product-card').forEach(function (card) {
      card.style.animationPlayState = 'paused';
      observer.observe(card);
    });
  }

  // ===== CLOSE MENUS ON RESIZE =====
  var resizeTimer;
  window.addEventListener('resize', function () {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(function () {
      if (window.innerWidth > 992) {
        if (mobileMenuToggle) mobileMenuToggle.classList.remove('active');
        if (navMain) navMain.classList.remove('open');
        if (sidebar) sidebar.classList.remove('open');
        if (sidebarOverlay) {
          sidebarOverlay.classList.remove('active');
          sidebarOverlay.style.display = '';
        }
        document.body.style.overflow = '';
      }
    }, 250);
  });

  // ===== HERO CAROUSEL =====
  const carousels = document.querySelectorAll('.hero-carousel');
  carousels.forEach(function(carousel, index) {
    const slides = carousel.querySelectorAll('.carousel-slide');
    if (slides.length > 1) {
      let currentSlide = 0;
      // Stagger the animations slightly if there are multiple carousels
      const delay = index * 1000;
      
      setTimeout(function() {
        setInterval(function () {
          slides[currentSlide].classList.remove('active');
          currentSlide = (currentSlide + 1) % slides.length;
          slides[currentSlide].classList.add('active');
        }, 5000); // Slower interval for a premium feel
      }, delay);
    }
  });

  // ===== KEYBOARD NAVIGATION =====
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') {
      // Close mobile menu
      if (navMain && navMain.classList.contains('open')) {
        if (mobileMenuToggle) mobileMenuToggle.classList.remove('active');
        navMain.classList.remove('open');
        document.body.style.overflow = '';
      }
      // Close sidebar
      if (sidebar && sidebar.classList.contains('open')) {
        closeSidebar();
      }
    }
  });

  // ===== SANITY INTEGRATION =====
  const PROJECT_ID = 'sc8k5yfq';
  const DATASET = 'production';
  const productGrid = document.getElementById('product-grid');

  if (productGrid) {
    // Only run this on pages with a product grid
    const query = encodeURIComponent('*[_type == "product"]{_id, name, "slug": slug.current, price, category, "imageUrl": gallery[0].asset->url, "isSale": false, "isNew": false}');
    const url = `https://${PROJECT_ID}.api.sanity.io/v2023-05-03/data/query/${DATASET}?query=${query}`;

    fetch(url)
      .then(res => res.json())
      .then(data => {
        const products = data.result;
        if (!products || products.length === 0) {
          productGrid.innerHTML = '<div style="grid-column: 1 / -1; text-align: center; padding: 4rem;"><p>No products found.</p></div>';
          
          // Update product count
          const countEl = document.querySelector('.product-count strong');
          if (countEl) countEl.textContent = '0';
          
          return;
        }

        // Update product count
        const countEl = document.querySelector('.product-count strong');
        if (countEl) countEl.textContent = products.length;

        productGrid.innerHTML = '';
        products.forEach((product, index) => {
          // Format price with commas
          const formattedPrice = product.price ? product.price.toLocaleString() : '0';
          
          const article = document.createElement('article');
          article.className = 'product-card';
          article.id = `product-${product._id}`;
          
          // Recreate the HTML structure
          article.innerHTML = `
            <div class="product-card-image">
              ${product.isNew ? '<span class="product-badge badge-new">New</span>' : ''}
              ${product.isSale ? '<span class="product-badge badge-sale">Sale</span>' : ''}
              <button class="wishlist-btn" id="wishlist-${product._id}" aria-label="Add to wishlist">
                <svg viewBox="0 0 24 24"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
              </button>
              <img src="${product.imageUrl || 'https://via.placeholder.com/600x800?text=No+Image'}" alt="${product.name}" loading="lazy" width="600" height="800">
              <div class="product-quick-actions">
                <button class="quick-action-btn" id="quick-view-${product._id}">Quick View</button>
                <button class="quick-action-btn" id="add-cart-${product._id}">Add to Cart</button>
              </div>
            </div>
            <div class="product-card-info">
              <p class="product-card-category">${product.category || 'Uncategorized'}</p>
              <h3 class="product-card-title">${product.name}</h3>
              <div class="product-card-price">
                <span class="price-regular">Rs. ${formattedPrice}</span>
              </div>
            </div>
          `;
          
          // Add click listener for navigation
          article.addEventListener('click', function(e) {
            if (e.target.closest('button') || e.target.closest('.quick-action-btn')) return;
            window.location.href = `product-detail.html?product=${product.slug}`;
          });

          productGrid.appendChild(article);
          
          // Re-bind wish and cart actions for new elements
          const wishBtn = article.querySelector('.wishlist-btn');
          wishBtn.addEventListener('click', function(e) {
            e.stopPropagation();
            this.classList.toggle('active');
            this.style.transform = 'scale(1.3)';
            setTimeout(() => this.style.transform = '', 200);
          });
          
          const cartBtn = article.querySelector('[id^="add-cart-"]');
          cartBtn.addEventListener('click', function(e) {
            e.stopPropagation();
            const cartCount = document.getElementById('cart-count');
            const currentCount = parseInt(cartCount.textContent, 10) || 0;
            cartCount.textContent = currentCount + 1;
            
            const originalText = this.textContent;
            this.textContent = 'Added ✓';
            this.style.background = 'var(--color-gold)';
            this.style.color = 'var(--color-white)';
            
            cartCount.style.transform = 'scale(1.4)';
            setTimeout(() => {
              cartCount.style.transform = 'scale(1)';
              cartCount.style.transition = 'transform 0.3s ease';
            }, 200);
            
            setTimeout(() => {
              this.textContent = originalText;
              this.style.background = '';
              this.style.color = '';
            }, 1500);
          });
        });

        // Initialize observers for new cards
        if ('IntersectionObserver' in window && typeof observer !== 'undefined') {
          document.querySelectorAll('.product-card').forEach(card => {
            card.style.animationPlayState = 'paused';
            observer.observe(card);
          });
        }
      })
      .catch(err => {
        console.error('Error fetching products:', err);
        productGrid.innerHTML = '<div style="grid-column: 1 / -1; text-align: center; padding: 4rem;"><p>Failed to load products.</p></div>';
      });
  }

  // ===== HOMEPAGE SANITY PRODUCT SECTIONS =====
  const latestDropGrid = document.getElementById('latest-drop-grid');
  const embroideredGrid = document.getElementById('embroidered-grid');

  if (latestDropGrid || embroideredGrid) {
    const SANITY_PROJECT = PROJECT_ID || 'sc8k5yfq';
    const SANITY_DATASET = DATASET || 'production';

    // Helper: build a Sanity CDN URL from a GROQ query
    function sanityUrl(groqQuery) {
      return `https://${SANITY_PROJECT}.api.sanity.io/v2023-05-03/data/query/${SANITY_DATASET}?query=${encodeURIComponent(groqQuery)}`;
    }

    // Helper: create a product card article element for the homepage
    function createHomeProductCard(product) {
      const formattedPrice = product.price ? product.price.toLocaleString() : '0';
      const article = document.createElement('article');
      article.className = 'product-card';
      article.id = `home-product-${product._id}`;

      article.innerHTML = `
        <div class="product-card-image">
          <img src="${product.imageUrl || 'https://via.placeholder.com/600x800?text=No+Image'}" alt="${product.name}" loading="lazy" width="600" height="800">
        </div>
        <div class="product-card-info">
          <h3 class="product-card-title">${product.name}</h3>
          <div class="product-card-price">
            <span class="price-regular">Rs. ${formattedPrice}</span>
          </div>
        </div>
      `;

      // Navigate to product detail on click
      article.addEventListener('click', function (e) {
        if (e.target.closest('button')) return;
        window.location.href = `product-detail.html?product=${product.slug}`;
      });
      article.style.cursor = 'pointer';

      return article;
    }

    // Helper: render products into a grid container
    function renderHomeGrid(container, products) {
      container.innerHTML = '';

      if (!products || products.length === 0) {
        container.innerHTML = '<div style="grid-column: 1 / -1; text-align: center; padding: 4rem;"><p>No products found.</p></div>';
        return;
      }

      products.forEach(function (product) {
        container.appendChild(createHomeProductCard(product));
      });

      // Re-register IntersectionObserver for fade-in animations
      if ('IntersectionObserver' in window) {
        var homeObserver = new IntersectionObserver(function (entries) {
          entries.forEach(function (entry) {
            if (entry.isIntersecting) {
              entry.target.style.animationPlayState = 'running';
              homeObserver.unobserve(entry.target);
            }
          });
        }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

        container.querySelectorAll('.product-card').forEach(function (card) {
          card.style.animationPlayState = 'paused';
          homeObserver.observe(card);
        });
      }
    }

    // Fetch: LATEST DROP — latest 4 products ordered by creation date
    if (latestDropGrid) {
      var latestQuery = '*[_type == "product"] | order(_createdAt desc) [0...4] { _id, name, "slug": slug.current, price, category, "imageUrl": gallery[0].asset->url }';

      fetch(sanityUrl(latestQuery))
        .then(function (res) { return res.json(); })
        .then(function (data) { renderHomeGrid(latestDropGrid, data.result); })
        .catch(function (err) {
          console.error('Error fetching latest drop products:', err);
          latestDropGrid.innerHTML = '<div style="grid-column: 1 / -1; text-align: center; padding: 4rem;"><p>Failed to load products.</p></div>';
        });
    }

    // Fetch: EMBROIDERED — 4 products with category == "embroidered"
    if (embroideredGrid) {
      var embroideredQuery = '*[_type == "product" && category == "embroidered"] | order(_createdAt desc) [0...4] { _id, name, "slug": slug.current, price, category, "imageUrl": gallery[0].asset->url }';

      fetch(sanityUrl(embroideredQuery))
        .then(function (res) { return res.json(); })
        .then(function (data) {
          // If no embroidered products, fallback to showing any products
          if (!data.result || data.result.length === 0) {
            var fallbackQuery = '*[_type == "product"] | order(_createdAt asc) [0...4] { _id, name, "slug": slug.current, price, category, "imageUrl": gallery[0].asset->url }';
            fetch(sanityUrl(fallbackQuery))
              .then(function (res2) { return res2.json(); })
              .then(function (data2) { renderHomeGrid(embroideredGrid, data2.result); })
              .catch(function () { renderHomeGrid(embroideredGrid, []); });
          } else {
            renderHomeGrid(embroideredGrid, data.result);
          }
        })
        .catch(function (err) {
          console.error('Error fetching embroidered products:', err);
          embroideredGrid.innerHTML = '<div style="grid-column: 1 / -1; text-align: center; padding: 4rem;"><p>Failed to load products.</p></div>';
        });
    }
  }

})();
