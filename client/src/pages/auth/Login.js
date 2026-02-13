import React from "react";
import Form from "../../components/shared/Form/Form";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import Spinner from "./../../components/shared/Spinner";

const Login = () => {
  const { loading, error } = useSelector((state) => state.auth);
  return (
    <>
      {error && <span>{alert(error)}</span>}
      {loading ? (
        <Spinner />
      ) : (
        <div className="row g-0 position-relative">
          <div className="position-absolute top-0 start-0 p-3">
            <Link
              to="/"
              className="btn btn-light shadow-sm"
              aria-label="Back to welcome page"
            >
              Back to Welcome
            </Link>
          </div>
          <div className="col-md-8 form-banner">
            <img src="./assets/images/banner1.jpg" alt="loginImage" />
          </div>
          <div className="col-md-4 form-container">
            <Form
              formTitle={"Login Page"}
              submitBtn={"Login"}
              formType={"login"}
            />
          </div>
        </div>
      )}
    </>
  );
};

export default Login;
