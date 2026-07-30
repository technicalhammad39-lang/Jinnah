# Data Model

## Overview
Currently, the application operates as a static frontend with mocked data. All product and category data is hardcoded in the `/data/products.ts` file.

## Interfaces

### Product
Defines the structure of a hardware item:
- `id`, `name`, `brand`, `category`, `categorySlug`
- `price`, `originalPrice`, `discount`
- `rating`, `reviewCount`
- `images` (array of URLs), `colors`, `sizes`
- `description`, `specifications` (key-value pair object), `features` (array of strings)
- Flags: `isNew`, `isBestSeller`, `freeShipping`
- `availability`: "In Stock" | "Low Stock" | "Out of Stock"

### Brand
Defines brand entities:
- `id`, `name`, `logoText`, `description`, `categories`

### Category
Defines product categories:
- `id`, `name`, `slug`, `count` (number of items), `description`, `image`

## Scaling Considerations
To scale this application for production, this static data layer should be replaced with dynamic data fetching from a backend service (e.g., Node.js/Express, Firebase, Supabase, or a headless CMS like Sanity).

The transition path:
1. Replace static imports of `PRODUCTS` with API calls (e.g., using `fetch` or a library like React Query / SWR).
2. Implement backend database schemas mirroring these interfaces.
3. Add loading and error states to components currently relying on immediate availability of static data.
