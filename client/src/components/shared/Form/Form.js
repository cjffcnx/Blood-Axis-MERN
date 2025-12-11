import React, { useState } from "react";
import InputType from "./InputType";
import { Link } from "react-router-dom";
import { handleLogin, handleRegister } from "../../../services/authService";
import { isValidEmail, getPasswordError } from "../../../utils/validation";

const Form = ({ formType, submitBtn, formTitle }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("donar");
  const [name, setName] = useState("");
  const [organisationName, setOrganisationName] = useState("");
  const [hospitalName, setHospitalName] = useState("");
  const [city, setCity] = useState("");
  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");

  const handleEmailChange = (e) => {
    const val = e.target.value;
    setEmail(val);
    if (val && isValidEmail(val)) {
      setEmailError("");
    }
  };

  const handleEmailBlur = () => {
    if (!email) return;
    if (!isValidEmail(email)) {
      setEmailError("Please enter a valid email address");
    } else {
      setEmailError("");
    }
  };

  const handlePasswordChange = (e) => {
    const val = e.target.value;
    setPassword(val);
    if (val && !getPasswordError(val)) {
      setPasswordError("");
    }
  };

  const handlePasswordBlur = () => {
    if (!password) return;
    const error = getPasswordError(password);
    setPasswordError(error);
  };

  return (
    <div>
      <form
        onSubmit={(e) => {
          if (formType === "login")
            return handleLogin(e, email, password, role);
          else if (formType === "register")
            return handleRegister(
              e,
              name,
              role,
              email,
              password,
              phone,
              organisationName,
              address,
              hospitalName,
              city
            );
        }}
      >
        <h1 className="text-center">{formTitle}</h1>
        <hr />
        {formType === "login" && (
          <div className="d-flex mb-3">
            <div className="form-check">
              <input
                type="radio"
                className="form-check-input"
                name="role"
                id="donarRadio"
                value={"donar"}
                onChange={(e) => setRole(e.target.value)}
                defaultChecked
              />
              <label htmlFor="adminRadio" className="form-check-label">
                Donar
              </label>
            </div>
            <div className="form-check ms-2">
              <input
                type="radio"
                className="form-check-input"
                name="role"
                id="adminRadio"
                value={"admin"}
                onChange={(e) => setRole(e.target.value)}
              />
              <label htmlFor="adminRadio" className="form-check-label">
                Admin
              </label>
            </div>
            <div className="form-check ms-2">
              <input
                type="radio"
                className="form-check-input"
                name="role"
                id="hospitalRadio"
                value={"hospital"}
                onChange={(e) => setRole(e.target.value)}
              />
              <label htmlFor="hospitalRadio" className="form-check-label">
                Hospital
              </label>
            </div>
            <div className="form-check ms-2">
              <input
                type="radio"
                className="form-check-input"
                name="role"
                id="organisationRadio"
                value={"organisation"}
                onChange={(e) => setRole(e.target.value)}
              />
              <label htmlFor="organisationRadio" className="form-check-label">
                Organisation
              </label>
            </div>
          </div>
        )}
        {/* switch statement */}
        {(() => {
          //eslint-disable-next-line
          switch (true) {
            case formType === "login": {
              return (
                <>
                  <InputType
                    labelText={"email"}
                    labelFor={"forEmail"}
                    inputType={"email"}
                    name={"email"}
                    value={email}
                    onChange={handleEmailChange}
                    onBlur={handleEmailBlur}
                    error={emailError}
                    required={true}
                  />
                  <InputType
                    labelText={"Password"}
                    labelFor={"forPassword"}
                    inputType={"password"}
                    name={"password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required={true}
                  />
                </>
              );
            }
            case formType === "register": {
              return (
                <>
                  {(role === "admin" || role === "donar") && (
                    <InputType
                      labelText={"Name"}
                      labelFor={"forName"}
                      inputType={"text"}
                      name={"name"}
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required={true}
                    />
                  )}
                  {role === "organisation" && (
                    <InputType
                      labelText={"Organisation Name"}
                      labelFor={"fororganisationName"}
                      inputType={"text"}
                      name={"organisationName"}
                      value={organisationName}
                      onChange={(e) => setOrganisationName(e.target.value)}
                      required={true}
                    />
                  )}
                  {role === "hospital" && (
                    <InputType
                      labelText={"Hospital Name"}
                      labelFor={"forHospitalName"}
                      inputType={"text"}
                      name={"hospitalName"}
                      value={hospitalName}
                      onChange={(e) => setHospitalName(e.target.value)}
                      required={true}
                    />
                  )}

                  <InputType
                    labelText={"email"}
                    labelFor={"forEmail"}
                    inputType={"email"}
                    name={"email"}
                    value={email}
                    onChange={handleEmailChange}
                    onBlur={handleEmailBlur}
                    error={emailError}
                    required={true}
                  />
                  <InputType
                    labelText={"Password"}
                    labelFor={"forPassword"}
                    inputType={"password"}
                    name={"password"}
                    value={password}
                    onChange={handlePasswordChange}
                    onBlur={handlePasswordBlur}
                    error={passwordError}
                    required={true}
                  />
                  <InputType
                    labelText={"City"}
                    labelFor={"forCity"}
                    inputType={"text"}
                    name={"city"}
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    required={true}
                  />
                  <InputType
                    labelText={"Address"}
                    labelFor={"forAddress"}
                    inputType={"text"}
                    name={"address"}
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    required={true}
                  />
                  <InputType
                    labelText={"Phone"}
                    labelFor={"forPhone"}
                    inputType={"text"}
                    name={"phone"}
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    required={true}
                  />
                </>
              );
            }
          }
        })()}

        {formType === "register" && (
          <div className="form-check mb-3">
            <input
              className="form-check-input"
              type="checkbox"
              id="termsCheck"
              required
            />
            <label className="form-check-label" htmlFor="termsCheck">
              I agree to the <Link to="/terms">Terms and Conditions</Link> & <Link to="/privacy">Privacy Policy</Link>
            </label>
          </div>
        )}

        <div className="d-flex flex-row justify-content-between">
          {formType === "login" ? (
            <p>
              {role === "admin" ? (
                ""
              ) : (
                <>
                  Not registered yet? Register
                  <Link to={role === "donar" ? "/register" : "/request-account"}>
                    {" "}
                    Here !
                  </Link>
                </>
              )}
            </p>
          ) : (
            <p>
              ALready Usser Please
              <Link to="/login"> Login !</Link>
            </p>
          )}
          <button className="btn btn-primary" type="submit">
            {submitBtn}
          </button>
        </div>
      </form>
    </div>
  );
};

export default Form;
