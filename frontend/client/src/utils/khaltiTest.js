// Test file to check Khalti API endpoint
// Run this in browser console to test

const testKhaltiPayment = async () => {
    try {
        const response = await fetch("http://localhost:5000/api/v1/khalti/initiate", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                amount: 5000,
                purchaseOrderId: "TEST-" + Date.now(),
                purchaseOrderName: "Test Blood Request - O+",
                bloodGroup: "O+",
                quantity: 10,
                message: "Test message",
                name: "Test User",
                email: "test@mail.com",
                phone: "9800000000"
            })
        });

        const data = await response.json();
        console.log("Response:", data);
        return data;
    } catch (error) {
        console.error("Error:", error);
        return error;
    }
};

// Call this in console: testKhaltiPayment()
