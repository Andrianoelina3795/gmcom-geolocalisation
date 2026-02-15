import React, { useState } from 'react';
import './Contact.css';
import { FaEnvelope, FaPhone, FaMapMarkerAlt } from 'react-icons/fa';
import axios from 'axios';

const Contact = () => {
    const [formData, setFormData] = useState({
        nom: '',
        email: '',
        telephone: '',
        message: ''
    });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post('http://localhost:8000/api/contact', formData,);
            alert(response.data.message);
            setFormData({ nom: '', email: '', telephone: '', message: '' });
        } catch (error) {
            if (error.response && error.response.data.errors) {
                const messages = Object.values(error.response.data.errors).flat().join('\n');
                alert("Erreur de validation :\n" + messages);
            } else {
                alert("Une erreur est survenue.");
            }
        }
    };
    return (
        <>
            <div className='header-contact'>
                <div className="contact-page">
                    <div className="contact-form-box">
                        <h2 className="contact-title text-center">
                            Contactez-nous
                        </h2>
                        <p className="contact-description text-center">
                            Vous avez une question, un projet ou besoin d'information ? N'hésitez pas à nous écrire!
                        </p>

                        {/* Informations de contact */}
                        <div className="contact-info">
                            <div className="contact-item">
                                <FaEnvelope color='blue' className="contact-icon" />
                                <span className='ml-2'> renaly.samtheo@gmail.com</span>
                            </div>
                            <div className="contact-item">
                                <FaPhone color='skyblue' className="contact-icon" />
                                <span className='ml-2'> +261 34 78 695 64</span>
                            </div>
                            <div className="contact-item">
                                <FaMapMarkerAlt color='red' className="contact-icon" />
                                <span className='ml-1'> Lot : AKT ID 70 BIS ANTANETY II Vontovorona, Antananarivo, Madagascar</span>
                            </div>
                        </div>

                        {/* Formulaire de contact */}
                        <form onSubmit={handleSubmit} className="contact-form mt-3">
                            <input
                                type="text"
                                name="nom"
                                className='form-control'
                                placeholder="Votre nom"
                                value={formData.nom}
                                onChange={handleChange}
                                required
                            />

                            <input
                                type="email"
                                name="email"
                                className='form-control'
                                placeholder="Votre email"
                                value={formData.email}
                                onChange={handleChange}
                                required />

                            <input
                                type="number"
                                name="telephone"
                                className='form-control'
                                placeholder="Votre numéro téléphone"
                                value={formData.telephone}
                                onChange={handleChange}
                                required />
                            <textarea
                                name="message"
                                className='form-control'
                                placeholder="Votre message"
                                value={formData.message}
                                onChange={handleChange}
                                required
                                rows="5"
                            />
                            <button type="submit" className="contact-btn">Envoyer</button>
                        </form>
                    </div>
                </div>
            </div>
        </>
    );
};

export default Contact;