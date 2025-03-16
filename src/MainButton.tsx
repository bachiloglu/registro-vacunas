import React from 'react';
import './MainButton.css'


interface MainButtonProps {
  onClick: () => void;
}

const MainButton = ({ onClick }: MainButtonProps) => {
  return (
    <button className="main-button" onClick={onClick}>
      Agregar Registro
    </button>
  );
};

export default MainButton;