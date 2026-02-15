import { useContext, useEffect, useState } from 'react';
import { MyContext } from '../../../Context/MyContext';
import { useNavigate, Link } from 'react-router-dom';
import Swal from 'sweetalert2';
import axios from 'axios';
import './AuthForm.css';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEnvelope, faLock, faEye, faEyeSlash, faUser, faShieldAlt, faPhone } from '@fortawesome/free-solid-svg-icons';

const Register = () => {
  // États pour les champs du formulaire
  const [name, setUsername] = useState(''); // Nom complet
  const [pseudo, setPseudo] = useState(''); //Surrnom de l'AC(IMPORTANT POUR LE FORMULAIRE CLIENT)
  const [email, setEmail] = useState(''); // Email
  const [contact_ac, setContact_ac] = useState(''); //Contact AC
  const [role, setRole] = useState(''); //Role (AC ou Superviseur)
  const [password, setPassword] = useState(''); // Mot de passe
  const [confirmPassword, setConfirmPassword] = useState(''); // Confirmation mot de passe
  const [isShowPassword, setIsShowPassword] = useState(false); // Toggle affichage mot de passe
  const [isShowConfirmPassword, setIsShowConfirmPassword] = useState(false); // Toggle affichage confirmation
  const [acceptedCondition, setAcceptedCondition] = useState(false); // Case à cocher politique de confidentialité
  const [photo, setPhoto] = useState(null); // Photo utilisateur

  // Contexte global pour cacher sidebar et header
  const { setIsHideSidebarAndHeader } = useContext(MyContext);
  // Navigation React Router
  const navigate = useNavigate();

  // Au montage, cacher sidebar/header et scroller en haut
  useEffect(() => {
    setIsHideSidebarAndHeader(true);
    window.scrollTo(0, 0);
  }, [setIsHideSidebarAndHeader]);

  // Fonction appelée à la soumission du formulaire
  const handleRegister = async (e) => {
    e.preventDefault();

    // Vérifier que les mots de passe correspondent
    if (password !== confirmPassword) {
      Swal.fire("Erreur", "Les mots de passe ne correspondent pas.", "error");
      return;
    }

    // Vérifier que la politique est acceptée
    if (!acceptedCondition) {
      Swal.fire("Erreur", "Vous devez accepter la politique de confidentialité.", "error");
      return;
    }

    // Confirmation utilisateur avant d'envoyer
    const confirmation = await Swal.fire({
      toast: true,
      timer: 7000,
      title: 'Confirmer l\'inscription',
      text: 'Souhaitez-vous enregistrer ce compte ?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Oui',
      cancelButtonText: 'Annuler',
    });

    if (confirmation.isConfirmed) {
      try {
        // Préparer les données avec FormData pour upload fichier
        const formData = new FormData();
        formData.append('name', name);
        formData.append('pseudo', pseudo);
        formData.append('email', email);
        formData.append('contact_ac', contact_ac);
        formData.append('role', role);
        formData.append('password', password);
        formData.append('password_confirmation', confirmPassword);

        // Si une photo a été choisie, l'ajouter
        if (photo) {
          formData.append('photo', photo);
        }

        // Envoyer la requête POST avec multipart/form-data
        const response = await axios.post('http://localhost:8000/api/register', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });

        // Si tout est OK, afficher succès et rediriger vers login
        if (response.status === 201) {
          Swal.fire({
            toast: true,
            icon: 'success',
            title: 'Succès!',
            text: 'Inscription réussie.'
          });
          navigate('/login');
        }
      } catch {
        // En cas d'erreur, afficher un message
        Swal.fire("Erreur", "Cet email est déjà utilisé ou une erreur est survenue.", "error");
      }
    }
  };

  return (
    <div className="auth-body">
      {/* Arrière-plan avec formes */}
      <div className="background">
        <div className="shape"></div>
        <div className="shape"></div>
      </div>

      {/* Formulaire d'inscription */}
      <form className="auth-form" onSubmit={handleRegister}>

        {/* Titre */}
        <h3>Créer un compte</h3>

        {/* Champ nom complet */}
        <div className="input-group">
          <FontAwesomeIcon icon={faUser} className="input-icon icon-blue" />
          <input
            type="text"
            id="name"
            placeholder="Nom complet"
            value={name}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
        </div>

        {/* Champ Pseudo (Surnom) */}
        <div className="input-group">
          <FontAwesomeIcon icon={faUser} className="input-icon icon-blue" />
          <input
            type="text"
            id="pseudo"
            placeholder="Votre pseudo"
            value={pseudo}
            onChange={(e) => setPseudo(e.target.value)}
            required
          />
        </div>

        {/* Champ email */}
        <div className="input-group">
          <FontAwesomeIcon icon={faEnvelope} className="input-icon icon-purple" />
          <input
            type="email"
            id="email"
            placeholder="Adresse email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        {/* Champ contact_AC */}
        <div className="input-group">
          <FontAwesomeIcon icon={faPhone} className="input-icon icon-skyblue" />
          <input
            type="tel"
            id="tel"
            placeholder="Contact"
            value={contact_ac}
            onChange={(e) => setContact_ac(e.target.value)}
            required
          />
        </div>

        {/* Champ rôle */}
        <div className="input-group">
          <select
            name="role"
            value={role}
            onChange={(e) => setRole(e.target.value)}
            style={{ fontSize: '0.9rem' }}
          >
            <option value="">-- Selectionner Rôle--</option>
            <option value="AC">AC</option>
            <option value="superviseur">Superviseur</option>
          </select>
        </div>

        {/* Champ mot de passe avec toggle */}
        <div className="input-group">
          <FontAwesomeIcon icon={faLock} className="input-icon icon-red" />
          <input
            type={isShowPassword ? 'text' : 'password'}
            id="password"
            placeholder="Mot de passe"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <FontAwesomeIcon
            icon={isShowPassword ? faEyeSlash : faEye}
            className="password-toggle"
            onClick={() => setIsShowPassword(!isShowPassword)}
          />
        </div>

        {/* Champ confirmation mot de passe avec toggle */}
        <div className="input-group">
          <FontAwesomeIcon icon={faShieldAlt} className="input-icon icon-green" />
          <input
            type={isShowConfirmPassword ? 'text' : 'password'}
            id="confirmPassword"
            placeholder="Confirmer le mot de passe"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />
          <FontAwesomeIcon
            icon={isShowConfirmPassword ? faEyeSlash : faEye}
            className="password-toggle"
            onClick={() => setIsShowConfirmPassword(!isShowConfirmPassword)}
          />
        </div>

        {/* Champ upload photo */}
        <div className="input-group">
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setPhoto(e.target.files[0])}
            style={{}}
          />
        </div>

        {/* Case à cocher politique */}
        <div className="col-12 form-check mt-3">
          <input
            className="form-check-input"
            type="checkbox"
            id="acceptCondition"
            name="consentement"
            checked={acceptedCondition}
            onChange={(e) => setAcceptedCondition(e.target.checked)}
          />
          <label htmlFor="acceptCondition" className="form-check-label" style={{ fontSize: '13px' }}>
            J'accepte la <a href="#" className="text-blue fw-bold">politique de confidentialité</a>
          </label>
        </div>

        {/* Bouton d'inscription désactivé si non accepté */}
        <button type="submit" className="mt-1" disabled={!acceptedCondition}>
          S'inscrire
        </button>

        {/* Lien vers la page login */}
        <div className="text-center mt-2 t1">
          <span>Déjà un compte ? </span>
          <Link to="/login" className="text-blue fw-bold">Se connecter</Link>
        </div>

      </form>
    </div>
  );
};

export default Register;
