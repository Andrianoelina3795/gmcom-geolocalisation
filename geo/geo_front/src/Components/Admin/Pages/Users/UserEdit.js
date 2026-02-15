import { useEffect, useState } from "react";
import axios from "axios";
import { Link, useNavigate, useParams } from "react-router-dom";
import Swal from "sweetalert2";
import './UserEdit.css';

function UserEdit() {
    const { id } = useParams(); // Récupère l'ID depuis l'URL
    const [name, setName] = useState("");
    const [pseudo, setPseudo] = useState("");
    const [email, setEmail] = useState("");
    const [contact_ac, setContact_ac] = useState("");
    const navigate = useNavigate();

    useEffect(() => {
        try {
            axios.get(`http://127.0.0.1:8000/api/users/${id}`)
                .then(response => {
                    setName(response.data.name);
                    setPseudo(response.data.pseudo);
                    setEmail(response.data.email);
                    setContact_ac(response.data.contact_ac);
                })
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

    const updateUser = async (e) => {
        e.preventDefault();
        const confirmation = await Swal.fire({
            toast: true,
            icon: 'question',
            title: 'Confirmer la modification',
            text: 'Vous-voulez vraiment modifier cet agent?',
            showCancelButton: true,
            confirmButtonText: 'Oui, modifier',
            cancelButtonText: 'Annuler',
        });

        if (confirmation.isConfirmed) {
            try {
                await axios.put(`http://127.0.0.1:8000/api/users/${id}`, { name, pseudo, email, contact_ac});
                // Alerte de succès
                Swal.fire({
                    toast: true,
                    icon: 'Success',
                    title: 'Succès!', 
                    text: 'L\'agent a été modifié avec succès.', 
                });
                navigate("/admin/users");
            } catch (error) {
                console.error("Erreur de mise à jour :", error);
                // Alerte d'erreur
                Swal.fire({
                    toast: true,
                    icon: 'error', // Correction de la typo
                    title: 'Erreur !', // Exemple de titre
                    text: 'Une erreur s\'est produite lors de la modification.',
                    confirmButtonText: 'OK' // Correction de la clé
                });
            }
        };
    }
        return (
            <div className="container mt-5">
                <div className="container">

                    <form onSubmit={updateUser}>
                        <h2 className="text-center">Modifier un utilisateur</h2>
                        <br />
                        <div className="mb-3">
                            <input type="hidden" name="id" value={id} />
                        </div>
                        <div className="mb-3">
                            <label>Nom</label>
                            <input type="text" className="form-control" value={name} onChange={(e) => setName(e.target.value)} required />
                        </div>
                        <div className="mb-3">
                            <label>Pseudo</label>
                            <input type="text" className="form-control" value={pseudo} onChange={(e) => setPseudo(e.target.value)} required />
                        </div>
                        <div className="mb-3">
                            <label>Email</label>
                            <input type="email" className="form-control" value={email} onChange={(e) => setEmail(e.target.value)} disabled /> {/* Email non modifiable */}
                        </div>
                        <div className="mb-3">
                            <label>Contact</label>
                            <input type="tel" className="form-control" value={contact_ac} onChange={(e) => setContact_ac(e.target.value)} required />
                        </div>
                        <div className="d-grid gap-2 d-md-flex justify-content-center mt-5">
                        <button type="submit" className="btn btn-success" style={{ width: "70%" }}>Mettre à jour</button>
                        <Link to="/admin/users" className="btn btn-outline-secondary" style={{ width:"20%" }}>
                            Retour
                        </Link>
                    </div>
                    </form>
                </div>
            </div>
        );
}
export default UserEdit;