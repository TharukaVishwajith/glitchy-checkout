// Glitchy Checkout App - PlayerZero Demo
// This app contains two intentional bugs to demonstrate PlayerZero's debugging capabilities

let cartCount = 0;
let cart = null; // Bug 2: This will be null, causing TypeError when we try to access cart.items

// DOM Elements
const addBtn = document.getElementById('add-btn');
const checkoutBtn = document.getElementById('checkout-btn');
const cartCountDisplay = document.getElementById('cart-count');
const statusMessage = document.getElementById('status-message');
const debugLog = document.getElementById('debug-log');

// Initialize cart object (comment this out to trigger Bug 2)
// cart = { items: [], total: 0 };

// Debug logging function
function log(message, type = 'info') {
    const timestamp = new Date().toLocaleTimeString();
    const logEntry = `[${timestamp}] ${message}`;
    console.log(logEntry);
    
    // Append to debug console in UI
    const logElement = document.createElement('div');
    logElement.style.marginBottom = '4px';
    logElement.style.color = type === 'error' ? '#c53030' : type === 'success' ? '#276749' : '#2c5282';
    logElement.textContent = logEntry;
    debugLog.appendChild(logElement);
    
    // Keep only last 10 logs
    while (debugLog.children.length > 10) {
        debugLog.removeChild(debugLog.firstChild);
    }
}

// Show status message
function showStatus(message, type = 'info') {
    statusMessage.textContent = message;
    statusMessage.className = `status-message status-${type}`;
}

// Bug 1: The Network Failure (Failing API)
// This fetch request will fail with a 404 error
async function addToCart() {
    addBtn.disabled = true;
    showStatus('⏳ Adding to cart...', 'info');
    log('Attempting to add item to cart...');

    try {
        // Bug 1: Invalid API endpoint (404 error)
        const response = await fetch('https://jsonplaceholder.typicode.com/invalid-endpoint', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                product: 'Premium Widget Pro',
                price: 49.99,
                quantity: 1
            })
        });

        log(`API Response Status: ${response.status}`, response.ok ? 'success' : 'error');

        if (!response.ok) {
            throw new Error(`API Error: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        log('Item added successfully to cart', 'success');
        
        cartCount++;
        cartCountDisplay.textContent = cartCount;
        showStatus(`✅ Added to cart! Total items: ${cartCount}`, 'success');

    } catch (error) {
        // Silent failure - user sees nothing useful
        log(`Error adding to cart: ${error.message}`, 'error');
        showStatus('❌ Failed to add item (Network error)', 'error');
        console.error('Fetch Error:', error);
        
        // PlayerZero will capture this error
        if (window.PlayerZero && window.PlayerZero.captureError) {
            window.PlayerZero.captureError(error);
        }
    } finally {
        addBtn.disabled = false;
    }
}

// Bug 2: The JS Exception (Frontend Crash)
// This function tries to access a property of null/undefined
function checkout() {
    checkoutBtn.disabled = true;
    showStatus('⏳ Processing checkout...', 'info');
    log('Checkout initiated');

    try {
        // Bug 2: cart is null, accessing cart.items will throw TypeError
        if (cartCount === 0) {
            showStatus('❌ Your cart is empty!', 'error');
            log('Checkout failed: Empty cart', 'error');
            return;
        }

        // THIS LINE WILL CRASH - cart is null
        // TypeError: Cannot read property 'items' of null
        const items = cart.items; // BUG 2 TRIGGER
        
        log(`Processing ${items.length} items...`);

        // Simulate checkout delay
        setTimeout(() => {
            cartCount = 0;
            cartCountDisplay.textContent = '0';
            showStatus('✅ Checkout successful! Thank you for your purchase.', 'success');
            log('Checkout completed successfully', 'success');
            checkoutBtn.disabled = false;
        }, 1500);

    } catch (error) {
        log(`Checkout error: ${error.message}`, 'error');
        showStatus(`❌ Checkout failed: ${error.message}`, 'error');
        console.error('Checkout Error:', error);
        
        // PlayerZero will capture this error with stack trace
        if (window.PlayerZero && window.PlayerZero.captureError) {
            window.PlayerZero.captureError(error, {
                context: 'checkout',
                cartCount: cartCount,
                timestamp: new Date().toISOString()
            });
        }
        
        checkoutBtn.disabled = false;
    }
}

// Event listeners
addBtn.addEventListener('click', () => {
    log('Add to Cart button clicked');
    addToCart();
});

checkoutBtn.addEventListener('click', () => {
    log('Checkout button clicked');
    checkout();
});

// Initialize app
function initializeApp() {
    log('Glitchy Checkout app initialized', 'success');
    log('PlayerZero project: glitchy-checkout-demo', 'info');
    log('Ready to demonstrate bugs...', 'info');
    showStatus('👋 Welcome! Try adding items and checking out.', 'info');
}

// Start the app
window.addEventListener('DOMContentLoaded', initializeApp);
initializeApp();

// Export for debugging
window.glitchyCheckout = {
    addToCart,
    checkout,
    getCartCount: () => cartCount,
    getCart: () => cart,
    log
};
