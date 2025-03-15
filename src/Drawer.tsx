import React from 'react';
import './Drawer.css'

interface DrawerProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactElement | React.ReactElement[];
}

const Drawer = ({ isOpen, onClose, children }: DrawerProps) => {
  return (
    <>
      {isOpen && (
        <>
          <div className="drawer-overlay" onClick={onClose} />
          <div className="drawer">
            <div className="drawer-header">
              <h2>Agregar Registro</h2>
              <button className="close-button" onClick={onClose}>&times;</button>
            </div>
            <div className="drawer-content">
              {children}
            </div>
          </div>
        </>
      )}
    </>
  );
};

export default Drawer;