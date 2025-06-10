document.addEventListener('DOMContentLoaded', function() {
    const signInBtn = document.querySelector('.sign-in-btn');

    if (signInBtn) {
        signInBtn.addEventListener('click', function(e) {
            e.preventDefault();
            const authToken = localStorage.getItem('authToken');
            window.location.href = authToken ? '/account-settings.html' : '/auth.html';
        });
    }

    function parseJwt(token) {
        if (!token) return null;
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

        if (authToken && signInBtn && userData) {
            const firstName = userData.name?.split(' ')[0] || 'Личный кабинет';
            const img = signInBtn.querySelector('img');
            signInBtn.innerHTML = img ? img.outerHTML + ' ' + firstName : firstName;
        }
    }
    function getAuth() {
        const authToken = localStorage.getItem('authToken');
        if (!authToken) {
            window.location.href = '/auth.html';
            return;
        }

        const userData = parseJwt(authToken);
        if (userData) {
            console.log(userData)

            const firstNameInput = document.querySelector('.first-name');
            const lastNameInput = document.querySelector('.last-name');
            const emailInput = document.querySelector('.email');
            const phoneInput = document.querySelector('.phone');
            const addressInput = document.querySelector('.address');

            if (firstNameInput) {
                firstNameInput.value = userData.name;
                firstNameInput.readOnly = false;
            }
            if (lastNameInput) {
                lastNameInput.value = userData.surname;
                lastNameInput.readOnly = false;
            }
            if (emailInput) {
                emailInput.value = userData.email || '';
                emailInput.readOnly = false;
            }
            if (phoneInput) {
                phoneInput.value = userData.phone || '';
                phoneInput.readOnly = false;
            }
            if (addressInput) {
                addressInput.value = userData.address || '';
                addressInput.readOnly = false;
            }
        }
    }

const saveBtn = document.querySelector('.save-btn');
if (saveBtn) {
    saveBtn.addEventListener('click', async () => {
        const authToken = localStorage.getItem('authToken');
        if (!authToken) {
            alert('Пожалуйста, войдите в систему');
            window.location.href= '/auth.html';
            return;
        }

        const firstName = document.querySelector('.first-name')?.value.trim() || '';
        const lastName = document.querySelector('.last-name')?.value.trim() || '';
        const email = document.querySelector('.email')?.value.trim() || '';
        const phone = document.querySelector('.phone')?.value.trim() || '';
        const address = document.querySelector('.address')?.value.trim() || '';

        try {
          saveBtn.disabled= true;
          saveBtn.textContent= 'Сохранение...';

          const response= await fetch('http://localhost:5000/user/update', {
              method: 'POST',
              headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${authToken}`
              },
              body: JSON.stringify({
                name: firstName,
                surname: lastName,
                email: email,
                phone: phone,
                address: address
            })
          });

          const result= await response.json();

          if (!response.ok) throw new Error(result.message || 'Ошибка при сохранении данных');

          alert('Данные успешно сохранены!');

          if (result.token) {
              localStorage.setItem('authToken', result.token);
          }

      } catch (error) {
          console.error('Ошибка:', error);
          alert(error.message || 'Произошла ошибка при сохранении данных');
      } finally {
          saveBtn.disabled= false;
          saveBtn.textContent= 'Сохранить';
      }
  });
}

const logoutBtn= document.querySelector('.logout');
if (logoutBtn) {
  logoutBtn.addEventListener('click', () => {
      localStorage.removeItem('authToken');
      window.location.href= '/main.html';
  });
}

const backBtn= document.querySelector('.back-btn');
if (backBtn) {
  backBtn.addEventListener('click', () => window.history.back());
}

checkAuthStatus();
getAuth();
});