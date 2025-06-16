document.addEventListener('DOMContentLoaded', function() {
    document.querySelector('.reg-signin-btn').addEventListener('click', async () => {
        const email = document.querySelector('.reg-textarea[type="email"]').value;
        const password = document.querySelector('.reg-textarea[type="password"]').value;
        const name = document.querySelector('.reg-fio-textarea[placeholder="Ваше имя"]').value;
        const surname = document.querySelector('.reg-fio-textarea[placeholder="Ваша фамилия"]').value;
        const repeatPassword = document.querySelectorAll('.reg-textarea[type="password"]')[1].value;
      
        if (!email || !password || !name || !surname) {
            alert('Заполните все обязательные поля!');
            return;
        }
        
        if (password !== repeatPassword) {
            alert('Пароли не совпадают!');
            return;
        }
      
        try {
            const response = await fetch('/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify({
                    name: name,
                    surname: surname,
                    email: email,
                    password: password
                }),
            });
          
            const result = await response.json();
            
            if (!response.ok) {
                throw new Error(result.error || 'Ошибка регистрации');
            }
            
            if (result.token) {
                localStorage.setItem('authToken', result.token);
                alert('Регистрация и вход выполнены успешно!');
                window.location.href = '/main.html';
            } else {
                throw new Error('Токен не получен');
            }
            
        } catch (error) {
            console.error('Ошибка:', error);
            alert(error.message);
        }
    });
});