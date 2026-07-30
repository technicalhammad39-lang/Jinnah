# UI Components

## Overview
The application's UI is highly modularized, residing in the `/components` directory. Components are functionally grouped to maintain a clean codebase.

## Component Categories

### 1. Navigation (`/components/navigation`)
Handles global navigation and overlays.
- `Navbar.tsx`: Main site header.
- `Footer.tsx`: Site footer.
- `SearchOverlay.tsx`: Full-screen search interface.
- `CartDrawer.tsx`: Slide-out shopping cart interface.

### 2. Products (`/components/products`)
Product display and interaction components.
- `ProductCard.tsx`: Reusable component for displaying individual products.
- `ProductShowcase.tsx`: Advanced interactive product display section.
- `QuickViewModal.tsx`: Modal for viewing product details without navigating to a new page.

### 3. Sections (`/components/sections`)
Major landing page sections.
- `CategorySection.tsx`: Bento-grid layout for categories.
- `BrandsSection.tsx`: Marquee showcasing brand logos.
- `WhyChooseUs.tsx`, `AboutSection.tsx`, `UseCases.tsx`: Informational sections.
- `GallerySection.tsx`: Masonry layout image gallery.
- `MapSection.tsx`: Location display.
- `ContactSection.tsx`, `NewsletterCTA.tsx`: User engagement and lead generation.

### 4. Hero (`/components/hero`)
- `AnimatedMarqueeHero.tsx`: The highly animated hero section at the top of the homepage.

### 5. Animations (`/components/animations`)
Global animation wrappers.
- `InteractiveBackground.tsx`: Dynamic background effects.
- `Cursor.tsx`: Custom interactive mouse cursor implementation.
