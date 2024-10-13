import React from 'react';
import { useLoading } from '../../hooks/useLoading';
import classes from './loading.module.css';

export default function Loading() {
    const { isLoading } = useLoading();

    // Debugging line to check loading state
    console.log('Is loading:', isLoading);

    if (!isLoading) return null; // Return null if not loading

    return (
      <div className={classes.container}>
        <div className={classes.items}>
          {/* Inline SVG for loading animation */}
          <svg xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink" 
               style={{ margin: 'auto', background: 'none', display: 'block', shapeRendering: 'auto' }} 
               width="200px" height="200px" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid">
            <circle cx="50" cy="23" r="13" fill="#e15b64">
              <animate attributeName="cy" dur="1s" repeatCount="indefinite" 
                       calcMode="spline" keySplines="0.45 0 0.9 0.55;0 0.45 0.55 0.9" 
                       keyTimes="0;0.5;1" values="23;77;23"></animate>
            </circle>
          </svg>
          <h1>Loading...</h1>
        </div>
      </div>
    );
}

