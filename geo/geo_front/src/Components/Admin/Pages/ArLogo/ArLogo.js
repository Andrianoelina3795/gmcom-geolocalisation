import React from 'react'

const ArLogo = ({ size = 40, className = "" }) => (
  <div 
    className={`d-flex align-items-center justify-content-center rounded-circle bg-primary text-white fw-bold ${className}`}
    style={{
      width: size,
      height: size,
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      fontSize: size * 0.4,
      boxShadow: '0 4px 15px rgba(102, 126, 234, 0.3)'
    }}
  >
    AR
  </div>
);

export default ArLogo