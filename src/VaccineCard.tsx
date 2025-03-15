import React from 'react';
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

const VaccineCard = ({ name, dateAdministered, nextDate, imageUrl, medication_type, getRemainingDays, formatDate }: VaccineCardProps) => {
    const remainingDays = getRemainingDays(nextDate);
    return (
        <div>
            <div className="vaccine-card">
                <div className="vaccine-info">
                    <div className="name-container">
                        <p className="p-bold">{name}</p>
                        {getMedicationIcon(medication_type)}
                    </div>
                    <p className="p-gray">Fecha: {formatDate(dateAdministered)}</p>
                </div>
                <div className="vaccine-info-right">
                    <p className="p-white">{formatDate(nextDate)}</p>
                    {/* Mostrar días restantes para la próxima dosis */}
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
            <div>
                {imageUrl && (
                    <div className="vaccine-image">
                        <img src={imageUrl} alt="Comprobante veterinario" />
                    </div>
                )}
            </div>
        </div>
    );
};

export default VaccineCard;