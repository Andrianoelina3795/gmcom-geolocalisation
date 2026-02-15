import React from "react";
import './Footer.css'; // fichier de style personnalisé

class Footer extends React.Component {
    render() {
        return (
            <footer className="footer">
                <p>&copy; {new Date().getFullYear()} GMCOM. Tous droits réservés.</p>
                <p>
                    Contactez-nous à :{" "}
                    <a href="mailto:renaly.samtheo@gmail.com">renaly.samtheo@gmail.com</a>
                </p>
            </footer>
        );
    }
}

export default Footer;
