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
    proofImages: [] as File[],
    medicationType: 'vaccine' as const
  });
  const [imagePreviews, setImagePreviews] = useState([] as { url: string, file: File }[]);
  const [loading, setLoading] = useState(false);

  const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setNewVaccine({
      ...newVaccine,
      [name]: value
    });
  };

  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const newPreviews = files.map(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreviews(prev => [...prev, { url: reader.result as string, file }]);
      };
      reader.readAsDataURL(file);
      return { url: '', file };
    });
    setNewVaccine({
      ...newVaccine,
      proofImages: [...newVaccine.proofImages, ...files]
    });
  };

  const removeImage = (fileToRemove: File) => {
    setNewVaccine({
      ...newVaccine,
      proofImages: newVaccine.proofImages.filter(file => file !== fileToRemove)
    });
    setImagePreviews(imagePreviews.filter(preview => preview.file !== fileToRemove));
  };

  const uploadImages = async (images: File[]): Promise<string[]> => {
    const uploadPromises = images.map(async (image) => {
      // Formato más simple y seguro para el nombre del archivo
      const fileExt = image.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`;
      
      // Usa una carpeta dentro del bucket
      const filePath = `uploads/${fileName}`;
      
      // Subir con manejo de errores mejorado
      const { data, error } = await supabase.storage
        .from('vaccine_proofs')
        .upload(filePath, image, {
          cacheControl: '3600',
          upsert: true // Cambiado a true para sobrescribir si existe
        });
      
      if (error) {
        console.error('Error detallado al subir imagen:', error);
        throw error;
      }
      
      // Obtener URL pública
      const { data: { publicUrl } } = supabase.storage
        .from('vaccine_proofs')
        .getPublicUrl(filePath);
      
        return publicUrl;
    });
    
    return Promise.all(uploadPromises);
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      let imageUrls: string[] = [];

      if (newVaccine.proofImages.length > 0) {
        imageUrls = await uploadImages(newVaccine.proofImages);
      }
      
      const { data, error } = await supabase
        .from('vaccines')
        .insert([{
          name: newVaccine.name,
          dateAdministered: newVaccine.dateAdministered,
          nextDate: newVaccine.nextDate,
          imageUrl: imageUrls.join(','),
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
          <label htmlFor="proofImages" className="label-custom">Imágenes de Comprobante (opcional)</label>
          <input
            type="file"
            id="proofImages"
            name="proofImages"
            onChange={handleImageChange}
            multiple
          />
        </div>
        <div className="image-previews">
          {imagePreviews.map((preview, index) => (
            <div key={index} className="image-preview-item">
              <div className="image-preview-box">
                <img src={preview.url} alt={`Vista Previa ${index + 1}`} />
              </div>
              <div className="image-preview-info">
                <p>{preview.file.name}</p>
                <button type="button" onClick={() => removeImage(preview.file)}>Eliminar</button>
              </div>
            </div>
          ))}
        </div>
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