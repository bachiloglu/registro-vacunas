import React, { useState, ChangeEvent, FormEvent } from 'react';
import { supabase } from './supabaseClient';
import './VaccineForm.css';

interface Vaccine {
  id?: string;
  name: string;
  dateAdministered: string;
  nextDate: string;
  imageUrl?: string;
  createdAt?: string;
  medication_type: 'pill' | 'vaccine' | 'syrup';
}

interface VaccineFormProps {
  onVaccineAdded: (vaccine: Vaccine) => void;
  onCancel: () => void;
}

const VaccineForm = ({ onVaccineAdded, onCancel }: VaccineFormProps) => {
  const [newVaccine, setNewVaccine] = useState({
    name: '',
    dateAdministered: '',
    nextDate: '',
    proofImage: null as File | null,
    medicationType: 'vaccine' as const
  });
  const [imagePreview, setImagePreview] = useState(null as string | null);
  const [loading, setLoading] = useState(false);

  const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setNewVaccine({
      ...newVaccine,
      [name]: value
    });
  };

  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files[0]) {
      const file = files[0];
      setNewVaccine({
        ...newVaccine,
        proofImage: file
      });
      
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const uploadImage = async (file: File): Promise<string> => {
    const fileName = `${file.name}_${Date.now()}`;
    const { data, error } = await supabase
      .storage
      .from('vaccine_proofs')
      .upload(fileName, file);
    if (error) {
      throw error;
    }
    const { data: { publicUrl } } = supabase
      .storage
      .from('vaccine_proofs')
      .getPublicUrl(fileName);
    return publicUrl;
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      let imageUrl: string | null = null;

      if (newVaccine.proofImage) {
        imageUrl = await uploadImage(newVaccine.proofImage);
      }
      
      const { data, error } = await supabase
        .from('vaccines')
        .insert([{
          name: newVaccine.name,
          dateAdministered: newVaccine.dateAdministered,
          nextDate: newVaccine.nextDate,
          imageUrl: imageUrl,
          createdAt: new Date().toISOString(),
          medication_type: newVaccine.medicationType
        }])
        .select();

      if (error) throw error;
      
      if (Array.isArray(data) && data.length > 0) {
        onVaccineAdded(data[0]);
      }
      
    } catch (error) {
      console.error("Error al guardar la vacuna:", error);
      alert("Hubo un error al guardar la información. Por favor intenta de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="vaccine-form">
      <form onSubmit={handleSubmit}>
        <div className="input-row">
          <div className="form-group name-input">
            <label htmlFor="name" className="label-custom">Nombre de medicamento</label>
            <input
              type="text"
              id="name"
              name="name"
              value={newVaccine.name}
              onChange={handleInputChange}
              placeholder="Ej. Paracetamol, Simparica"
              required
            />
          </div>
          <div className="form-group type-input">
            <label htmlFor="medicationType" className="label-custom">Tipo de medicamento</label>
            <select
              id="medicationType"
              name="medicationType"
              value={newVaccine.medicationType}
              onChange={handleInputChange}
              required
            >
              <option value="vaccine">Vacuna</option>
              <option value="pill">Pastilla</option>
              <option value="syrup">Jarabe</option>
            </select>
          </div>
        </div>
        
        <div className="date-fields">
          <div className="form-group">
            <label htmlFor="dateAdministered" className="label-custom">Fecha de Administración</label>
            <input
              type="date"
              id="dateAdministered"
              name="dateAdministered"
              value={newVaccine.dateAdministered}
              onChange={handleInputChange}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="nextDate" className="label-custom">Próxima Fecha</label>
            <input
              type="date"
              id="nextDate"
              name="nextDate"
              value={newVaccine.nextDate}
              onChange={handleInputChange}
              required
            />
          </div>
        </div>
        
        <div className="form-group">
          <label htmlFor="proofImage" className="label-custom">Imagen de Comprobante (opcional)</label>
          <input
            type="file"
            id="proofImage"
            name="proofImage"
            onChange={handleImageChange}
          />
        </div>
        {imagePreview && (
          <div className="image-preview">
            <h3>Vista Previa de la Imagen</h3>
            <img src={imagePreview} alt="Vista Previa" />
          </div>
        )}
        <div className="form-buttons">
          <button type="submit" disabled={loading}>
            {loading ? 'Guardando...' : 'Guardar Vacuna'}
          </button>
          <button type="button" onClick={onCancel}>
            Cancelar
          </button>
        </div>
      </form>
    </div>
  );
};

export default VaccineForm;