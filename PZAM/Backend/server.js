const express = require('express');
const mysql = require('mysql');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const axios = require('axios');

const app = express();

app.use(cors());
app.use(express.json());

// MySQL connection
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '', // Make sure this matches your MySQL root password
    database: 'cupdb', // Ensure the 'cupdb' database exists in MySQL
});

db.connect((err) => {
    if (err) {
        console.error('Database connection failed:', err);
        throw err;
    }
    console.log('MySQL Connected...');
});

// Registration route
app.post('/register', async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).send('Username and password are required');
    }

    try {
        const hashedPassword = await bcrypt.hash(password, 10);

        const checkQuery = 'SELECT * FROM users WHERE username = ?';
        db.query(checkQuery, [username], (err, result) => {
            if (err) {
                console.error('Error checking user existence:', err);
                return res.status(500).send('Server error');
            }

            if (result.length > 0) {
                return res.status(400).send('Username already exists');
            }

            const insertQuery = 'INSERT INTO users (username, password) VALUES (?, ?)';
            db.query(insertQuery, [username, hashedPassword], (err, result) => {
                if (err) {
                    console.error('Error inserting user into the database:', err);
                    return res.status(500).send('User registration failed');
                }
                res.send('User registered successfully');
            });
        });
    } catch (error) {
        console.error('Error during registration:', error);
        res.status(500).send('Server error');
    }
});

// User Login route
app.post('/login', (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).send('Username and password are required');
    }

    const query = 'SELECT * FROM users WHERE username = ?';
    db.query(query, [username], async (err, results) => {
        if (err || results.length === 0) {
            return res.status(400).send('User not found');
        }

        const validPassword = await bcrypt.compare(password, results[0].password);
        if (!validPassword) {
            return res.status(400).send('Invalid credentials');
        }

        const token = jwt.sign({ id: results[0].id }, process.env.JWT_SECRET || 'your-secret-key', { expiresIn: '1h' });
        res.json({ token });
    });
});

// Admin Login Route
app.post('/admin-login', (req, res) => {
    const { username, password } = req.body;

    // Check if the provided credentials match the admin's credentials
    if (username === 'admin' && password === '123admin') {
        const token = jwt.sign({ role: 'admin' }, process.env.JWT_SECRET || 'your-secret-key', { expiresIn: '1h' });
        return res.json({ token });
    }

    return res.status(401).send('Invalid admin credentials');
});

app.get('/admin/orders', (req, res) => {
    const token = req.headers['authorization'];
    
    // Verify token
    if (!token) return res.status(401).send('Access denied.');

    jwt.verify(token.split(' ')[1], process.env.JWT_SECRET || 'your-secret-key', (err, verified) => {
        if (err) return res.status(403).send('Invalid token.');

        // Only proceed if the user is an admin
        if (verified.role !== 'admin') return res.status(403).send('Access denied.');

        // Fetch orders from the database
        const query = `
           SELECT 
            o.id, 
            o.user_id, 
            u.username,  -- Fetching the username from the users table
            o.product_name, 
            o.quantity, 
            o.order_date, 
            o.total_price, 
            o.total_items, 
            o.name, 
            o.address, 
            o.items, 
            o.totalPrice, 
            o.payment_link_id, 
            o.status, 
            o.total_amount, 
            o.created_at
        FROM 
            orders o
        JOIN 
            users u ON o.user_id = u.id;  -- Joining orders with users based on user_id

        `;

        db.query(query, (err, results) => {
            if (err) {
                console.error('Error fetching orders:', err);
                return res.status(500).send('Server error');
            }
            res.json(results); // Send orders to the admin
        });
    });
});

// Fetch user profile data
app.get('/api/profile', (req, res) => {
    const token = req.headers['authorization'];

    // Check if the token is provided
    if (!token) return res.status(401).send('Access denied.');

    // Verify the token
    jwt.verify(token.split(' ')[1], process.env.JWT_SECRET || 'your-secret-key', (err, verified) => {
        if (err) return res.status(403).send('Invalid token.');

        // Fetch user information based on the user ID in the token
        const query = 'SELECT name, address FROM users WHERE id = ?';
        db.query(query, [verified.id], (err, result) => {
            if (err) {
                console.error('Error fetching profile:', err);
                return res.status(500).send('Server error');
            }

            if (result.length === 0) {
                return res.status(404).send('User not found');
            }

            // Return user profile data
            res.json(result[0]); // Return the first result which should be the user data
        });
    });
});

// Update user profile data
app.put('/api/profile/update', (req, res) => {
    const token = req.headers['authorization'];

    // Check if the token is provided
    if (!token) return res.status(401).send('Access denied.');

    // Verify the token
    jwt.verify(token.split(' ')[1], process.env.JWT_SECRET || 'your-secret-key', (err, verified) => {
        if (err) return res.status(403).send('Invalid token.');

        const { name, address } = req.body; // Get name and address from request body
        const query = 'UPDATE users SET name = ?, address = ? WHERE id = ?';

        // Update the user information based on the user ID in the token
        db.query(query, [name, address, verified.id], (err, result) => {
            if (err) {
                console.error('Error updating profile:', err);
                return res.status(500).send('Server error');
            }

            res.send('Profile updated successfully');
        });
    });
});

// Payment link generation route
app.post('/api/payment-link', async (req, res) => {
    // Kunin ang amount mula sa body
    const { data } = req.body;
    const { amount } = data.attributes; // Siguraduhing tama ang access sa amount

    if (!amount) {
        return res.status(400).send('Amount is required');
    }

    try {
        const response = await axios.post('https://api.paymongo.com/v1/links', {
            data: {
                attributes: {
                    amount: amount * 100, // Convert to centavo (PHP 10000 is 100 PHP)
                    description: "Payment for Order",
                    remarks: "none"
                }
            }
        }, {
            headers: {
                'accept': 'application/json',
                'authorization': `Basic ${Buffer.from('sk_test_qktYNDx5UjE2gznY1es6vnba').toString('base64')}`, // Encoded secret key
                'content-type': 'application/json'
            }
        });

        // Send the response back to the frontend
        return res.json(response.data);
    } catch (error) {
        console.error('Payment link creation error:', error);
        return res.status(500).json({ message: 'Payment link creation failed' });
    }
});

// Use the orderRoutes (Make sure you have the orderRoutes defined)
const orderRoutes = require('./routes/orderRoutes'); // Siguraduhing ito ay tama
app.use('/api/orders', orderRoutes);  // Gamitin ang '/api/orders' para sa order routes

// Start server
app.listen(5000, () => console.log('Server running on port 5000'));
