    document.addEventListener('DOMContentLoaded', function() {
        const signinBtn = document.querySelector('.auth-signin-btn');
        const forgotPasswordBtn = document.querySelector('.auth-forget-password');
        
        signinBtn.addEventListener('click', async function() {
            const email = document.querySelector('.auth-mail-textarea').value.trim();
            const password = document.querySelector('.auth-password-textarea').value.trim();
            

            if (!email || !password) {
                alert('Пожалуйста, заполните все поля');
                return;
            }
            
            try {
                const response = await fetch('http://185.251.91.155:5000/login', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ email, password })
                });
                
                const result = await response.json();
                
                if (!response.ok) {
                    throw new Error(result.message || 'Ошибка авторизации');
                }
                
                localStorage.setItem('authToken', result.token);
                alert('Авторизация успешна!');
                window.location.href = '/main.html';
                
            } catch (error) {
                console.error('Ошибка:', error);
                alert(error.message || 'Произошла ошибка при авторизации');
            }
        });
        
        forgotPasswordBtn.addEventListener('click', function() {
            alert('Функция восстановления пароля временно недоступна');
        });
    });