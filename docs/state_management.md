# State Management

## Overview
State management in this application is handled natively using React Context API (`AppContext.tsx`) combined with standard React hooks (`useState`, `useEffect`).

## AppContext
The `AppContext` provides a global state wrapper for the entire application, specifically managing e-commerce functionalities:

- **Cart State (`cart`):** Tracks items added to the cart, including product details, quantity, selected color, and selected size.
- **Wishlist State (`wishlist`):** Tracks a list of product IDs marked as favorites by the user.
- **UI State (`cartOpen`, `searchOpen`, `quickViewProduct`):** Manages the visibility of the cart drawer, search overlay, and quick view modals.

## Persistence
State persistence is implemented using the browser's `localStorage`:
- `jinnah_cart`: Stores the user's cart items across sessions.
- `jinnah_wishlist`: Stores the user's wishlist across sessions.

The context utilizes `useEffect` hooks to synchronize the React state with `localStorage` on initial mount and whenever the state changes.

## Available Actions
The context exposes several functions for components to interact with the state:
- `addToCart(product, quantity, color, size)`
- `removeFromCart(productId, color, size)`
- `updateCartQuantity(productId, color, size, quantity)`
- `toggleWishlist(productId)`
- `clearCart()`
- `setCartOpen(open)`, `setSearchOpen(open)`, `setQuickViewProduct(product)`
