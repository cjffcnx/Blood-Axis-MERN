export function isValidEmail(email) {
    if (!email) return false;

    const basicCheck = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    if (!basicCheck) return false;

    const pattern = /^(?!.*\.\.)(?!\.)(?!.*\.$)[A-Za-z0-9._%+\-]+@[A-Za-z0-9\-]+(\.[A-Za-z0-9\-]+)*\.[A-Za-z]{2,}$/;

    return pattern.test(email);
}

export function isValidPassword(password) {
    if (!password) return false;

    // At least 8 characters, 1 uppercase, 1 lowercase, 1 number
    const pattern = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,}$/;

    return pattern.test(password);
}

export function getPasswordError(password) {
    if (!password) return "Password is required";
    if (password.length < 8) return "Password must be at least 8 characters";
    if (!/(?=.*[a-z])/.test(password)) return "Password must contain at least one lowercase letter";
    if (!/(?=.*[A-Z])/.test(password)) return "Password must contain at least one uppercase letter";
    if (!/(?=.*\d)/.test(password)) return "Password must contain at least one number";
    return "";
}
