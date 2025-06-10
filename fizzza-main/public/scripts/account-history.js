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
    
    checkAuthStatus();
});