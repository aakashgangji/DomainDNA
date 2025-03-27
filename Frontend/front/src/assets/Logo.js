import React from 'react';
import logoImage from './faith2.png'; // Adjust the path to your logo image

const Logo = () => (
  <img 
    src={logoImage} 
    alt="Logo" 
    style={{ display: 'block', margin: '0', width: '100%', height: '50%' }} // Adjust styles as needed
  />
);

export default Logo;