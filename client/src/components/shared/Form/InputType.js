import React from "react";

const InputType = ({
  labelText,
  labelFor,
  inputType,
  value,
  onChange,
  name,
  required,
  onBlur,
  error,
}) => {
  return (
    <>
      <div className="mb-1">
        <label htmlFor={labelFor} className="form-label">
          {labelText}
          {required && <span style={{ color: 'red', marginLeft: '4px' }}>*</span>}
        </label>
        <input
          type={inputType}
          className="form-control"
          name={name}
          value={value}
          onChange={onChange}
          onBlur={onBlur}
          required={required}
        />
        {error && <div className="text-danger small mt-1">{error}</div>}
      </div>
    </>
  );
};

export default InputType;
