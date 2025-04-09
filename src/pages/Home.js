import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { getAuth, signInWithEmailAndPassword, signOut } from "firebase/auth";
import { getFirestore, collection, getDocs } from "firebase/firestore";
import "./home.css";

const Home = () => {

    const navigate = useNavigate();
    const [formData, setFormData] = useState({ email: "", password: "" });
    const [error, setError] = useState("");

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleLogin = async (e) => {
        e.preventDefault();
        setError("");

        try {
            const auth = getAuth();
            const db = getFirestore();

            const userCredential = await signInWithEmailAndPassword(auth, formData.email, formData.password);
            const user = userCredential.user;

            const usersCollection = collection(db, "users");
            const usersSnapshot = await getDocs(usersCollection);

            let isAdmin = false;
            let adminName = null;

            usersSnapshot.forEach((doc) => {
                const userData = doc.data();
                if (userData.email === user.email) {
                    isAdmin = true;
                    adminName = doc.id;
                }
            });

            if (!isAdmin) {
                await signOut(auth);
                setError("Access denied. Not an admin.");
                return;
            }

            localStorage.setItem("adminName", adminName);

            navigate("/reports");
        } catch (err) {
            setError("Invalid email or password.");
            console.error("Login error:", err);
        }
    };

    return (
        <div className="home-container">
            <div className="login-container">
                <div className="logo-title">
                    <img src="/logo.png" alt="Logo" className="logo" />
                    <h1>Examining the Interaction Effect of Language and Racial Categorization on Emotion Perception</h1>
                </div>

                {error && <p className="error-message">{error}</p>}

                <form onSubmit={handleLogin}>
                <input
                        type="email"
                        name="email"
                        placeholder="Email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                    />
                    <input
                        type="password"
                        name="password"
                        placeholder="Password"
                        value={formData.password}
                        onChange={handleChange}
                        required
                    />
                    <button type="submit">Log In</button>
                </form>
            </div>
        </div>
    );
};

export default Home;
