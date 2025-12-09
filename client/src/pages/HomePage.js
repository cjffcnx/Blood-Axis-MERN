import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import Spinner from "../components/shared/Spinner";
import Layout from "../components/shared/Layout/Layout";
import Modal from "../components/shared/modal/Modal";
import API from "../services/API";
import moment from "moment";

const HomePage = () => {
  const { loading, error, user } = useSelector((state) => state.auth);
  const [data, setData] = useState([]);
  const [analyticsData, setAnalyticsData] = useState([]);
  const navigate = useNavigate();

  const getBloodRecords = async () => {
    try {
      const { data } = await API.get("/inventory/get-inventory");
      if (data?.success) {
        setData(data?.inventory);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const getAnalytics = async () => {
    try {
      const { data } = await API.get("/analytics/bloodGroups-data");
      if (data?.success) {
        setAnalyticsData(data?.bloodGroupData);
      }
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    getBloodRecords();
    getAnalytics();
  }, []);

  return (
    <Layout>
      {user?.role === "admin" && navigate("/admin")}
      {user?.role === "donar" && navigate("/donor-dashboard")}
      {error && <span>{alert(error)}</span>}
      {loading ? (
        <Spinner />
      ) : (
        <>
          <div className="container mt-3">
            {/* Analytics Cards with Progress Bars */}
            <div className="row mb-4">
              {analyticsData?.map((record, i) => (
                <div className="col-md-3 mb-3" key={i}>
                  <div className={`card p-2 h-100 shadow-sm border-0 bg-light`}>
                    <div className="card-body">
                      <div className="d-flex justify-content-between align-items-center mb-2">
                        <h5 className="card-title text-danger mb-0 fs-3">{record.bloodGroup}</h5>
                        <i className="fa-solid fa-droplet text-danger fs-4"></i>
                      </div>

                      <div className="d-flex justify-content-between text-muted small mb-1">
                        <span>Total In: {record.totalIn} ML</span>
                        <span>Total Out: {record.totalOut} ML</span>
                      </div>

                      <div className="mt-3">
                        <div className="d-flex justify-content-between align-items-center mb-1">
                          <span className="fw-bold">Available: {record.availabeBlood} ML</span>
                          <span className="small text-muted">
                            {record.totalIn > 0
                              ? Math.round((record.availabeBlood / record.totalIn) * 100)
                              : 0}% Fill
                          </span>
                        </div>
                        <div className="progress" style={{ height: "8px" }}>
                          <div
                            className="progress-bar bg-danger"
                            role="progressbar"
                            style={{ width: `${record.totalIn > 0 ? (record.availabeBlood / record.totalIn) * 100 : 0}%` }}
                            aria-valuenow={record.availabeBlood}
                            aria-valuemin="0"
                            aria-valuemax={record.totalIn}
                          ></div>
                        </div>
                      </div>

                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="d-flex justify-content-between align-items-center mb-3">
              <h4 className="my-0">Recent Inventory</h4>
              <h4
                className="btn btn-outline-success"
                data-bs-toggle="modal"
                data-bs-target="#staticBackdrop"
              >
                <i className="fa-solid fa-plus me-2"></i>
                Add Inventory
              </h4>
            </div>

            <table className="table table-striped shadow-sm">
              <thead className="table-dark">
                <tr>
                  <th scope="col">Blood Group</th>
                  <th scope="col">Inventory Type</th>
                  <th scope="col">Quantity</th>
                  <th scope="col">Donor Email</th>
                  <th scope="col">Time & Date</th>
                </tr>
              </thead>
              <tbody>
                {data?.map((record) => (
                  <tr key={record._id}>
                    <td><span className="badge bg-secondary">{record.bloodGroup}</span></td>
                    <td><span className={`badge ${record.inventoryType === 'in' ? 'bg-success' : 'bg-danger'}`}>{record.inventoryType}</span></td>
                    <td>{record.quantity} ML</td>
                    <td>{record.email}</td>
                    <td>
                      {moment(record.createdAt).format("DD/MM/YYYY hh:mm A")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <Modal />
          </div>
        </>
      )}
    </Layout>
  );
};

export default HomePage;
