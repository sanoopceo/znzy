import React from 'react';
import { motion } from 'framer-motion';

const Paginate = ({ pages, page, keyword = '', isAdmin = false, onPageChange }) => {
  if (pages <= 1) return null;

  return (
    <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', marginTop: '3rem' }}>
      {[...Array(pages).keys()].map((x) => (
        <motion.button
          key={x + 1}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => onPageChange(x + 1)}
          style={{
            padding: '0.6rem 1rem',
            border: (x + 1) === page ? 'none' : '1px solid #ddd',
            background: (x + 1) === page ? 'var(--color-gold)' : '#fff',
            color: (x + 1) === page ? '#fff' : '#333',
            fontWeight: 700,
            cursor: 'pointer',
            borderRadius: '4px',
            fontSize: '0.8rem',
            transition: '0.2s'
          }}
        >
          {x + 1}
        </motion.button>
      ))}
    </div>
  );
};

export default Paginate;
