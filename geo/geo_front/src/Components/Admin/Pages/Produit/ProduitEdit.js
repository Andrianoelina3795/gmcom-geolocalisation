import { useEffect, useState } from "react";
import axios from "axios";
import { Link, useNavigate, useParams } from "react-router-dom";
import Swal from "sweetalert2";
import './ProduitEdit.css'; 

function ProduitEdit() {
    const { id } = useParams(); // Récupère l'ID du produit depuis l'URL
    const [type_produit, setType_produit] = useState(""); // État pour le type
    const [nom_produit, setNom_produit] = useState(""); // État pour le nom
    const [montant_produit, setMontant_produit] = useState(""); // État pour le montant
    const navigate = useNavigate(); // Pour rediriger après la modification

    // Appel API pour récupérer les données du produit à modifier
    useEffect(() => {
        try {
            axios.get(`http://127.0.0.1:8000/api/produits/${id}`)
                .then(response => {
                    setType_produit(response.data.type_produit);
                    setNom_produit(response.data.nom_produit);
                    setMontant_produit(response.data.montant_produit);
                });
        } catch (error) {
            Swal.fire({
                toast: true,
                icon: 'error',
                title: 'Erreur',
                text: 'Impossible de charger les données.',
                confirmButtonText: 'OK'
            });
        }
    }, [id]);

    // Fonction de mise à jour
    const updateProduct = async (e) => {
        e.preventDefault();
        const confirmation = await Swal.fire({
            toast: true,
            icon: 'question',
            title: 'Confirmer la modification',
            text: 'Vous-voulez vraiment modifier cet Produit ?',
            showCancelButton: true,
            confirmButtonText: 'Oui, modifier',
            cancelButtonText: 'Annuler',
        });

        if (confirmation.isConfirmed) {
            try {
                await axios.put(`http://127.0.0.1:8000/api/produits/${id}`, {
                    type_produit,
                    nom_produit,
                    montant_produit
                });

                Swal.fire({
                    toast: true,
                    icon: 'success', // corrigé (anciennement 'Success')
                    title: 'Succès!',
                    text: 'Le produit a été modifié avec succès.',
                });

                navigate("/admin/list-produit"); // Redirection
            } catch (error) {
                console.error("Erreur de mise à jour :", error);
                Swal.fire({
                    toast: true,
                    icon: 'error',
                    title: 'Erreur !',
                    text: 'Une erreur s\'est produite lors de la modification.',
                    confirmButtonText: 'OK'
                });
            }
        }
    }

    return (
        <div className='header-contact mt-5'>
            <div className="contact-page">
                <div className="contact-form-box">
                    <h2 className="contact-title text-center">
                        Formulaire de modification produit du GMCOM
                    </h2>

                    {/* Formulaire produit */}
                    <form onSubmit={updateProduct} className="contact-form mt-5">
                        <br />
                        <div className="mb-3">
                            {/* ID en champ caché */}
                            <input type="hidden" name="id" value={id} />
                        </div>

                        {/* Type de produit */}
                        <label>Type produit (travaux)</label>
                        <select
                            className="form-select"
                            name="type_produit"
                            value={type_produit}
                            onChange={(e) => setType_produit(e.target.value)}
                            required
                        >
                            <option value="">--Sélectionner--</option>
                            <option value="Assainissement">Produit d'Assainissement</option>
                            <option value="Adduction d'Eau potable">Produit d'Adduction d'Eau Potable</option>
                            <option value="Construction des Villa Basses">Construction</option>
                        </select>

                        {/* Nom du produit */}
                        <input
                            type="text"
                            name="nom_produit"
                            className="form-control"
                            placeholder="Le nom du produit"
                            value={nom_produit}
                            onChange={(e) => setNom_produit(e.target.value)}
                            required
                        />

                        {/* Montant du produit */}
                        <input
                            type="number"
                            name="montant_produit"
                            className="form-control"
                            placeholder="Le prix du produit en Ariary"
                            value={montant_produit}
                            onChange={(e) => setMontant_produit(e.target.value)}
                            required
                        />

                        {/* Boutons de soumission et retour */}
                        <div className="d-grid gap-2 d-md-flex justify-content-center mt-5">
                            <button
                                type="submit"
                                className="btn btn-success"
                                style={{ width: "60%" }}
                            >
                                Mettre à jour
                            </button>

                            <Link to="/admin/list-produit" className="btn btn-outline-secondary">
                                Retour
                            </Link>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}

export default ProduitEdit;
