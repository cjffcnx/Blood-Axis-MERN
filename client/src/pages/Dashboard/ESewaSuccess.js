import React, { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import axios from "axios";
import Layout from "../../components/shared/Layout/Layout";
import API from "../../services/API";

const ESewaSuccess = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState("checking");
  const [message, setMessage] = useState("");
  const [creatingRequest, setCreatingRequest] = useState(false);

  // eSewa can return either a txnId/transaction_uuid query param or a base64-encoded `data` blob.
  const extractTransactionId = () => {
    const directId = searchParams.get("txnId") || searchParams.get("transaction_uuid");
    if (directId) return directId;

    const encoded = searchParams.get("data");
    if (!encoded) return null;

    try {
      const json = atob(encoded);
      const parsed = JSON.parse(json);
      // transaction_uuid is the field we used when initiating the payment
      return parsed?.transaction_uuid || parsed?.transaction_code || null;
    } catch (err) {
      console.warn("Failed to decode eSewa data param", err);
      return null;
    }
  };

  useEffect(() => {
    const verifyPayment = async () => {
      const txnId = extractTransactionId();
      if (!txnId) {
        setStatus("failed");
        setMessage("No transaction ID found in URL");
        return;
      }

      try {
          const response = await axios.post("http://localhost:5000/api/v1/esewa/verify", {
            transactionId: txnId,
            encodedData: searchParams.get("data"),
          });

        if (response.data?.success) {
          setStatus("success");
          setMessage("Payment verified. Blood request will be created.");

          const pendingPayloadRaw = sessionStorage.getItem("pendingRequestPayload");
          if (pendingPayloadRaw) {
            try {
              const parsedPayload = JSON.parse(pendingPayloadRaw);
              setCreatingRequest(true);
              const createRes = await API.post("/request/hospital-request", {
                ...parsedPayload,
                paymentStatus: "paid",
              });
              setCreatingRequest(false);
              if (createRes.data?.success) {
                setMessage("Payment verified and request submitted to the selected organisation.");
                sessionStorage.removeItem("pendingRequestPayload");
              } else {
                setMessage(createRes.data?.message || "Payment verified but failed to save request");
              }
            } catch (err) {
              setCreatingRequest(false);
              console.log("Request creation after payment failed", err);
              setMessage("Payment verified but failed to save request");
            }
          } else {
            setMessage("Payment verified. Please resubmit request if it does not appear.");
          }
        } else {
          setStatus("failed");
          setMessage(response.data?.message || "Payment verification failed");
        }
      } catch (error) {
        console.log("Verification error:", error.response?.data || error.message);
        setStatus("failed");
        setMessage(error.response?.data?.message || "Error verifying payment");
      }
    };

    verifyPayment();
  }, [searchParams]);

  return (
    <Layout>
      <div className="container py-5">
        <div className="row justify-content-center">
          <div className="col-md-6">
            <div className={`card text-center ${status === "success" ? "border-success" : "border-danger"}`}>
              <div className="card-body py-5">
                {status === "checking" && (
                  <>
                    <div className="spinner-border text-primary mb-3" role="status"></div>
                    <h4>Verifying payment...</h4>
                  </>
                )}

                {status === "success" && (
                  <>
                    <i className="fa-solid fa-circle-check text-success" style={{ fontSize: 48 }}></i>
                    <h4 className="mt-3">Payment Successful</h4>
                    <p className="text-muted">{message}</p>
                  </>
                )}

                {status === "failed" && (
                  <>
                    <i className="fa-solid fa-circle-xmark text-danger" style={{ fontSize: 48 }}></i>
                    <h4 className="mt-3">Payment Failed</h4>
                    <p className="text-muted">{message}</p>
                  </>
                )}

                <div className="d-grid gap-2 mt-4">
                  <button className="btn btn-primary" onClick={() => navigate("/request-supply")}>Go Back</button>
                  <button className="btn btn-outline-secondary" onClick={() => navigate("/home")}>Dashboard</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default ESewaSuccess;
