// App.tsx
import React, { useState, useEffect, ChangeEvent, FormEvent } from 'react';
import { initializeApp } from 'firebase/app';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { getFirestore, collection, addDoc, getDocs, Timestamp } from 'firebase/firestore';
import { getAnalytics } from "firebase/analytics";
import './app.css';

// Definición de tipos
interface Vaccine {
  id?: string;
  name: string;
  dateAdministered: string;
  nextDate: string;
  imageUrl?: string;
  createdAt?: Timestamp | Date;
}

interface NewVaccineForm extends Omit<Vaccine, 'imageUrl' | 'createdAt'> {
  proofImage: File | null;
}

// Configuración de Firebase (deberás reemplazar esto con tus propias credenciales)
const firebaseConfig = {
  apiKey: "AIzaSyCvZDxbDYUJw8zjlQo2PITnLXkknHUlJT8",
  authDomain: "registro-de-vacunas.firebaseapp.com",
  projectId: "registro-de-vacunas",
  storageBucket: "registro-de-vacunas.firebasestorage.app",
  messagingSenderId: "597300291624",
  appId: "1:597300291624:web:ba7ddfddfe76ce583ead1d",
  measumentId: "G-NT3D0DF413"
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);
const storage = getStorage(app);
const db = getFirestore(app);
const analytics = getAnalytics(app);

const App: React.FC = () => {
  const [vaccines, setVaccines] = useState<Vaccine[]>([]);
  const [newVaccine, setNewVaccine] = useState<NewVaccineForm>({
    name: '',
    dateAdministered: '',
    nextDate: '',
    proofImage: null
  });
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  // Cargar vacunas al iniciar
  useEffect(() => {
    const fetchVaccines = async (): Promise<void> => {
      const vaccineCollection = collection(db, 'vaccines');
      const vaccineSnapshot = await getDocs(vaccineCollection);
      const vaccineList = vaccineSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Vaccine[];
      setVaccines(vaccineList);
    };

    fetchVaccines();
  }, []);

  // Manejar cambios en los campos del formulario
  const handleInputChange = (e: ChangeEvent<HTMLInputElement>): void => {
    const { name, value } = e.target;
    setNewVaccine({
      ...newVaccine,
      [name]: value
    });
  };

  // Manejar selección de imagen
  const handleImageChange = (e: ChangeEvent<HTMLInputElement>): void => {
    const files = e.target.files;
    if (files && files[0]) {
      const file = files[0];
      setNewVaccine({
        ...newVaccine,
        proofImage: file
      });
      
      // Crear preview de la imagen
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Subir imagen a Firebase Storage
  const uploadImage = async (file: File): Promise<string> => {
    const storageRef = ref(storage, `vaccine_proofs/${file.name}_${Date.now()}`);
    await uploadBytes(storageRef, file);
    return await getDownloadURL(storageRef);
  };

  // Enviar formulario
  const handleSubmit = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    setLoading(true);
    
    try {
      // Validar que haya una imagen seleccionada
      if (!newVaccine.proofImage) {
        alert("Por favor selecciona una imagen de comprobante");
        setLoading(false);
        return;
      }
      
      // Subir imagen primero
      const imageUrl = await uploadImage(newVaccine.proofImage);
      
      // Guardar datos en Firestore
      const vaccineData: Omit<Vaccine, 'id'> = {
        name: newVaccine.name,
        dateAdministered: newVaccine.dateAdministered,
        nextDate: newVaccine.nextDate,
        imageUrl: imageUrl,
        createdAt: new Date()
      };
      
      const docRef = await addDoc(collection(db, 'vaccines'), vaccineData);
      
      // Actualizar estado
      setVaccines([...vaccines, { id: docRef.id, ...vaccineData }]);
      setNewVaccine({
        name: '',
        dateAdministered: '',
        nextDate: '',
        proofImage: null
      });
      setImagePreview(null);
      
      // Resetear el input de archivo
      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
      if (fileInput) fileInput.value = '';
      
    } catch (error) {
      console.error("Error al guardar la vacuna:", error);
      alert("Hubo un error al guardar la información. Por favor intenta de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  // Formatear fecha para mostrar
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };
  
  // Calcular días restantes para la próxima vacuna
  const getRemainingDays = (nextDateString: string): number => {
    const today = new Date();
    const nextDate = new Date(nextDateString);
    const diffTime = nextDate.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  return (
    <div className="vaccine-tracker-container">
      <h1>Seguimiento de Vacunas de mi Mascota</h1>
      
      {/* Formulario para nueva vacuna */}
      <div className="vaccine-form">
        <h2>Agregar Nueva Vacuna</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="vaccine-name">Nombre de la Vacuna:</label>
            <input
              id="vaccine-name"
              type="text"
              name="name"
              value={newVaccine.name}
              onChange={handleInputChange}
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="date-administered">Fecha de Administración:</label>
            <input
              id="date-administered"
              type="date"
              name="dateAdministered"
              value={newVaccine.dateAdministered}
              onChange={handleInputChange}
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="next-date">Fecha de Próxima Dosis:</label>
            <input
              id="next-date"
              type="date"
              name="nextDate"
              value={newVaccine.nextDate}
              onChange={handleInputChange}
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="proof-image">Comprobante Veterinario:</label>
            <input
              id="proof-image"
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              required
            />
          </div>
          
          {imagePreview && (
            <div className="image-preview">
              <h3>Vista previa:</h3>
              <img src={imagePreview} alt="Vista previa" />
            </div>
          )}
          
          <button type="submit" disabled={loading}>
            {loading ? 'Guardando...' : 'Guardar Vacuna'}
          </button>
        </form>
      </div>
      
      {/* Lista de vacunas */}
      <div className="vaccine-list">
        <h2>Historial de Vacunas</h2>
        {vaccines.length === 0 ? (
          <p>No hay vacunas registradas aún.</p>
        ) : (
          <div className="vaccines-container">
            {vaccines.map((vaccine) => (
              <div key={vaccine.id} className="vaccine-card">
                <h3>{vaccine.name}</h3>
                <p><strong>Administrada:</strong> {formatDate(vaccine.dateAdministered)}</p>
                <p><strong>Próxima dosis:</strong> {formatDate(vaccine.nextDate)}</p>
                
                {/* Mostrar días restantes para la próxima dosis */}
                {getRemainingDays(vaccine.nextDate) > 0 ? (
                  <p className="reminder">
                    Faltan <strong>{getRemainingDays(vaccine.nextDate)}</strong> días para la próxima dosis
                  </p>
                ) : (
                  <p className="reminder overdue">
                    La vacuna está vencida por <strong>{Math.abs(getRemainingDays(vaccine.nextDate))}</strong> días
                  </p>
                )}
                
                {vaccine.imageUrl && (
                  <div className="vaccine-image">
                    <img src={vaccine.imageUrl} alt="Comprobante veterinario" />
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default App;

