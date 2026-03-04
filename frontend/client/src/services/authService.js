import { userLogin, userRegister } from "../redux/features/auth/authActions";
import store from "../redux/store";
import { isValidEmail, isValidPassword, getPasswordError } from "../utils/validation";

export const handleLogin = (e, email, password, role) => {
  e.preventDefault();
  try {
    if (!role || !email || !password) {
      return alert("Please Privde All Feilds");
    }

    if (!isValidEmail(email)) {
      return alert("Please enter a valid email address");
    }

    store.dispatch(userLogin({ email, password, role }));
  } catch (error) {
    console.log(error);
  }
};

export const handleRegister = (
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
) => {
  if (!isValidEmail(email)) {
    return alert("Please enter a valid email address");
  }

  if (!isValidPassword(password)) {
    const error = getPasswordError(password);
    return alert(error);
  }

  if (!city) {
    return alert("City is required");
  }

  e.preventDefault();
  try {
    store.dispatch(
      userRegister({
        name,
        role,
        email,
        password,
        phone,
        organisationName,
        address,
        hospitalName,
        preferredCity: city,
      })
    );
  } catch (error) {
    console.log(error);
  }
};
