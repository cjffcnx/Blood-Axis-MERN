const isValidPhone = (phone) => {
  const value = String(phone || "").trim();
  return /^\d{10}$/.test(value);
};

module.exports = {
  isValidPhone,
};
