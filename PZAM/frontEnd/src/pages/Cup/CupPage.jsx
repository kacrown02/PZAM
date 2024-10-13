import React, { useEffect, useState } from 'react';
import classes from './cupPage.module.css';
import { useNavigate, useParams } from 'react-router-dom';
import { getById } from '../../Services/cupServices';
import StarRating from '../../components/StarRating/StarRating';
import Tags from '../../components/Tags/Tags';
import Price from '../../components/Price/Price';
import { useCart } from '../../hooks/useCart';

export default function CupPage() {
    const [cup, setCup] = useState(null); // Initialize as null to handle loading state
    const [printOption, setPrintOption] = useState('without'); // Default print option
    const { id } = useParams();
    const { addToCart } = useCart();
    const navigate = useNavigate();

    const handleAddToCart = () => {
        if (cup) { 
            let adjustedCup = { ...cup };
            // Calculate the final price based on the selected print option
            adjustedCup.price = printOption === 'with' ? cup.price + 5 : cup.price;
            addToCart(adjustedCup); // Add to cart with adjusted price
            navigate('/cart'); // Navigate to cart page
        }
    };

    useEffect(() => {
        getById(id).then(setCup); // Fetch cup by ID from the service
    }, [id]);

    // If cup data is not yet available, show a loading message
    if (!cup) {
        return <div>Loading...</div>;
    }

    return (
        <div className={classes.container}>
            <img
                className={classes.image}
                src={`/cups/${cup.imageUrl}`} // Dynamic image path
                alt={cup.name}
            />
            <div className={classes.details}>
                <div className={classes.header}>
                    <span className={classes.name}>{cup.name}</span>
                    <span className={`${classes.favorite} ${cup.favorite ? '' : classes.not}`}>
                        ♥
                    </span>
                </div>
                <div className={classes.rating}>
                    <StarRating stars={cup.stars} size={25} />
                </div>

                <div className={classes.tags}>
                    {cup.tags && (
                        <Tags tags={cup.tags.map(tag => ({ name: tag }))} forCupPage={true} />
                    )}
                </div>
            </div>

            <div className={classes.price}>
                <Price price={printOption === 'with' ? cup.price + 5 : cup.price} /> {/* Display adjusted price */}
            </div>

            {/* Print Option Selection */}
            <div className={classes.printOptionContainer}>
                <label 
                    className={`${classes.printOption} ${printOption === 'without' ? classes.selected : ''}`} 
                    onClick={() => setPrintOption('without')}
                >
                    <input 
                        type="radio" 
                        value="without" 
                        checked={printOption === 'without'} 
                        onChange={() => setPrintOption('without')}
                    />
                    Without Print
                </label>
                
                <label 
                    className={`${classes.printOption} ${printOption === 'with' ? classes.selected : ''}`} 
                    onClick={() => setPrintOption('with')}
                >
                    <input 
                        type="radio" 
                        value="with" 
                        checked={printOption === 'with'} 
                        onChange={() => setPrintOption('with')}
                    />
                    With Print (+₱5.00) {/* Updated label to ₱5.00 */}
                </label>
            </div>

            <button onClick={handleAddToCart}>Add To Cart</button>
        </div>
    );
}
