import React, { useState } from 'react'; // Import useState to manage error state
import axios from 'axios';
import { useLocation } from 'react-router-dom';

function Payment() {
    const location = useLocation();
    const { totalPrice } = location.state || { totalPrice: 0 };
    const [error, setError] = useState(''); // State to manage error messages

    const handlePayment = async () => {
        try {
            const amountInCentavos = Math.round(totalPrice * 100); // Convert to centavos
            const response = await axios.post('http://localhost:5000/api/payment-link', {
                data: {
                    attributes: {
                        amount: amountInCentavos,
                        description: "Payment for Order",
                        remarks: "none"
                    }
                }
            });

            console.log('Payment link created:', response.data);
            if (response.data && response.data.data && response.data.data.attributes) {
                window.open(response.data.data.attributes.checkout_url, '_blank'); // Redirect to payment link
            }
        } catch (error) {
            if (error.response) {
                console.error('Payment error:', error.response.data);
                setError(`Payment error: ${error.response.data.message || 'An error occurred'}`);
            } else {
                console.error('Payment error:', error);
                setError('An unexpected error occurred. Please try again.');
            }
        }
    };

    return (
        <div className="w-screen h-screen flex items-center justify-center bg-gray-100">
            <div className="w-[90%] md:w-[40%] h-auto bg-white flex flex-col items-center border rounded-lg shadow-lg p-6">
                <h1 className="text-2xl font-bold text-center mb-4">Pay with GCash</h1>
                <p className="text-gray-600 mb-6 text-center">
                    Complete your payment of <span className="font-semibold">PHP {totalPrice}</span> via GCash.
                </p>

                {/* GCash logo or relevant image */}
                <img
                    src="gcash.jpg" // Ensure this image path is correct
                    alt="GCash Logo"
                    className="w-1/2 mb-6"
                />

                {error && <p className="text-red-500 mb-4">{error}</p>} {/* Display error if exists */}

                <button
                    onClick={handlePayment}
                    className="bg-blue-500 text-white text-lg font-semibold rounded w-full h-12 hover:bg-blue-600 transition duration-200"
                >
                    Proceed to GCash Payment
                </button>

                <p className="text-sm text-gray-500 mt-4">
                    By clicking "Proceed to GCash Payment," you agree to our terms and conditions.
                </p>
            </div>
        </div>
    );
}

export default Payment;
