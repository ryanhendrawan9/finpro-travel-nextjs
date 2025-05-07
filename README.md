travel-app/
│
├── public/ # Static assets
│ ├── favicon.ico
│ ├── logo.svg
│ └── images/
│ ├── banners/
│ │ ├── banner1.jpg
│ │ ├── banner2.jpg
│ │ └── banner3.jpg
│ ├── categories/
│ │ ├── category1.jpg
│ │ ├── category2.jpg
│ │ └── category3.jpg
│ ├── activities/
│ │ ├── activity1.jpg
│ │ ├── activity2.jpg
│ │ └── activity3.jpg
│ └── placeholders/
│ ├── activity-placeholder.jpg
│ ├── category-placeholder.jpg
│ └── user-placeholder.jpg
│
├── src/
│ ├── app/ # Next.js App Router Structure
│ │ ├── (auth)/ # Authentication Group
│ │ │ ├── login/
│ │ │ │ └── page.jsx
│ │ │ ├── register/
│ │ │ │ └── page.jsx
│ │ │ └── layout.jsx
│ │ │
│ │ ├── (user)/ # User Group
│ │ │ ├── profile/
│ │ │ │ └── page.jsx  
│ │ │ ├── transaction/
│ │ │ │ ├── [id]/
│ │ │ │ │ └── page.jsx
│ │ │ │ └── page.jsx
│ │ │ ├── cart/
│ │ │ │ └── page.jsx
│ │ │ └── layout.jsx
│ │ │
│ │ ├── (admin)/ # Admin Group
│ │ │ ├── dashboard/
│ │ │ │ └── page.jsx
│ │ │ ├── activity/
│ │ │ │ ├── create/
│ │ │ │ │ └── page.jsx
│ │ │ │ ├── edit/[id]/
│ │ │ │ │ └── page.jsx
│ │ │ │ └── page.jsx
│ │ │ ├── category/
│ │ │ │ └── page.jsx
│ │ │ ├── banner/
│ │ │ │ └── page.jsx
│ │ │ ├── promo/
│ │ │ │ └── page.jsx
│ │ │ ├── transaction/
│ │ │ │ └── page.jsx
│ │ │ └── layout.jsx
│ │ │
│ │ ├── activity/
│ │ │ ├── [id]/
│ │ │ │ └── page.jsx
│ │ │ └── page.jsx
│ │ │
│ │ ├── category/
│ │ │ ├── [id]/
│ │ │ │ └── page.jsx
│ │ │ └── page.jsx
│ │ │
│ │ ├── promo/
│ │ │ ├── [id]/
│ │ │ │ └── page.jsx
│ │ │ └── page.jsx
│ │ │
│ │ ├── search/
│ │ │ └── page.jsx
│ │ │
│ │ ├── layout.jsx # Root layout
│ │ ├── page.jsx # Homepage
│ │ ├── globals.css # Global styles
│ │ └── not-found.jsx # 404 page
│ │
│ ├── components/ # Reusable components
│ │ ├── ui/ # Basic UI components
│ │ │ ├── button.jsx
│ │ │ ├── input.jsx
│ │ │ ├── modal.jsx
│ │ │ ├── dropdown.jsx
│ │ │ ├── select.jsx
│ │ │ ├── card.jsx
│ │ │ ├── badge.jsx
│ │ │ ├── alert.jsx
│ │ │ ├── tooltip.jsx
│ │ │ ├── tabs.jsx
│ │ │ ├── avatar.jsx
│ │ │ ├── loader.jsx
│ │ │ ├── checkbox.jsx
│ │ │ ├── radio.jsx
│ │ │ ├── switch.jsx
│ │ │ ├── pagination.jsx
│ │ │ └── skeleton.jsx
│ │ │
│ │ ├── layout/ # Layout components
│ │ │ ├── navbar.jsx
│ │ │ ├── footer.jsx
│ │ │ ├── sidebar.jsx
│ │ │ ├── admin-header.jsx
│ │ │ ├── user-header.jsx
│ │ │ ├── breadcrumbs.jsx
│ │ │ └── search-bar.jsx
│ │ │
│ │ ├── home/ # Home page components
│ │ │ ├── hero.jsx
│ │ │ ├── banner-slider.jsx
│ │ │ ├── category-showcase.jsx
│ │ │ ├── popular-activities.jsx
│ │ │ ├── promo-section.jsx
│ │ │ ├── testimonials.jsx
│ │ │ ├── newsletter.jsx
│ │ │ ├── featured-destinations.jsx
│ │ │ └── call-to-action.jsx
│ │ │
│ │ ├── activity/ # Activity components
│ │ │ ├── activity-card.jsx
│ │ │ ├── activity-detail.jsx
│ │ │ ├── activity-form.jsx
│ │ │ ├── activity-gallery.jsx
│ │ │ ├── activity-location.jsx
│ │ │ ├── activity-reviews.jsx
│ │ │ ├── activity-pricing.jsx
│ │ │ ├── activity-facilities.jsx
│ │ │ └── related-activities.jsx
│ │ │
│ │ ├── category/ # Category components
│ │ │ ├── category-card.jsx
│ │ │ ├── category-grid.jsx
│ │ │ ├── category-form.jsx
│ │ │ └── category-filter.jsx
│ │ │
│ │ ├── auth/ # Auth components
│ │ │ ├── login-form.jsx
│ │ │ ├── register-form.jsx
│ │ │ ├── forgot-password-form.jsx
│ │ │ ├── auth-card.jsx
│ │ │ └── protected-route.jsx
│ │ │
│ │ ├── user/ # User components
│ │ │ ├── profile-form.jsx
│ │ │ ├── transaction-card.jsx
│ │ │ ├── transaction-list.jsx
│ │ │ ├── transaction-detail.jsx
│ │ │ ├── payment-proof-upload.jsx
│ │ │ └── user-sidebar.jsx
│ │ │
│ │ ├── cart/ # Cart components
│ │ │ ├── cart-item.jsx
│ │ │ ├── cart-summary.jsx
│ │ │ ├── payment-method-selector.jsx
│ │ │ ├── checkout-form.jsx
│ │ │ └── empty-cart.jsx
│ │ │
│ │ ├── admin/ # Admin components
│ │ │ ├── admin-sidebar.jsx
│ │ │ ├── stats-card.jsx
│ │ │ ├── data-table.jsx
│ │ │ ├── banner-form.jsx
│ │ │ ├── promo-form.jsx
│ │ │ ├── transaction-status-updater.jsx
│ │ │ └── user-management.jsx
│ │ │
│ │ ├── search/ # Search components
│ │ │ ├── search-results.jsx
│ │ │ ├── search-filters.jsx
│ │ │ └── search-not-found.jsx
│ │ │
│ │ ├── promo/ # Promo components
│ │ │ ├── promo-card.jsx
│ │ │ ├── promo-detail.jsx
│ │ │ ├── promo-form.jsx
│ │ │ └── promo-code-input.jsx
│ │ │
│ │ └── animations/ # Animation components
│ │ ├── fade-in.jsx
│ │ ├── slide-up.jsx
│ │ ├── stagger.jsx
│ │ ├── page-transition.jsx
│ │ ├── scale-in.jsx
│ │ ├── rotate.jsx
│ │ └── parallax.jsx
│ │
│ ├── hooks/ # Custom hooks
│ │ ├── useAuth.js # Authentication hook
│ │ ├── useCart.js # Cart management
│ │ ├── useActivities.js # Activities data
│ │ ├── useCategories.js # Categories data
│ │ ├── usePromos.js # Promos data
│ │ ├── useBanners.js # Banners data
│ │ ├── useTransactions.js # Transactions data
│ │ ├── useDebounce.js # Debounce function
│ │ ├── useLocalStorage.js # Local storage
│ │ ├── useMediaQuery.js # Responsive queries
│ │ ├── useScrollPosition.js # Scroll handling
│ │ ├── useOutsideClick.js # Detect outside clicks
│ │ └── usePagination.js # Pagination
│ │
│ ├── lib/ # Utility functions and libs
│ │ ├── api.js # API client
│ │ ├── formatters.js # Format dates, currency, etc.
│ │ ├── validation.js # Form validation
│ │ ├── constants.js # App constants
│ │ ├── helpers.js # Helper functions
│ │ ├── imageUpload.js # Image upload handling
│ │ ├── localStorage.js # Local storage utilities
│ │ ├── seo.js # SEO utilities
│ │ ├── errors.js # Error handling
│ │ └── animations.js # Animation configurations
│ │
│ ├── context/ # Context providers
│ │ ├── AuthContext.jsx # Authentication context
│ │ ├── CartContext.jsx # Shopping cart context
│ │ ├── UIContext.jsx # UI state context
│ │ ├── ModalContext.jsx # Modal context
│ │ ├── NotificationContext.jsx # Notifications
│ │ └── ThemeContext.jsx # Theme context (if needed)
│ │
│ └── styles/ # Additional styles
│ ├── animations.css # Animation styles
│ ├── variables.css # CSS variables
│ ├── utilities.css # Utility classes
│ └── fonts.css # Font imports
│
├── .env.local # Environment variables
├── .env.example # Example environment variables
├── .eslintrc.json # ESLint configuration
├── .gitignore # Git ignore file
├── jsconfig.json # JS configuration
├── next.config.js # Next.js configuration
├── package.json # Dependencies and scripts
├── postcss.config.js # PostCSS configuration
├── README.md # Project documentation
└── tailwind.config.js # Tailwind CSS configuration
