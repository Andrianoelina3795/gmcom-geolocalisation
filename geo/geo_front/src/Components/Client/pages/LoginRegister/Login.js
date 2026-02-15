import { useState, useEffect, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { message } from 'antd';
import { MyContext } from '../../../Context/MyContext';
import './AuthForm.css';

// FontAwesome
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEnvelope, faLock, faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons';
//import { faGoogle, faFacebook } from '@fortawesome/free-brands-svg-icons';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const { setUser, setIsLogin, setIsHideSidebarAndHeader } = useContext(MyContext);
  const navigate = useNavigate();

  useEffect(() => {
    setIsHideSidebarAndHeader(true);
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");
    if (token && role) {
      navigate(role === "admin" ? "/admin/dashboard" : "/accueil");
    }
  }, [navigate, setIsHideSidebarAndHeader]);

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!email || !password) return message.error("Veuillez remplir tous les champs.");
    try {
      const response = await axios.post("http://localhost:8000/api/login", { email, password });
      const { access_token, user } = response.data;
      if (access_token && user) {
        localStorage.setItem("token", access_token);
        localStorage.setItem("role", user.role);
        localStorage.setItem("user", JSON.stringify(user));
        setUser(user);
        setIsLogin(true);
        message.success("Connexion réussie !");
        setTimeout(() => {
          navigate(user.role === "admin" ? "/admin/dashboard" : "/accueil");
        }, 800);
      } else {
        message.error("Connexion échouée. Vérifiez vos identifiants.");
      }
    } catch {
      message.error("Email ou mot de passe incorrect.");
    }
  };

  return (
    <div className="auth-body">
      <div className="background">
        <div className="shape"></div>
        <div className="shape"></div>
      </div>
      <form className="auth-form" onSubmit={handleLogin}>
        <h3>Authentification</h3>

        <label htmlFor="email" className='label-login'>Email :</label>
        <div className="input-group">
          <FontAwesomeIcon icon={faEnvelope} className="input-icon icon-purple" />
          <input
            type="email"
            placeholder="Adresse email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <label htmlFor="password" className='label-login'>Mot de passe :</label>
        <div className="input-group">
          <FontAwesomeIcon icon={faLock} className="input-icon icon-red" />
          <input
            type={showPassword ? "text" : "password"}
            placeholder="Mot de passe"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <FontAwesomeIcon
            icon={showPassword ? faEyeSlash : faEye}
            className="password-toggle"
            onClick={() => setShowPassword(!showPassword)}
          />
        </div>

        <button type="submit">Se connecter</button>

        {/*
        <div className="social">
          <div className="go"><FontAwesomeIcon icon={faGoogle} /> Google</div>
          <div className="fb"><FontAwesomeIcon icon={faFacebook} /> Facebook</div>
        </div>
        */}
        

        <div className="text-center mt-3 t1">
          <span>Pas de compte ? </span>
          <Link to="/register" className="text-blue fw-bold">S'inscrire</Link>
        </div>
      </form>
    </div>
  );
};

export default Login;
