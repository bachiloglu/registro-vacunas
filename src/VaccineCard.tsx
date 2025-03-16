import React, { useState } from 'react';
import './VaccineCard.css';
import { PillIcon, SyringeIcon, SyrupIcon } from './icons.tsx';

interface VaccineCardProps {
    name: string;
    dateAdministered: string;
    nextDate: string;
    imageUrl?: string;
    medication_type: 'pill' | 'vaccine' | 'syrup';
    getRemainingDays: (date: string) => number | string;
    formatDate: (date: string) => string;
}

const getMedicationIcon = (type: 'pill' | 'vaccine' | 'syrup') => {
    const tooltipText = {
        'pill': 'Pastilla',
        'vaccine': 'Vacuna',
        'syrup': 'Jarabe'
    }[type];

    return (
        <div className="medication-type-icon" data-tooltip={tooltipText}>
            {(() => {
                switch (type) {
                    case 'pill':
                        return <PillIcon />;
                    case 'vaccine':
                        return <SyringeIcon />;
                    case 'syrup':
                        return <SyrupIcon />;
                    default:
                        return <SyringeIcon />;
                }
            })()}
        </div>
    );
};

const getRandomRotation = () => {
    return Math.random() * 16 - 8; // Rotación aleatoria entre -8° y 8°
};

const VaccineCard = ({ name, dateAdministered, nextDate, imageUrl, medication_type, getRemainingDays, formatDate }: VaccineCardProps) => {
    const remainingDays = getRemainingDays(nextDate);
    const imageUrls = imageUrl ? imageUrl.split(',') : [];

    return (
        <div className="vaccine-card">
            <div className="vaccine-card-left">
                <div className="image-stack">
                    {imageUrls.map((url, index) => (
                        <div key={index} className="image-stack-item" style={{ transform: `rotate(${getRandomRotation()}deg)` }}>
                            <img src={url} alt={`Imagen ${index + 1}`} />
                        </div>
                    ))}
                </div>
                <div className="vaccine-info">
                    <div className="name-container">
                        <p className="p-bold">{name}</p>
                        {getMedicationIcon(medication_type)}
                    </div>
                    <p className="p-gray">Fecha: {formatDate(dateAdministered)}</p>
                </div>
            </div>
            <div className="vaccine-info-right">
                <p className="p-white">{formatDate(nextDate)}</p>
                {typeof remainingDays === 'number' ? (
                    <p className="p-gray">
                        en {remainingDays} días
                    </p>
                ) : (
                    <p className="p-gray">
                        {remainingDays}
                    </p>
                )}
            </div>
        </div>
    );
};

export default VaccineCard;