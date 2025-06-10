document.addEventListener('DOMContentLoaded', function() {
    const signInBtn = document.querySelector('.sign-in-btn');
    
    if (signInBtn) {
        signInBtn.addEventListener('click', function(e) {
            e.preventDefault();
            
            const authToken = localStorage.getItem('authToken');
            
            if (authToken) {
                window.location.href = '/account-settings.html';
            } else {
                window.location.href = '/auth.html';
            }
        });
    }

    function parseJwt(token) {
        try {
            const base64Url = token.split('.')[1];
            const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');

            const jsonPayload = decodeURIComponent(
                atob(base64)
                    .split('')
                    .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
                    .join('')
            );

            return JSON.parse(jsonPayload);
        } catch (e) {
            console.error('Error parsing JWT:', e);
                return null;
        }
    }
    
    function checkAuthStatus() {
        const authToken = localStorage.getItem('authToken');
        const signInBtn = document.querySelector('.sign-in-btn');
        const userData = parseJwt(authToken);
        if (authToken && signInBtn) {
            if (userData && userData.name) {
                const firstName = userData.name.split(' ')[0];
                const img = signInBtn.querySelector('img');
                signInBtn.innerHTML = img ? img.outerHTML + firstName : firstName;
            } else {
                const img = signInBtn.querySelector('img');
                signInBtn.innerHTML = img ? img.outerHTML + 'Личный кабинет' : 'Личный кабинет';
            }
        }
        
    }
    

    async function fetchUserData() {
    try {
        const response = await fetch('/user');
        if (response.ok) {
            const data = await response.json();
            localStorage.setItem('userId', data.id);
            return data;
        } else {
            console.error('Ошибка получения данных пользователя');
            return null;
        }
    } catch (e) {
        console.error('Ошибка сети:', e);
        return null;
    }
}

    async function fillDeliveryFields() {
    const userData = await fetchUserData();
    if (userData) {
        const nameInput = document.querySelector('.name-field');
        const phoneInput = document.querySelector('.phone-field');
        const addressInput = document.querySelector('.address-textarea');
        console.log(userData)

        if (addressInput && userData.email) {
            addressInput.value = userData.address.split(' ')[0];
        }

        if (nameInput && userData.name) {
            nameInput.value = userData.name.split(' ')[0];
        }

        if (phoneInput && userData.phone) {
            phoneInput.value = userData.phone;
        }
    }
}

    fillDeliveryFields();
    checkAuthStatus();
});

function displayCartItems() {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    const container = document.querySelector('.basket-sos-table');
    
        const itemsContainer = document.createElement('div');
        
        cart.forEach(item => {
            const itemElement = createCartItemElement(item);
            itemsContainer.appendChild(itemElement);
        });
        
        container.insertBefore(itemsContainer, container.querySelector('.finalcost'));
    
    updateOrderSummary();
}

function createCartItemElement(item) {
    const itemElement = document.createElement('div');
    itemElement.className = 'pizza-block';
    itemElement.dataset.itemId = item.cartItemId;
    itemElement.innerHTML = `
        <img class="pizza-img" src="${item.image}" alt="${item.name}">
        <div class="pizza-txt">
            <div class="pizzatxt3">
                <h3>${item.name}</h3>
            </div>
        </div>
        <div class="buttons1">
            <button class="decrease-btn">-</button>
            <p class="item-quantity">${item.quantity}</p>
            <button class="increase-btn">+</button>
        </div>
        <div class="sale-cost-txt">
            <p>Цена: <span>${item.price}</span></p>
        </div>
        <button class="krestik remove-btn"><img src="assets/Vector.png" alt=""></button>
    `;

    itemElement.querySelector('.decrease-btn').addEventListener('click', () => {
        updateQuantity(item.cartItemId, -1, itemElement);
    });
    
    itemElement.querySelector('.increase-btn').addEventListener('click', () => {
        updateQuantity(item.cartItemId, 1, itemElement);
    });
    
    itemElement.querySelector('.remove-btn').addEventListener('click', () => {
        removeItem(item.cartItemId);
        itemElement.remove();
    });

    return itemElement;
}

function calculateTotal() {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    return cart.reduce((sum, item) => {
        const price = parseFloat(item.price.replace(' руб.', ''));
        return sum + (price * item.quantity);
    }, 0);
}

function updateQuantity(itemId, change, itemElement) {
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    const itemIndex = cart.findIndex(item => item.cartItemId === itemId);
    
    if (itemIndex !== -1) {
        cart[itemIndex].quantity += change;
        
        if (cart[itemIndex].quantity <= 0) {
            cart.splice(itemIndex, 1);
            itemElement.remove();
        } else {
            itemElement.querySelector('.item-quantity').textContent = cart[itemIndex].quantity;
        }
        
        localStorage.setItem('cart', JSON.stringify(cart));
        updateCartCount();
        updateOrderSummary();
    }
}

function updateCartCount() {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    const cartCounter = document.querySelector('.cart-counter');
    if (cartCounter) {
        cartCounter.textContent = totalItems;
    }
}

function removeItem(itemId) {
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    cart = cart.filter(item => item.cartItemId !== itemId);
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartCount();
    updateOrderSummary();
}

function updateOrderSummary() {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    const total = calculateTotal();
    const deliveryCost = cart.length > 0 ? 400 : 0; 
    
    document.querySelector('.product-cost:nth-child(2) p:last-child').textContent = `${total} руб`;
    document.querySelector('.k-oplate-cost').textContent = `${total + deliveryCost} руб`;
    document.querySelector('.finalcost .costs p:first-child').textContent = `${total} руб.`;
    document.querySelector('.final-cost-w-delivery-section h3').textContent = `${total + deliveryCost} руб.`;
    document.querySelector('.product-cost:nth-child(4) p:last-child').textContent = `${deliveryCost} руб`;
}

document.addEventListener('DOMContentLoaded', function() {
    displayCartItems();
    
    document.querySelector('.place-an-order-btn')?.addEventListener('click', () => {
    });
    
    document.querySelector('.place-an-order-btn-main')?.addEventListener('click', () => {
    });
    
    document.querySelector('.promo-textarea-apply-btn')?.addEventListener('click', applyPromoCode);
});

function applyPromoCode() {
    alert('Промокод применен!');
    updateOrderSummary();
}

function updateCartTotals() {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    
    const productsTotal = cart.reduce((sum, item) => {
        const price = parseFloat(item.price.replace(' руб.', ''));
        return sum + (price * item.quantity);
    }, 0);
    
    const deliveryCost = cart.length > 0 ? 400 : 0;

    document.getElementById('total-without-delivery').textContent = `${productsTotal} руб.`;
    document.getElementById('original-total').textContent = `${productsTotal} руб.`;
    document.getElementById('products-total').textContent = `${productsTotal} руб`;
    document.getElementById('delivery-cost').textContent = `${deliveryCost} руб`;
    document.getElementById('total-to-pay').textContent = `${productsTotal + deliveryCost} руб`;
    document.getElementById('final-total-with-delivery').textContent = `${productsTotal + deliveryCost} руб.`;
}

function getNoun(number, one, two, five) {
    let n = Math.abs(number);
    n %= 100;
    if (n >= 5 && n <= 20) {
        return five;
    }
    n %= 10;
    if (n === 1) {
        return one;
    }
    if (n >= 2 && n <= 4) {
        return two;
    }
    return five;
}

document.addEventListener('DOMContentLoaded', function() {
    updateCartTotals();
    updateCartCount();
    
    document.querySelectorAll('.increase-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const itemId = this.closest('.pizza-block').dataset.itemId;
            changeQuantity(itemId, 1);
        });
    });
    
    document.querySelectorAll('.decrease-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const itemId = this.closest('.pizza-block').dataset.itemId;
            changeQuantity(itemId, -1);
        });
    });
    
    document.querySelectorAll('.remove-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const itemId = this.closest('.pizza-block').dataset.itemId;
            removeItem(itemId);
            this.closest('.pizza-block').remove();
        });
    });
});

document.addEventListener('DOMContentLoaded', function() {
    document.querySelector('.place-an-order-btn')?.addEventListener('click', placeOrder);
    document.querySelector('.place-an-order-btn-main')?.addEventListener('click', placeOrder);
});

const cart = JSON.parse(localStorage.getItem('cart')) || [];
async function placeOrder() {
    const userId = localStorage.getItem('userId');
    if (!userId) {
        alert('Пожалуйста, войдите в систему, чтобы оформить заказ.');
        return;
    }

    const deliveryAddress = document.querySelector('.address-textarea').value;
    const paymentMethod = 'Наличными при получении';
    const comment = document.querySelector('.commentary-textarea').value;
    const cart = JSON.parse(localStorage.getItem('cart')) || [];

    if (!cart.length) {
        alert('Пожалуйста, добавьте предметы в корзину, чтобы оформить заказ.');
        return;
    }
    const items = cart.map(item => ({
        name: item.name,
        price: item.price.split(' ')[0],
        quantity : item.quantity
    }));

    const orderData = {
        userId,
        deliveryAddress,
        paymentMethod,
        comment,
        items
    };

    try {
        const response = await fetch('/submit-order', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            credentials: 'include',
            body: JSON.stringify(orderData)
        });

        const result = await response.json();

        if (response.ok) {
            alert('Заказ успешно оформлен! Номер заказа: ' + result.orderId);
            localStorage.removeItem('cart');
            window.location.href = '/main.html';
        } else {
            alert('Ошибка оформления заказа: ' + result.message);
        }
    } catch (error) {
        console.error('Ошибка при оформлении заказа:', error);
        alert('Ошибка сервера. Попробуйте позже.');
    }
}
