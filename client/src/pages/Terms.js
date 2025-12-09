import React from "react";
import Layout from "../components/shared/Layout/Layout";

const Terms = () => {
    return (
        <Layout>
            <div className="container mt-4">
                <h1>Terms and Conditions</h1>
                <p>
                    Welcome to Blood Bank App. By adhering to these terms, you agree to...
                </p>
                <h3>1. Donation Eligibility</h3>
                <p>You must be 18 years or older to donate...</p>
                <h3>2. Privacy</h3>
                <p>We respect your data privacy...</p>
                {/* Add more placeholder content */}
            </div>
        </Layout>
    );
};

export default Terms;
