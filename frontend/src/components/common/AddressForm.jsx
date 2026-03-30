import React, { useState } from 'react';

const AddressForm = ({ initialData, onSubmit, onCancel, loading }) => {
  const INDIAN_STATES = [
    'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh', 'Goa', 'Gujarat', 
    'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka', 'Kerala', 'Madhya Pradesh', 
    'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Punjab', 
    'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura', 'Uttar Pradesh', 
    'Uttarakhand', 'West Bengal', 'Andaman and Nicobar Islands', 'Chandigarh', 
    'Dadra and Nagar Haveli and Daman and Diu', 'Delhi', 'Jammu and Kashmir', 'Ladakh', 
    'Lakshadweep', 'Puducherry'
  ];

  const [formData, setFormData] = useState(initialData || {
    recipient_name: '',
    phone_number: '',
    flat_house_no: '',
    building_apartment: '',
    area_street_village: '',
    landmark: '',
    city: '',
    state: '',
    postal_code: '',
    country: 'India',
    name: 'Home'
  });

  const [errors, setErrors] = useState({});

  const validate = () => {
    let tempErrors = {};
    if (!formData.recipient_name) tempErrors.recipient_name = "Full Name is required";
    
    // Mobile validation: 10 digits
    const mobileRegex = /^[0-9]{10}$/;
    if (!formData.phone_number) {
        tempErrors.phone_number = "Mobile number is required";
    } else if (!mobileRegex.test(formData.phone_number.replace(/\s/g, ''))) {
        tempErrors.phone_number = "Enter a valid 10-digit mobile number";
    }

    if (!formData.area_street_village) tempErrors.area_street_village = "Area/Street is required";
    if (!formData.city) tempErrors.city = "City/Town is required";
    if (!formData.state) tempErrors.state = "State is required";

    // Pincode validation: 6 digits
    const pincodeRegex = /^[0-9]{6}$/;
    if (!formData.postal_code) {
        tempErrors.postal_code = "Pincode is required";
    } else if (!pincodeRegex.test(formData.postal_code)) {
        tempErrors.postal_code = "Enter a valid 6-digit Pincode";
    }

    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    // Clear error for this field
    if (errors[e.target.name]) {
        setErrors({ ...errors, [e.target.name]: null });
    }
  };

  const submitHandler = (e) => {
    e.preventDefault();
    if (validate()) {
        onSubmit(formData);
    }
  };

  return (
    <form onSubmit={submitHandler} style={{ display: 'grid', gap: '1.2rem', padding: '1rem 0' }}>
      <div className="grid grid-cols-2" style={{ gap: '1rem' }}>
        <div className="form-group">
          <label className="form-label" style={{ fontSize: '0.7rem' }}>Full Name *</label>
          <input name="recipient_name" value={formData.recipient_name} onChange={handleChange} className="form-input" style={{ padding: '0.6rem 1rem' }} />
          {errors.recipient_name && <p style={{ color: 'red', fontSize: '0.65rem', marginTop: '0.2rem' }}>{errors.recipient_name}</p>}
        </div>
        <div className="form-group">
          <label className="form-label" style={{ fontSize: '0.7rem' }}>Mobile Number *</label>
          <input name="phone_number" value={formData.phone_number} onChange={handleChange} className="form-input" style={{ padding: '0.6rem 1rem' }} placeholder="10-digit mobile number" />
          {errors.phone_number && <p style={{ color: 'red', fontSize: '0.65rem', marginTop: '0.2rem' }}>{errors.phone_number}</p>}
        </div>
      </div>

      <div className="grid grid-cols-2" style={{ gap: '1rem' }}>
        <div className="form-group">
          <label className="form-label" style={{ fontSize: '0.7rem' }}>Flat / House No *</label>
          <input name="flat_house_no" value={formData.flat_house_no} onChange={handleChange} required className="form-input" style={{ padding: '0.6rem 1rem' }} />
        </div>
        <div className="form-group">
          <label className="form-label" style={{ fontSize: '0.7rem' }}>Building / Apartment</label>
          <input name="building_apartment" value={formData.building_apartment} onChange={handleChange} className="form-input" style={{ padding: '0.6rem 1rem' }} />
        </div>
      </div>

      <div className="form-group">
        <label className="form-label" style={{ fontSize: '0.7rem' }}>Area / Street / Sector / Village *</label>
        <input name="area_street_village" value={formData.area_street_village} onChange={handleChange} className="form-input" style={{ padding: '0.6rem 1rem' }} />
        {errors.area_street_village && <p style={{ color: 'red', fontSize: '0.65rem', marginTop: '0.2rem' }}>{errors.area_street_village}</p>}
      </div>

      <div className="form-group">
        <label className="form-label" style={{ fontSize: '0.7rem' }}>Landmark (Optional)</label>
        <input name="landmark" value={formData.landmark} onChange={handleChange} className="form-input" style={{ padding: '0.6rem 1rem' }} placeholder="e.g. Near Apollo Hospital" />
      </div>

      <div className="grid grid-cols-3" style={{ gap: '1rem' }}>
        <div className="form-group">
          <label className="form-label" style={{ fontSize: '0.7rem' }}>Town / City *</label>
          <input name="city" value={formData.city} onChange={handleChange} className="form-input" style={{ padding: '0.6rem 1rem' }} />
          {errors.city && <p style={{ color: 'red', fontSize: '0.65rem', marginTop: '0.2rem' }}>{errors.city}</p>}
        </div>
        <div className="form-group">
          <label className="form-label" style={{ fontSize: '0.7rem' }}>State *</label>
          <select name="state" value={formData.state} onChange={handleChange} className="form-input" style={{ padding: '0.6rem 1rem' }}>
            <option value="">Select State</option>
            {INDIAN_STATES.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
          {errors.state && <p style={{ color: 'red', fontSize: '0.65rem', marginTop: '0.2rem' }}>{errors.state}</p>}
        </div>
        <div className="form-group">
          <label className="form-label" style={{ fontSize: '0.7rem' }}>Pincode *</label>
          <input name="postal_code" value={formData.postal_code} onChange={handleChange} className="form-input" style={{ padding: '0.6rem 1rem' }} placeholder="6-digit PIN" />
          {errors.postal_code && <p style={{ color: 'red', fontSize: '0.65rem', marginTop: '0.2rem' }}>{errors.postal_code}</p>}
        </div>
      </div>

      <div className="form-group">
        <label className="form-label" style={{ fontSize: '0.7rem' }}>Address Label</label>
        <select name="name" value={formData.name} onChange={handleChange} className="form-input" style={{ padding: '0.6rem 1rem' }}>
          <option value="Home">Home</option>
          <option value="Office">Office</option>
          <option value="Other">Other</option>
        </select>
      </div>

      <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
        <button type="submit" disabled={loading} className="btn btn-primary" style={{ flex: 1 }}>
          {loading ? 'SAVING...' : 'SAVE ADDRESS'}
        </button>
        {onCancel && (
          <button type="button" onClick={onCancel} className="btn btn-outline" style={{ flex: 1 }}>
            CANCEL
          </button>
        )}
      </div>
    </form>
  );
};

export default AddressForm;
