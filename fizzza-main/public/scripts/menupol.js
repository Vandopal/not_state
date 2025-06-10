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

        if (authToken && userData) {
            if (userData.name) {
                const firstName = userData.name.split(' ')[0];
                const img = signInBtn.querySelector('img');
                signInBtn.innerHTML = img ? img.outerHTML + firstName : firstName;
            } else {
                signInBtn.innerHTML = 'Личный кабинет';
            }
        } else {
            signInBtn.innerHTML = 'Войти';
        }
    }
    
    checkAuthStatus();
});

async function loadPizzas() {
    try {
        const response = await fetch('/all-food');
        const data = await response.json();
        const pizzas = data.pizzas;
        const pizzaCardsContainer = document.getElementById('pizza-cards');
        pizzaCardsContainer.innerHTML = '';
        pizzas.forEach(pizza => {
            const pizzaCard = createFoodCard(pizza);
            pizzaCardsContainer.appendChild(pizzaCard);
        });
    } catch (error) {
        console.error('Ошибка при загрузке пиц:', error);
    }
}

async function loadSalads() {
    try {
        const response = await fetch('/all-food');
        const data = await response.json();
        const salads = data.salads;
        const saladCardsContainer = document.getElementById('salad-cards');
        saladCardsContainer.innerHTML = '';
        salads.forEach(salad => {
            const saladCard = createFoodCard(salad);
            saladCardsContainer.appendChild(saladCard);
        });
    } catch (error) {
        console.error('Ошибка при загрузке салатов:', error);
    }
}

async function loadSnacks() {
    try {
        const response = await fetch('/all-food');
        const data = await response.json();
        const snacks = data.snacks;
        const snackCardsContainer = document.getElementById('snack-cards');
        snackCardsContainer.innerHTML = '';
        snacks.forEach(snack => {
            const snackCard = createFoodCard(snack);
            snackCardsContainer.appendChild(snackCard);
        });
    } catch (error) {
        console.error('Ошибка при загрузке снэков:', error);
    }
}

async function loadBurgers() {
    try {
        const response = await fetch('/all-food');
        const data = await response.json();
        const burgers = data.burgers;
        const burgerCardsContainer = document.getElementById('burger-cards');
        burgerCardsContainer.innerHTML = '';
        burgers.forEach(burger => {
            const burgerCard = createFoodCard(burger);
            burgerCardsContainer.appendChild(burgerCard);
        });
    } catch (error) {
        console.error('Ошибка при загрузке бургеров:', error);
    }
}

async function loadDrinks() {
    try {
        const response = await fetch('/all-food');
        const data = await response.json();
        const drinks = data.drinks;
        const drinkCardsContainer = document.getElementById('drink-cards');
        drinkCardsContainer.innerHTML = '';
        drinks.forEach(drink => {
            const drinkCard = createFoodCard(drink);
            drinkCardsContainer.appendChild(drinkCard);
        });
    } catch (error) {
        console.error('Ошибка при загрузке напитков:', error);
    }
}

function createStars(orange, white) {
    const starsContainer = document.createElement('div');

    for (let i = 0; i < orange; i++) {
        const star = document.createElement('img');
        star.src = '../assets/StarOrange.png';
        star.className = 'star';
        starsContainer.appendChild(star);
    }


    for (let i = 0; i < white; i++) {
        const star = document.createElement('img');
        star.src = '../assets/starWhite.png';
        star.className = 'star';
        starsContainer.appendChild(star);
    }
    return starsContainer;
}

function createFoodCard(item) {
    const card = document.createElement('div');
    card.className = 'food-card';
    card.innerHTML = `
        <img class="food-image" src="${item.image}" alt="${item.name}">
        <div class="food-card-block">
            <p>${item.name}</p>
            <div class="stars">${createStars(Math.floor(item.rating), 5 - Math.floor(item.rating)).outerHTML}</div>
            <div class="cost">
                <p>${item.price}</p>
                <img class="plus" src="assets/Add to cart Icon.png" alt="">
            </div>
        </div>
    `;
    
    const plusButton = card.querySelector('.plus');
    plusButton.addEventListener('click', () => {
        addToCart(item);
    });
    
    return card;
}

function addToCart(item) {
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    
    const newCartItem = {
        ...item,
        cartItemId: Date.now(),
        quantity: 1
    };
    
    cart.push(newCartItem);
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartCount();
    alert(`Товар "${item.name}" добавлен в корзину!`);
}



function updateCartCount() {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    
    const cartCounter = document.querySelector('.cart-counter');
    if (cartCounter) {
        cartCounter.textContent = totalItems;
    }
}

function calculateTotal() {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    return cart.reduce((sum, item) => {
        const price = parseFloat(item.price.replace(' руб.', ''));
        return sum + (price * item.quantity);
    }, 0);
}

function showSection(sectionId) {
    const contentContainer = document.getElementById('content-container');
    contentContainer.innerHTML = '';
    
    const buttons = document.querySelectorAll('.food-class-button');
    buttons.forEach(button => {
        button.classList.remove('active');
    });

    const activeButton = Array.from(buttons).find(button => button.onclick.toString().includes(sectionId));
    if (activeButton) {
        activeButton.classList.add('active');
    }

    switch (sectionId) {
        case 'pizza-container':
            contentContainer.innerHTML = `
                <div class="pizzas-cards" id="pizza-cards"></div>
            `;
            loadPizzas();
            break;
        case 'salad-container':
            contentContainer.innerHTML = `
                <div class="pizzas-cards" id="salad-cards"></div>
            `;
            loadSalads();
            break;
        case 'snack-container':
            contentContainer.innerHTML = `
                <div class="pizzas-cards" id="snack-cards"></div>
            `;
            loadSnacks();
            break;
        case 'burger-container':
            contentContainer.innerHTML = `
                <div class="pizzas-cards" id="burger-cards"></div>
            `;
            loadBurgers();
            break;
        case 'drink-container':
            contentContainer.innerHTML = `
                <div class="pizzas-cards" id="drink-cards"></div>
            `;
            loadDrinks();
            break;
        default:
            contentContainer.innerHTML = '<p>Выберите категорию.</p>';
    }
}

window.onload = function() {
    showSection('pizza-container');
};