import React, { useEffect, useState } from "react";
import Layout from "../../components/shared/Layout/Layout";
import API from "../../services/API";
import moment from "moment";

const Donar = () => {
  const [data, setData] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [appliedSearch, setAppliedSearch] = useState("");
  //find donar records
  const getDonars = async (search = "") => {
    try {
      const { data } = await API.get("/inventory/get-donars", {
        params: search ? { search } : {},
      });
      //   console.log(data);
      if (data?.success) {
        setData(data?.donars);
      }
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    getDonars("");
  }, []);

  useEffect(() => {
    getDonars(appliedSearch);
  }, [appliedSearch]);

  const handleSearchSubmit = (event) => {
    event.preventDefault();
    setAppliedSearch(searchTerm.trim());
  };

  const handleSearchClear = () => {
    setSearchTerm("");
    setAppliedSearch("");
  };

  return (
    <Layout>
      <div className="d-flex flex-wrap align-items-center gap-2 mb-3">
        <h2 className="mb-0">Donors</h2>
        <form className="d-flex flex-wrap align-items-center gap-2 ms-auto" onSubmit={handleSearchSubmit}>
          <input
            className="form-control"
            style={{ minWidth: "240px" }}
            placeholder="Search name, email, phone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <button className="btn btn-primary" type="submit">Search</button>
          <button className="btn btn-outline-secondary" type="button" onClick={handleSearchClear}>Clear</button>
        </form>
      </div>
      <table className="table ">
        <thead>
          <tr>
            <th scope="col">Name</th>
            <th scope="col">Email</th>
            <th scope="col">Phone</th>
            <th scope="col">Date</th>
          </tr>
        </thead>
        <tbody>
          {data?.map((record) => (
            <tr key={record._id}>
              <td>{record.name || record.organisationName + " (ORG)"}</td>
              <td>{record.email}</td>
              <td>{record.phone}</td>
              <td>{moment(record.createdAt).format("DD/MM/YYYY hh:mm A")}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </Layout>
  );
};

export default Donar;
