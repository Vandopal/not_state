const express = require('express');
const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
const cors = require('cors');
require('dotenv').config({path:__dirname + '/.env'})
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
const bcrypt = require('bcrypt');

const app = express();
const PORT = process.env.PORT || 5000;

const secretKey = process.env.SECRET_KEY || 'FkfxUTUP';

app.use(cors());
app.use(express.json());
app.use(cookieParser());
app.use(express.static(path.join(__dirname, '../public')));
app.use('/users', express.static('users'));
app.use(express.urlencoded({ extended: true }));

const pool = new Pool({
  user: process.env.DB_USER || "postgres",
  host: process.env.DB_HOST || "localhost",
  database: process.env.DB_NAME || "Frizz",
  password: process.env.DB_PASSWORD || "123321",
  port: process.env.DB_PORT || "5432",
});

const authMiddleware = async (req, res, next) => {
  const token = req.cookies.authToken;

  if (!token) {
    return res.status(401).json({ message: 'Токен отсутствует' });
  }

  try {
    const decoded = jwt.verify(token, secretKey);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Неверный токен' });
  }
};

app.get('/main.html', authMiddleware, (req, res) => {
  res.sendFile(path.join(__dirname, '../public', 'main.html'));
});

app.get('/menu.html', (req, res) => {
  res.sendFile(path.join(__dirname, '../public', 'menu.html'));
});

app.get('/settings.html', (req, res) => {
  res.sendFile(path.join(__dirname, '../public', 'account-settings.html'));
});

app.get('/history.html', (req, res) => {
  res.sendFile(path.join(__dirname, '../public', 'account-history.html'));
});

app.get('/reg.html', (req, res) => {
  res.sendFile(path.join(__dirname, '../public', 'reg.html'));
});

app.post('/user/update', authMiddleware, async (req, res) => {
    try {
        const { name, surname, email, phone, address } = req.body;
        const userId = req.user.id;
        const result = await pool.query(
            `UPDATE users 
             SET name = $1, surname = $2, email = $3, phone = $4, address = $5
             WHERE id = $6
             RETURNING id, name, surname, email, phone, address, role`,
            [name, surname, email, phone, address, userId]
        );

        const updatedUser = result.rows[0];

        const payload = {
            id: updatedUser.id,
            name: updatedUser.name,
            surname: updatedUser.surname,
            email: updatedUser.email,
            phone: updatedUser.phone || '',
            address: updatedUser.address || '',
            role: updatedUser.role
        };

        const token = jwt.sign(payload, secretKey, { expiresIn: '1h' });

        res.status(200).json({ 
            message: 'Данные успешно обновлены',
            user: payload,
            token: token
        });
    } catch (error) {
        console.error('Ошибка при обновлении:', error);
        res.status(500).json({ message: 'Ошибка сервера' });
    }
});

app.get('/user', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;

    const result = await pool.query(
      'SELECT id, name, surname, email, phone, address FROM users WHERE id = $1',
      [userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Пользователь не найден' });
    }

    const userData = result.rows[0];

    res.json(userData);
  } catch (error) {
    console.error('Ошибка получения данных пользователя:', error);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
});

app.post('/register', async (req, res) => {
    const { name, surname, email, password, address = '', phone = '' } = req.body;

    try {
        const userExists = await pool.query(
            'SELECT id FROM users WHERE email = $1',
            [email]
        );

        if (userExists.rows.length > 0) {
            return res.status(400).json({ message: 'Пользователь с таким email уже существует' });
        }

        const saltRounds = 10;
        const passwordHash = await bcrypt.hash(password, saltRounds);

        const newUserResult = await pool.query(
            'INSERT INTO users (name, surname, email, password_hash, role, address, phone) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id, name, surname, email, role',
            [name, surname, email, passwordHash, 1, address, phone]
        );

        const newUser = newUserResult.rows[0];

        const payload = {
            id: newUser.id,
            name: newUser.name,
            surname: newUser.surname,
            email: newUser.email,
            role: newUser.role,
            address: address || '',
            phone: phone || ''
        };

        const token = jwt.sign(payload, secretKey, { expiresIn: '1h' });

        res.cookie('authToken', token, {
            secure: process.env.NODE_ENV === 'production',
            httpOnly: true,
            maxAge: 60000,
            sameSite: 'strict'
        });
        res.status(201).json({ 
            message: 'Регистрация успешна',
            user: {
                id: newUser.id,
                name: newUser.name,
                surname: newUser.surname,
                email: newUser.email,
                role: newUser.role,
                address: address || '',
                phone: phone || ''
            },
            token: token
        });

    } catch (error) {
        console.error('Ошибка при регистрации:', error);
        res.status(500).json({ message: 'Ошибка сервера при регистрации' });
    }
});

app.post('/submit-order', async(req,res)=>{
  const { userId,deliveryAddress,paymentMethod , comment , items}= req.body;

  if(!userId || !deliveryAddress || !paymentMethod || !items){
     returnres.status(400).json({message:'Некорректные данные'});
  }

  try{
     const fullPrice = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

     const result= await pool.query(
       `INSERT INTO orders (user_id , delivery_address , payment_method , status , comment , full_price, created_at)
       VALUES ($1,$2,$3,$4,$5,$6,NOW()) RETURNING id`,
       [userId , deliveryAddress , paymentMethod ,'pending' , comment, fullPrice]
     );

     const orderId= result.rows[0].id;
     if(Array.isArray(items)){
       for(const item of items){
         await pool.query(
           `INSERT INTO order_items (order_id , product_name , quantity, price)
           VALUES ($1,$2,$3,$4)`,
           [orderId , item.name , item.quantity, item.price]
         );
       }
     }

     res.json({message:'Заказ успешно оформлен', orderId});
     
   } catch(err){
     console.error('Ошибка при сохранении заказа:',err);
     res.status(500).json({message:'Ошибка сервера'});
   }
});


app.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
      const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
      const user = result.rows[0];

      if (!user) {
          return res.status(400).json({ message: 'Пользователь не найден' });
      }

      if (!user.password_hash) {
          return res.status(500).json({ message: 'Ошибка сервера: некорректные данные пользователя' });
      }

      const isPasswordValid = await bcrypt.compare(password, user.password_hash);
      
      if (!isPasswordValid) {
          return res.status(401).json({ message: 'Неверный пароль' });
      }

      const payload = {
            id: user.id,
            name: user.name,
            surname: user.surname,
            email: user.email,
            role: user.role,
            address: user.address || '',
            phone: user.phone || ''
        };

      const token = jwt.sign(payload, secretKey, { expiresIn: '1h' });
      
      res.cookie('authToken', token, {
          secure: process.env.NODE_ENV === 'production',
          httpOnly: true,
          maxAge: 60000,
          sameSite: 'strict'
      });

      res.status(200).json({ 
          message: 'Успешный вход',
          user: payload,
          token: token
      });
      
  } catch (error) {
      console.error('Ошибка при входе:', error);
      res.status(500).json({ message: 'Ошибка сервера' });
  }
});
app.get('/all-food', async (req, res) => {
    try {
        const pizzas = await fs.promises.readFile(path.join(__dirname, '..', 'public', 'dataset', 'pizza.json'), 'utf8');
        const burgers = await fs.promises.readFile(path.join(__dirname, '..', 'public', 'dataset', 'burgers.json'), 'utf8');
        const drinks = await fs.promises.readFile(path.join(__dirname, '..', 'public', 'dataset', 'drinks.json'), 'utf8');
        const salads = await fs.promises.readFile(path.join(__dirname, '..', 'public', 'dataset', 'salad.json'), 'utf8');
        const snacks = await fs.promises.readFile(path.join(__dirname, '..', 'public', 'dataset', 'snacks.json'), 'utf8');

        res.json({
            pizzas: JSON.parse(pizzas),
            burgers: JSON.parse(burgers),
            drinks: JSON.parse(drinks),
            salads: JSON.parse(salads),
            snacks: JSON.parse(snacks),
        });
    } catch (error) {
        console.error('Ошибка при чтении файлов:', error);
        res.status(500).send('Ошибка сервера');
    }
});

app.get('/log.html', (req, res) => {
  res.sendFile(path.join(__dirname, '../public', 'auth.html'));
});



app.listen(PORT, () => {
  console.log(`HTTP сервер запущен на http://localhost:${PORT}/main.html`);
});