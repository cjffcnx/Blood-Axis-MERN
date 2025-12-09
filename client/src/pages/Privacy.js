import React from "react";
import Layout from "../components/shared/Layout/Layout";

const Privacy = () => {
    return (
        <Layout>
            <div className="container mt-4">
                <h1>Privacy Policy</h1>
                <p>
                    Your privacy is important to us. This policy outlines how we handle...
                </p>
                <h3>1. Data Collection</h3>
                <p>We collect name, email, and health checks...</p>
                <h3>2. Usage</h3>
                <p>Data is used solely for blood bank management...</p>
            </div>
        </Layout>
    );
};

export default Privacy;
