import React, { useEffect, useState } from 'react';
import axios from 'axios';

const AdminDashboard = () => {
    const [orders, setOrders] = useState([]);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(true);

    // useEffect(() => {
    //     const fetchOrders = async () => {
    //         try {
    //             // Use the token from localStorage or state
    //             const token = localStorage.getItem('token'); // Ensure you have the token saved from admin login
    //             const response = await axios.get('http://localhost:5000/admin/orders', {
    //                 headers: {
    //                     Authorization: Bearer ${token},
    //                 },
    //             });
    //             setOrders(response.data);
    //         } catch (err) {
    //             setError('Failed to fetch orders');
    //             console.error('Error fetching orders:', err);
    //         } finally {
    //             setLoading(false);
    //         }
    //     };

    //     fetchOrders();
    // }, []);

    useEffect(() => {
        // Assuming the token is stored in localStorage
        const token = localStorage.getItem('token');
    
        // Fetch orders from the backend
        fetch('http://localhost:5000/admin/orders', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}` // Use backticks here for template literal
            }
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to fetch orders.');
            }
            return response.json();
        })
        .then(data => {
            setOrders(data);
        })
        .catch(err => {
            console.error(err);
            setError(err.message);
        });
    }, []);
    

    // if (loading) {
    //     return <div>Loading...</div>;
    // }

    // if (error) {
    //     return <div>{error}</div>;
    // }

    return (
        <div>
            <h2>Orders</h2>
            {error ? (
                <p className="error-message">{error}</p>
            ) : (
                <table className="orders-table">
                    <thead>
                        <tr>
                            <th>Order ID</th>
                            <th>User ID</th>
                            <th>User Name</th>
                            <th>Product Name</th>
                            <th>Quantity</th>
                            <th>Order Date</th>
                            <th>Total Price</th>
                            <th>Total Items</th>
                            <th>Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {orders.map(order => (
                            <tr key={order.id}>
                                <td>{order.id}</td>
                                <td>{order.user_id}</td>
                                <td>{order.username}</td>
                                <td>{order.product_name}</td>
                                <td>{order.quantity}</td>
                                <td>{new Date(order.order_date).toLocaleString()}</td>
                                <td>{order.total_price}</td>
                                <td>{order.total_items}</td>
                                <td>{order.status}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    );
};

export default AdminDashboard;