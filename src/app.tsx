import React, { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';
import './app.css';
import VaccineCard from './VaccineCard.tsx';
import Drawer from './Drawer.tsx';
import MainButton from './MainButton.tsx';
import VaccineForm from './VaccineForm.tsx';

// Definición de tipos
interface Vaccine {
  id?: string;
  name: string;
  dateAdministered: string;
  nextDate: string;
  imageUrl?: string;
  createdAt?: string;
  medication_type: 'pill' | 'vaccine' | 'syrup';
}

const App = () => {
  const [vaccines, setVaccines] = useState([] as Vaccine[]);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  useEffect(() => {
    const fetchVaccines = async () => {
      const { data, error } = await supabase
        .from('vaccines')
        .select('*')
        .order('createdAt', { ascending: false });
      if (error) {
        console.error('Error fetching vaccines:', error);
      } else {
        setVaccines(data);
      }
    };

    fetchVaccines();
  }, []);

  const handleAddNewRecord = () => {
    setIsDrawerOpen(true);
  };

  const handleDrawerClose = () => {
    setIsDrawerOpen(false);
  };

  const handleVaccineAdded = (newVaccine: Vaccine) => {
    setVaccines([newVaccine, ...vaccines]);
    setIsDrawerOpen(false); // Cerrar el drawer después de guardar
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };
  
  const getRemainingDays = (nextDateString: string) => {
    const today = new Date();
    const nextDate = new Date(nextDateString);
    const diffTime = nextDate.getTime() - today.getTime();
    const remainingDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return remainingDays < 0 ? 'Vencida' : remainingDays;
  };

  return (
    <div className="vaccine-tracker-container">
      <div className="vaccine-list">
        <div className="header">
          <p className="p-gray">Registro</p>
          <p className="p-gray">Próxima</p>
        </div>
        {vaccines.length === 0 ? (
          <p>No hay registros aún.</p>
        ) : (
          <div className="vaccines-container">
            {vaccines.map((vaccine) => {
              const remainingDays = getRemainingDays(vaccine.nextDate);
              return (
                <VaccineCard
                  key={vaccine.id}
                  {...vaccine}
                  getRemainingDays={getRemainingDays}
                  formatDate={formatDate}
                  remainingDays={remainingDays}
                />
              );
            })}
          </div>
        )}
      </div>

      <MainButton onClick={handleAddNewRecord} />

      <Drawer isOpen={isDrawerOpen} onClose={handleDrawerClose}>
        <VaccineForm 
          onVaccineAdded={handleVaccineAdded} 
          onCancel={handleDrawerClose}
        />
      </Drawer>
    </div>
  );
};

export default App;