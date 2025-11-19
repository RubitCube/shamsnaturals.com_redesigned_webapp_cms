## Day 1 – 10 Nov 2025

- Bootstrapped Laravel + React CMS stack.
- Added events and countries management to admin backend/frontend.
- Updated public contact cards and wired new menus across routes.
- Commit: `Day1_101125_Laravel_backend_CMS_react_frontend`.

## Day 2 – 11 Nov 2025

- Delivered real-time analytics dashboard (visits, clicks, referrals) plus live footer counter.
- Extended analytics API + tracking hooks.
- Enhanced dealer management filters, map integration, and view-only modal.
- Commit: `Day_2_11112025: Implement live site analytics dashboard…`.

## Day 3 – 12 Nov 2025

- Replaced Google Maps stack with Leaflet + Nominatim (zero cost).
- Added GeoSearch, dealer list search, and polling to auto-pan to new dealers.
- Documented free maps solution + migration guides.
- Commit: `Day_3_12112025: Replace Google Maps with 100% FREE OpenStreetMap solution…`.

## Day 4 – 13 Nov 2025

- Overhauled dealer form (multi-phone inputs, website/location embeds, validation).
- Added status badges, confirmation modal, row coloring, and auto zoom/pan for new markers.
- Compact popup cards, map z-index fixes, phone/website persistence fixes.
- Commit: `Day_4_13112025: Enhanced dealers management with Google Maps embed coordinate extraction…`.

## Day 5 – 14 Nov 2025

- Brand/UI polish: pastel CTA palette, logo placement, social icon refresh, consistent banner sizing with lazy loading.
- Swapped markers to butterfly PNG (Leaflet + homepage), refined dealer popups.
- Admin login carousel w/ glass card, CMS tagline, larger logos, hamburger sidebar toggle.
- Added change password API + admin page, Products mega menu, About Us reorder.
- Commit: `Day_5_14112025: Add CMS change password screen, brand marker updates, admin UI polish`.

## Day 6 – 15 Nov 2025

- **Category Management Redesign:**

  - Redesigned category management page with table layout matching reference design (columns: #, Category, Sub Category Level 1, Products, Image, Banner, Priority, Status, Actions)
  - Added "View Products" and "Add Products" buttons in Products column for each category
  - Created standalone "Add Category" page (`AdminCategoryCreate.tsx`) with form matching reference (Category Name, Category Image, Category Banner fields with size hints)
  - Implemented "Set Priority Category" page (`AdminCategoryPriority.tsx`) with drag-and-drop reordering functionality
  - Added banner column to categories table (migration + model updates)
  - Backend now returns `image_url` and `banner_url` for categories, includes `products_count`

- **Product Management Enhancements:**

  - Created standalone "Add Product" page (`AdminProductCreate.tsx`) matching reference design:
    - Product Details section (Category, Sub Category, Product Code, Dimension, Color, Materials, New Arrivals, Status)
    - Product Description section (textarea)
    - Product Photos section (6 upload slots with size hints: 1000px \* 800px)
  - Added edit mode support to `AdminProductCreate` - can edit products via `/admin/products/new?edit={id}`
  - Created "View Product Details" page (`AdminCategoryProducts.tsx`) showing:
    - Product Details card with all specifications
    - Product Description card
    - Product Photos section with image gallery
  - Added "View" action button in Products Management table (navigates to category products view)
  - Updated "Edit" action to use same form layout as Add Product
  - Implemented "Set Priority Product Images" page (`AdminProductImagePriority.tsx`) with drag-and-drop reordering
  - Products added from category page now appear in Products Management (shared API endpoint)

- **Image Handling Fixes:**

  - Fixed product image URLs - backend now generates absolute URLs with correct port (`http://localhost:8000/storage/...`)
  - Updated `ProductImage` model to use `getHttpHost()` for proper URL generation
  - Fixed frontend image resolution to always use backend URL instead of frontend origin
  - Changed image storage to preserve original filenames (sanitized + timestamp) instead of random hashes
  - Example: `product_image_1734523456.webp` instead of `JZv6vSA2nJqk5OGznucCdG2wsrENFt0eZDN0oSfi.webp`
  - Fixed malformed URL concatenation issues
  - Added proper error handling for broken images (hide instead of showing placeholder)

- **Backend API Updates:**

  - Added `reorderImages()` method to `ProductController` for updating product image order
  - Route: `POST /admin/products/{id}/images/reorder`
  - Updated `uploadImage()` to store files with original filenames
  - Product images now sorted by `order` field when fetched
  - Fixed `is_primary` field validation (accepts "1" string for boolean conversion)

- **Database:**

  - Created migration to add `banner` column to categories table
  - Reset products table AUTO_INCREMENT to 1
  - Product images table already had `order` column (used for priority)

- **UI/UX Improvements:**

  - All product images now display correctly in Product Photos section
  - Drag-and-drop interface for both category and product image priority management
  - Breadcrumb navigation throughout admin panel
  - Consistent form layouts matching reference designs
  - Proper loading states and error messages

- Commit: `Day_6_15112025 enhance category and product admin flows`.

## Day 7 – 17 Nov 2025

- **Product Gallery & Priority Pages Redesign:**

  - Updated Product Gallery List page (`AdminCategoryProductGallery.tsx`) to show Previous/Next navigation buttons directly on each product card
  - Removed separate "Image Gallery" section - navigation is now on the cards themselves
  - Each product card can cycle through its images independently with `<` and `>` buttons
  - Added image counter (e.g., "1 / 3") on cards with multiple images
  - Updated all Set Priority pages to match this pattern:
    - **Product Priority Page** (`AdminCategoryProductPriority.tsx`): Previous/Next on product cards, removed separate gallery
    - **Category Priority Page** (`AdminCategoryPriority.tsx`): Removed separate gallery section
    - **Product Image Priority Page** (`AdminProductImagePriority.tsx`): Converted to single card view with Previous/Next navigation and priority change buttons (↑ ↓)
  - All priority pages now start priority numbering from 0
  - Priority change buttons (↑ ↓) added to Product Image Priority page for reordering

- **Admin Layout Enhancements:**

  - Added back button (←) to AdminLayout header that appears on all admin pages except dashboard
  - Back button uses browser history (`navigate(-1)`) to return to previous page
  - Positioned between hamburger menu and page title
  - Styled consistently with other header buttons

- **Products Management Page Enhancements:**

  - Added comprehensive product details view section (similar to category products page)
  - Product details view includes:
    - Product Details card (Code, Dimension, Color, Materials, New Arrivals, Status, Price)
    - Product Description card
    - Product Photos section with grid display, Set Priority, and Add buttons
  - Product selector dropdown to switch between products
  - "Modify" button to edit selected product
  - "Close" button to return to table view
  - Updated table columns:
    - **Added:** Product Code/Name, Product Color, Product Dimension, New Arrivals, Product Materials, Product Description, Product Photos
    - **Removed:** Price column
    - **Kept:** ID, Category, Status, Actions
  - Product photos display as thumbnails (up to 3 visible, "+X" indicator for more)
  - Product description truncated to 50 characters with ellipsis
  - Enhanced `fetchProducts()` to load full product details including images for table display
  - Parses `short_description` to extract dimension, color, and materials (pipe-separated format)

- **Code Improvements:**

  - Added `formatCurrency()` helper function for price display
  - Improved image URL resolution for product photos in table
  - Added horizontal scroll wrapper for wide tables
  - Better state management for product selection and details view

- Commit: `Day_7_17112025: Redesign product gallery and priority pages, add back button, enhance products management`.
