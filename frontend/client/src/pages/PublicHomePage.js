import React from "react";
import { Link } from "react-router-dom";

const PublicHomePage = () => {
    return (
        <>
            <nav className="navbar navbar-expand-lg navbar-dark bg-dark">
                <div className="container-fluid">
                    <Link className="navbar-brand" to="/">
                        Blood Bank App
                    </Link>
                    <button
                        className="navbar-toggler"
                        type="button"
                        data-bs-toggle="collapse"
                        data-bs-target="#navbarNav"
                        aria-controls="navbarNav"
                        aria-expanded="false"
                        aria-label="Toggle navigation"
                    >
                        <span className="navbar-toggler-icon"></span>
                    </button>
                    <div className="collapse navbar-collapse" id="navbarNav">
                        <ul className="navbar-nav ms-auto">
                            <li className="nav-item">
                                <Link className="nav-link" to="/login">
                                    Login
                                </Link>
                            </li>
                            <li className="nav-item">
                                <Link className="nav-link" to="/register">
                                    Register
                                </Link>
                            </li>
                        </ul>
                    </div>
                </div>
            </nav>

            <div className="container-fluid p-0">
                <div
                    className="d-flex flex-column justify-content-center align-items-center text-white"
                    style={{
                        height: "90vh",
                        background: "linear-gradient(rgba(0,0,0,0.7), rgba(0,0,0,0.7)), url('https://images.unsplash.com/photo-1615461066841-6116e61058f4?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80')",
                        backgroundSize: "cover",
                        backgroundPosition: "center",
                    }}
                >
                    <h1 className="display-3 fw-bold mb-4">Give Blood, Save Life</h1>
                    <p className="lead mb-5 text-center" style={{ maxWidth: "600px" }}>
                        Your donation can be the difference between life and death. Join our community of life savers today.
                    </p>
                    <div className="d-flex gap-3">
                        <Link to="/login" className="btn btn-danger btn-lg px-5">
                            Donate Blood Now
                        </Link>
                        <Link to="/request-blood" className="btn btn-outline-light btn-lg px-5">
                            Request Blood
                        </Link>
                    </div>
                </div>
            </div>
        </>
    );
};

export default PublicHomePage;
