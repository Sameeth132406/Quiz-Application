import React, { useState, useEffect, useContext, useRef } from 'react';
import { AuthContext } from '../context/AuthContext';
import userService from '../services/userService';
import Loading from '../components/Loading';

const Profile = () => {
  const { user, role, updateUserContext } = useContext(AuthContext);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});

  const photoInputRef = useRef(null);

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phoneNumber: '',
    dob: '',
    gender: '',
    address: '',
    aadhaarNumber: '',
    panNumber: '',
    profilePictureUrl: '',
    // Student fields
    qualification: '',
    institution: '',
    rollNumber: '',
    passingYear: '',
    specialization: '',
    // Educator fields
    designation: '',
    department: '',
    experienceYears: '',
    employeeId: '',
    bio: ''
  });

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      setErrorMsg('');
      try {
        const data = await userService.getMyProfile();
        setFormData({
          fullName: data.fullName || '',
          email: data.email || user?.email || '',
          phoneNumber: data.phoneNumber || '',
          dob: data.dob || '',
          gender: data.gender || '',
          address: data.address || '',
          aadhaarNumber: data.aadhaarNumber || '',
          panNumber: data.panNumber || '',
          profilePictureUrl: data.profilePictureUrl || user?.profilePictureUrl || '',
          qualification: data.qualification || '',
          institution: data.institution || '',
          rollNumber: data.rollNumber || '',
          passingYear: data.passingYear || '',
          specialization: data.specialization || '',
          designation: data.designation || '',
          department: data.department || '',
          experienceYears: data.experienceYears || '',
          employeeId: data.employeeId || '',
          bio: data.bio || ''
        });

        // Ensure AuthContext is in sync with latest photo & name
        if (data.profilePictureUrl || data.fullName) {
          updateUserContext({
            fullName: data.fullName || user?.fullName,
            profilePictureUrl: data.profilePictureUrl || user?.profilePictureUrl
          });
        }
      } catch (err) {
        setErrorMsg('Failed to load profile details.');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [user]);

  // Handle Photo Upload
  const handlePhotoSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Please upload an image file (PNG, JPG, JPEG, WEBP).');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      alert('Image size exceeds 10MB limit. Please choose a smaller photo.');
      return;
    }

    setUploadingPhoto(true);
    setErrorMsg('');
    setSuccessMsg('');
    try {
      const resp = await userService.uploadProfilePhoto(file);
      const newPhotoUrl = resp.profilePictureUrl;
      setFormData(prev => ({ ...prev, profilePictureUrl: newPhotoUrl }));
      updateUserContext({ profilePictureUrl: newPhotoUrl });
      setSuccessMsg('Profile photo updated successfully!');
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Failed to upload photo. Please try again.');
    } finally {
      setUploadingPhoto(false);
      if (photoInputRef.current) photoInputRef.current.value = '';
    }
  };

  // Input Change with Formatting
  const handleChange = (e) => {
    const { name, value } = e.target;

    // Clear previous error on this field
    if (fieldErrors[name]) {
      setFieldErrors(prev => ({ ...prev, [name]: '' }));
    }
    if (successMsg) setSuccessMsg('');
    if (errorMsg) setErrorMsg('');

    // Specific input formatting
    if (name === 'phoneNumber') {
      // Only digits, maximum 10 digits
      const digitsOnly = value.replace(/\D/g, '').slice(0, 10);
      setFormData(prev => ({ ...prev, phoneNumber: digitsOnly }));
      return;
    }

    if (name === 'aadhaarNumber') {
      // Digits only, max 12 digits, formatted as XXXX-XXXX-XXXX
      const digitsOnly = value.replace(/\D/g, '').slice(0, 12);
      let formatted = digitsOnly;
      if (digitsOnly.length > 4 && digitsOnly.length <= 8) {
        formatted = `${digitsOnly.slice(0, 4)}-${digitsOnly.slice(4)}`;
      } else if (digitsOnly.length > 8) {
        formatted = `${digitsOnly.slice(0, 4)}-${digitsOnly.slice(4, 8)}-${digitsOnly.slice(8)}`;
      }
      setFormData(prev => ({ ...prev, aadhaarNumber: formatted }));
      return;
    }

    if (name === 'panNumber') {
      // Convert to uppercase alphanumeric, max 10 characters
      const cleaned = value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 10);
      setFormData(prev => ({ ...prev, panNumber: cleaned }));
      return;
    }

    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Client-Side Validation
  const validateForm = () => {
    const errors = {};

    // 1. Full Name: character length >= 2 and <= 100
    if (!formData.fullName || formData.fullName.trim().length < 2) {
      errors.fullName = 'Full Name is required (minimum 2 characters).';
    } else if (formData.fullName.trim().length > 100) {
      errors.fullName = 'Full Name cannot exceed 100 characters.';
    }

    // 2. Email ID: must end with @gmail.com
    const emailTrimmed = (formData.email || '').trim().toLowerCase();
    const gmailRegex = /^[a-zA-Z0-9._%+-]+@gmail\.com$/i;
    if (!emailTrimmed) {
      errors.email = 'Email address is required.';
    } else if (!gmailRegex.test(emailTrimmed)) {
      errors.email = 'Email ID must be a valid account ending with @gmail.com (e.g. yourname@gmail.com).';
    }

    // 3. Phone Number: exactly 10 digits
    const phoneDigits = (formData.phoneNumber || '').replace(/\D/g, '');
    if (!phoneDigits) {
      errors.phoneNumber = 'Phone number is required.';
    } else if (phoneDigits.length !== 10) {
      errors.phoneNumber = `Phone number must be exactly 10 digits (currently ${phoneDigits.length} digits).`;
    }

    // 4. Aadhaar Number: exactly 12 digits
    if (formData.aadhaarNumber) {
      const aadhaarDigits = formData.aadhaarNumber.replace(/\D/g, '');
      if (aadhaarDigits.length !== 12) {
        errors.aadhaarNumber = `Aadhaar number must contain exactly 12 digits (currently ${aadhaarDigits.length} digits).`;
      }
    }

    // 5. PAN Number: standard 10-character alphanumeric
    if (formData.panNumber) {
      const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]$/;
      if (!panRegex.test(formData.panNumber.trim().toUpperCase())) {
        errors.panNumber = 'PAN number must be a valid 10-character code (5 letters, 4 numbers, 1 letter, e.g. ABCDE1234F).';
      }
    }

    // 6. Role-specific validations
    if (!formData.qualification || formData.qualification.trim().length < 2) {
      errors.qualification = 'Please enter your qualification (minimum 2 characters).';
    }

    if (role === 'STUDENT') {
      if (!formData.institution || formData.institution.trim().length < 2) {
        errors.institution = 'Please enter your college or institution name.';
      }
    }

    if (role === 'EDUCATOR') {
      if (!formData.designation || formData.designation.trim().length < 2) {
        errors.designation = 'Please enter your academic designation or title.';
      }
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccessMsg('');
    setErrorMsg('');

    // Strict validation check
    const isValid = validateForm();
    if (!isValid) {
      setErrorMsg('Please correct the highlighted errors before submitting your details.');
      window.scrollTo({ top: 120, behavior: 'smooth' });
      return;
    }

    setSaving(true);
    try {
      const updated = await userService.updateMyProfile(formData);
      updateUserContext({
        fullName: updated.fullName,
        profilePictureUrl: updated.profilePictureUrl
      });
      setSuccessMsg('Your details have been successfully verified and saved to the administrative log!');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Failed to update details. Please ensure all values match the required format.');
      window.scrollTo({ top: 120, behavior: 'smooth' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Loading />;

  const isStudent = role === 'STUDENT';
  const isEducator = role === 'EDUCATOR';
  const isAdmin = role === 'ADMIN';

  return (
    <div style={{
      maxWidth: '920px',
      margin: '2rem auto',
      padding: '0 1.5rem',
      fontFamily: "'Inter', -apple-system, sans-serif",
    }}>
      {/* Hidden File Input for Photo */}
      <input
        type="file"
        ref={photoInputRef}
        onChange={handlePhotoSelect}
        accept="image/*"
        style={{ display: 'none' }}
      />

      {/* Profile Header Card */}
      <div style={{
        background: '#ffffff',
        border: '1px solid #e2e8f0',
        borderRadius: '16px',
        padding: '1.75rem',
        marginBottom: '1.75rem',
        boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '1.25rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.35rem' }}>
          {/* Avatar with Photo or Letter and Upload Overlay */}
          <div style={{ position: 'relative' }}>
            <div style={{
              width: '74px',
              height: '74px',
              borderRadius: '50%',
              overflow: 'hidden',
              background: isEducator
                ? 'linear-gradient(135deg, #7c3aed, #6d28d9)'
                : isAdmin
                  ? 'linear-gradient(135deg, #059669, #047857)'
                  : 'linear-gradient(135deg, #2563eb, #1d4ed8)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
              fontWeight: '800',
              fontSize: '1.8rem',
              boxShadow: '0 4px 12px rgba(0,0,0,0.12)',
              border: '2px solid #ffffff'
            }}>
              {formData.profilePictureUrl ? (
                <img
                  src={formData.profilePictureUrl}
                  alt={formData.fullName || user?.username}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  onError={(e) => { e.currentTarget.style.display = 'none'; }}
                />
              ) : (
                (formData.fullName || user?.username || 'U')[0].toUpperCase()
              )}
            </div>

            <button
              type="button"
              onClick={() => photoInputRef.current?.click()}
              disabled={uploadingPhoto}
              style={{
                position: 'absolute',
                bottom: '-4px',
                right: '-4px',
                background: '#0f172a',
                color: '#ffffff',
                border: '2px solid #ffffff',
                borderRadius: '50%',
                width: '28px',
                height: '28px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '0.85rem',
                cursor: uploadingPhoto ? 'wait' : 'pointer',
                boxShadow: '0 2px 6px rgba(0,0,0,0.2)'
              }}
              title="Upload new profile photo"
            >
              {uploadingPhoto ? '⏳' : '📷'}
            </button>
          </div>

          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
              <h1 style={{ margin: 0, fontSize: '1.45rem', fontWeight: '800', color: '#0f172a' }}>
                {formData.fullName || user?.username}
              </h1>
              <span style={{
                background: isEducator ? '#f5f3ff' : isAdmin ? '#ecfdf5' : '#eff6ff',
                color: isEducator ? '#6d28d9' : isAdmin ? '#047857' : '#1d4ed8',
                border: isEducator ? '1px solid #ddd6fe' : isAdmin ? '1px solid #a7f3d0' : '1px solid #bfdbfe',
                padding: '0.2rem 0.65rem',
                borderRadius: '6px',
                fontSize: '0.74rem',
                fontWeight: '700',
                textTransform: 'uppercase'
              }}>
                {role}
              </span>
            </div>
            <div style={{ color: '#64748b', fontSize: '0.88rem', marginTop: '0.25rem' }}>
              Username: <strong style={{ color: '#334155' }}>{user?.username}</strong> · Email: <strong style={{ color: '#334155' }}>{formData.email}</strong>
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={() => photoInputRef.current?.click()}
          disabled={uploadingPhoto}
          style={{
            background: '#f8fafc',
            border: '1px solid #cbd5e1',
            borderRadius: '8px',
            padding: '0.5rem 1rem',
            fontSize: '0.84rem',
            fontWeight: '700',
            color: '#334155',
            cursor: uploadingPhoto ? 'wait' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.45rem',
            transition: 'all 0.15s ease'
          }}
        >
          <span>📷</span> {uploadingPhoto ? 'Uploading...' : formData.profilePictureUrl ? 'Change Photo' : 'Add Photo'}
        </button>
      </div>

      {/* Admin Log Privacy Notice */}
      <div style={{
        background: '#f8fafc',
        border: '1px solid #cbd5e1',
        borderRadius: '12px',
        padding: '1rem 1.25rem',
        marginBottom: '1.75rem',
        display: 'flex',
        alignItems: 'flex-start',
        gap: '0.85rem'
      }}>
        <span style={{ fontSize: '1.4rem', lineHeight: '1' }}>🔒</span>
        <div style={{ fontSize: '0.85rem', color: '#334155', lineHeight: '1.5' }}>
          <strong style={{ color: '#0f172a' }}>Verified Administrative User Log:</strong> Details are submitted only when credentials match standard criteria (Full Name, 10-digit phone number, 12-digit Aadhaar number, and @gmail.com email). These details are visible and managed exclusively by the Administrator.
        </div>
      </div>

      {/* Alerts */}
      {successMsg && (
        <div style={{
          background: '#f0fdf4',
          border: '1px solid #bbf7d0',
          color: '#166534',
          padding: '0.85rem 1.25rem',
          borderRadius: '10px',
          marginBottom: '1.5rem',
          fontSize: '0.9rem',
          fontWeight: '600'
        }}>
          ✓ {successMsg}
        </div>
      )}

      {errorMsg && (
        <div style={{
          background: '#fef2f2',
          border: '1px solid #fecaca',
          color: '#dc2626',
          padding: '0.85rem 1.25rem',
          borderRadius: '10px',
          marginBottom: '1.5rem',
          fontSize: '0.9rem',
          fontWeight: '600'
        }}>
          ⚠ {errorMsg}
        </div>
      )}

      {/* Form Card */}
      <form onSubmit={handleSubmit} noValidate style={{
        background: '#ffffff',
        border: '1px solid #e2e8f0',
        borderRadius: '16px',
        padding: '2rem',
        boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
      }}>

        {/* SECTION 1: Basic & Contact Details */}
        <div style={{ marginBottom: '2rem' }}>
          <div style={{
            fontSize: '1.1rem',
            fontWeight: '800',
            color: '#0f172a',
            borderBottom: '1px solid #f1f5f9',
            paddingBottom: '0.65rem',
            marginBottom: '1.25rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}>
            <span>👤</span> Basic & Contact Details
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.25rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: '700', color: '#334155', marginBottom: '0.4rem' }}>
                Full Name *
              </label>
              <input
                type="text"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                placeholder="Enter your full name"
                style={{
                  width: '100%',
                  padding: '0.7rem 0.9rem',
                  border: fieldErrors.fullName ? '1.5px solid #dc2626' : '1px solid #cbd5e1',
                  borderRadius: '8px',
                  fontSize: '0.9rem',
                  outline: 'none',
                  boxSizing: 'border-box',
                  background: fieldErrors.fullName ? '#fef2f2' : '#ffffff'
                }}
              />
              {fieldErrors.fullName && (
                <span style={{ fontSize: '0.74rem', color: '#dc2626', marginTop: '0.25rem', display: 'block', fontWeight: '600' }}>
                  ⚠ {fieldErrors.fullName}
                </span>
              )}
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: '700', color: '#334155', marginBottom: '0.4rem' }}>
                Email Address (must end with @gmail.com) *
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="yourname@gmail.com"
                style={{
                  width: '100%',
                  padding: '0.7rem 0.9rem',
                  border: fieldErrors.email ? '1.5px solid #dc2626' : '1px solid #cbd5e1',
                  borderRadius: '8px',
                  fontSize: '0.9rem',
                  outline: 'none',
                  boxSizing: 'border-box',
                  background: fieldErrors.email ? '#fef2f2' : '#ffffff'
                }}
              />
              {fieldErrors.email ? (
                <span style={{ fontSize: '0.74rem', color: '#dc2626', marginTop: '0.25rem', display: 'block', fontWeight: '600' }}>
                  ⚠ {fieldErrors.email}
                </span>
              ) : (
                <span style={{ fontSize: '0.74rem', color: '#64748b', marginTop: '0.25rem', display: 'block' }}>
                  Credentials check: Only @gmail.com addresses are permitted.
                </span>
              )}
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: '700', color: '#334155', marginBottom: '0.4rem' }}>
                Phone Number (10 digits) *
              </label>
              <input
                type="text"
                name="phoneNumber"
                value={formData.phoneNumber}
                onChange={handleChange}
                placeholder="10-digit mobile number (e.g. 9876543210)"
                maxLength={10}
                style={{
                  width: '100%',
                  padding: '0.7rem 0.9rem',
                  border: fieldErrors.phoneNumber ? '1.5px solid #dc2626' : '1px solid #cbd5e1',
                  borderRadius: '8px',
                  fontSize: '0.9rem',
                  outline: 'none',
                  boxSizing: 'border-box',
                  background: fieldErrors.phoneNumber ? '#fef2f2' : '#ffffff'
                }}
              />
              {fieldErrors.phoneNumber ? (
                <span style={{ fontSize: '0.74rem', color: '#dc2626', marginTop: '0.25rem', display: 'block', fontWeight: '600' }}>
                  ⚠ {fieldErrors.phoneNumber}
                </span>
              ) : (
                <span style={{ fontSize: '0.74rem', color: '#64748b', marginTop: '0.25rem', display: 'block' }}>
                  Digits only ({formData.phoneNumber.length}/10 digits entered)
                </span>
              )}
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: '700', color: '#334155', marginBottom: '0.4rem' }}>
                Date of Birth (DOB) *
              </label>
              <input
                type="date"
                name="dob"
                value={formData.dob}
                onChange={handleChange}
                style={{
                  width: '100%',
                  padding: '0.7rem 0.9rem',
                  border: '1px solid #cbd5e1',
                  borderRadius: '8px',
                  fontSize: '0.9rem',
                  outline: 'none',
                  boxSizing: 'border-box'
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: '700', color: '#334155', marginBottom: '0.4rem' }}>
                Gender
              </label>
              <select
                name="gender"
                value={formData.gender}
                onChange={handleChange}
                style={{
                  width: '100%',
                  padding: '0.7rem 0.9rem',
                  border: '1px solid #cbd5e1',
                  borderRadius: '8px',
                  fontSize: '0.9rem',
                  outline: 'none',
                  boxSizing: 'border-box',
                  background: '#ffffff'
                }}
              >
                <option value="">Select Gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
                <option value="Prefer not to say">Prefer not to say</option>
              </select>
            </div>
          </div>

          <div style={{ marginTop: '1.25rem' }}>
            <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: '700', color: '#334155', marginBottom: '0.4rem' }}>
              Residential Address
            </label>
            <textarea
              name="address"
              value={formData.address}
              onChange={handleChange}
              rows={2}
              placeholder="Door No, Street, City, State, Pincode"
              style={{
                width: '100%',
                padding: '0.7rem 0.9rem',
                border: '1px solid #cbd5e1',
                borderRadius: '8px',
                fontSize: '0.9rem',
                outline: 'none',
                boxSizing: 'border-box',
                resize: 'vertical'
              }}
            />
          </div>
        </div>

        {/* SECTION 2: Identification & KYC Details */}
        <div style={{ marginBottom: '2rem' }}>
          <div style={{
            fontSize: '1.1rem',
            fontWeight: '800',
            color: '#0f172a',
            borderBottom: '1px solid #f1f5f9',
            paddingBottom: '0.65rem',
            marginBottom: '1.25rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}>
            <span>🪪</span> Official Identification & KYC Details
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.25rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: '700', color: '#334155', marginBottom: '0.4rem' }}>
                Aadhaar Number (12 digits)
              </label>
              <input
                type="text"
                name="aadhaarNumber"
                value={formData.aadhaarNumber}
                onChange={handleChange}
                placeholder="1234-5678-9012"
                maxLength={14}
                style={{
                  width: '100%',
                  padding: '0.7rem 0.9rem',
                  border: fieldErrors.aadhaarNumber ? '1.5px solid #dc2626' : '1px solid #cbd5e1',
                  borderRadius: '8px',
                  fontSize: '0.9rem',
                  outline: 'none',
                  boxSizing: 'border-box',
                  background: fieldErrors.aadhaarNumber ? '#fef2f2' : '#ffffff'
                }}
              />
              {fieldErrors.aadhaarNumber ? (
                <span style={{ fontSize: '0.74rem', color: '#dc2626', marginTop: '0.25rem', display: 'block', fontWeight: '600' }}>
                  ⚠ {fieldErrors.aadhaarNumber}
                </span>
              ) : (
                <span style={{ fontSize: '0.74rem', color: '#64748b', marginTop: '0.25rem', display: 'block' }}>
                  Credentials check: Exactly 12 digits required. ({formData.aadhaarNumber.replace(/\D/g, '').length}/12)
                </span>
              )}
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: '700', color: '#334155', marginBottom: '0.4rem' }}>
                PAN Card Number (10 alphanumeric)
              </label>
              <input
                type="text"
                name="panNumber"
                value={formData.panNumber}
                onChange={handleChange}
                placeholder="ABCDE1234F"
                maxLength={10}
                style={{
                  width: '100%',
                  padding: '0.7rem 0.9rem',
                  border: fieldErrors.panNumber ? '1.5px solid #dc2626' : '1px solid #cbd5e1',
                  borderRadius: '8px',
                  fontSize: '0.9rem',
                  outline: 'none',
                  boxSizing: 'border-box',
                  textTransform: 'uppercase',
                  background: fieldErrors.panNumber ? '#fef2f2' : '#ffffff'
                }}
              />
              {fieldErrors.panNumber ? (
                <span style={{ fontSize: '0.74rem', color: '#dc2626', marginTop: '0.25rem', display: 'block', fontWeight: '600' }}>
                  ⚠ {fieldErrors.panNumber}
                </span>
              ) : (
                <span style={{ fontSize: '0.74rem', color: '#64748b', marginTop: '0.25rem', display: 'block' }}>
                  Format: 5 letters, 4 numbers, 1 letter
                </span>
              )}
            </div>
          </div>
        </div>

        {/* SECTION 3: Role-Specific Details */}
        <div style={{ marginBottom: '2rem' }}>
          <div style={{
            fontSize: '1.1rem',
            fontWeight: '800',
            color: '#0f172a',
            borderBottom: '1px solid #f1f5f9',
            paddingBottom: '0.65rem',
            marginBottom: '1.25rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}>
            <span>🎓</span> {isStudent ? 'Academic & Student Details' : isEducator ? 'Professional Faculty & Qualification Details' : 'Administrative Details'}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.25rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: '700', color: '#334155', marginBottom: '0.4rem' }}>
                {isEducator ? 'Highest Qualification *' : 'Current Qualification / Degree *'}
              </label>
              <input
                type="text"
                name="qualification"
                value={formData.qualification}
                onChange={handleChange}
                placeholder={isEducator ? 'e.g. Ph.D. in Computer Science / M.Tech' : 'e.g. B.Tech Computer Science / Higher Secondary'}
                style={{
                  width: '100%',
                  padding: '0.7rem 0.9rem',
                  border: fieldErrors.qualification ? '1.5px solid #dc2626' : '1px solid #cbd5e1',
                  borderRadius: '8px',
                  fontSize: '0.9rem',
                  outline: 'none',
                  boxSizing: 'border-box'
                }}
              />
              {fieldErrors.qualification && (
                <span style={{ fontSize: '0.74rem', color: '#dc2626', marginTop: '0.25rem', display: 'block', fontWeight: '600' }}>
                  ⚠ {fieldErrors.qualification}
                </span>
              )}
            </div>

            {isStudent && (
              <>
                <div>
                  <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: '700', color: '#334155', marginBottom: '0.4rem' }}>
                    College / School / University *
                  </label>
                  <input
                    type="text"
                    name="institution"
                    value={formData.institution}
                    onChange={handleChange}
                    placeholder="e.g. National Institute of Technology"
                    style={{
                      width: '100%',
                      padding: '0.7rem 0.9rem',
                      border: fieldErrors.institution ? '1.5px solid #dc2626' : '1px solid #cbd5e1',
                      borderRadius: '8px',
                      fontSize: '0.9rem',
                      outline: 'none',
                      boxSizing: 'border-box'
                    }}
                  />
                  {fieldErrors.institution && (
                    <span style={{ fontSize: '0.74rem', color: '#dc2626', marginTop: '0.25rem', display: 'block', fontWeight: '600' }}>
                      ⚠ {fieldErrors.institution}
                    </span>
                  )}
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: '700', color: '#334155', marginBottom: '0.4rem' }}>
                    Student Roll Number / Registration No
                  </label>
                  <input
                    type="text"
                    name="rollNumber"
                    value={formData.rollNumber}
                    onChange={handleChange}
                    placeholder="e.g. CS2022045"
                    style={{
                      width: '100%',
                      padding: '0.7rem 0.9rem',
                      border: '1px solid #cbd5e1',
                      borderRadius: '8px',
                      fontSize: '0.9rem',
                      outline: 'none',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: '700', color: '#334155', marginBottom: '0.4rem' }}>
                    Passing Year / Graduation Year
                  </label>
                  <input
                    type="text"
                    name="passingYear"
                    value={formData.passingYear}
                    onChange={handleChange}
                    placeholder="e.g. 2026"
                    style={{
                      width: '100%',
                      padding: '0.7rem 0.9rem',
                      border: '1px solid #cbd5e1',
                      borderRadius: '8px',
                      fontSize: '0.9rem',
                      outline: 'none',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: '700', color: '#334155', marginBottom: '0.4rem' }}>
                    Major / Stream / Specialization
                  </label>
                  <input
                    type="text"
                    name="specialization"
                    value={formData.specialization}
                    onChange={handleChange}
                    placeholder="e.g. Artificial Intelligence & Data Science"
                    style={{
                      width: '100%',
                      padding: '0.7rem 0.9rem',
                      border: '1px solid #cbd5e1',
                      borderRadius: '8px',
                      fontSize: '0.9rem',
                      outline: 'none',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>
              </>
            )}

            {(isEducator || isAdmin) && (
              <>
                <div>
                  <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: '700', color: '#334155', marginBottom: '0.4rem' }}>
                    Designation / Title *
                  </label>
                  <input
                    type="text"
                    name="designation"
                    value={formData.designation}
                    onChange={handleChange}
                    placeholder="e.g. Senior Professor / Lead Instructor"
                    style={{
                      width: '100%',
                      padding: '0.7rem 0.9rem',
                      border: fieldErrors.designation ? '1.5px solid #dc2626' : '1px solid #cbd5e1',
                      borderRadius: '8px',
                      fontSize: '0.9rem',
                      outline: 'none',
                      boxSizing: 'border-box'
                    }}
                  />
                  {fieldErrors.designation && (
                    <span style={{ fontSize: '0.74rem', color: '#dc2626', marginTop: '0.25rem', display: 'block', fontWeight: '600' }}>
                      ⚠ {fieldErrors.designation}
                    </span>
                  )}
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: '700', color: '#334155', marginBottom: '0.4rem' }}>
                    Department / Faculty
                  </label>
                  <input
                    type="text"
                    name="department"
                    value={formData.department}
                    onChange={handleChange}
                    placeholder="e.g. Department of Computer Science & Engineering"
                    style={{
                      width: '100%',
                      padding: '0.7rem 0.9rem',
                      border: '1px solid #cbd5e1',
                      borderRadius: '8px',
                      fontSize: '0.9rem',
                      outline: 'none',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: '700', color: '#334155', marginBottom: '0.4rem' }}>
                    Total Experience (Years)
                  </label>
                  <input
                    type="text"
                    name="experienceYears"
                    value={formData.experienceYears}
                    onChange={handleChange}
                    placeholder="e.g. 8 Years"
                    style={{
                      width: '100%',
                      padding: '0.7rem 0.9rem',
                      border: '1px solid #cbd5e1',
                      borderRadius: '8px',
                      fontSize: '0.9rem',
                      outline: 'none',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: '700', color: '#334155', marginBottom: '0.4rem' }}>
                    Employee / Faculty ID
                  </label>
                  <input
                    type="text"
                    name="employeeId"
                    value={formData.employeeId}
                    onChange={handleChange}
                    placeholder="e.g. FAC-2023-019"
                    style={{
                      width: '100%',
                      padding: '0.7rem 0.9rem',
                      border: '1px solid #cbd5e1',
                      borderRadius: '8px',
                      fontSize: '0.9rem',
                      outline: 'none',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>
              </>
            )}
          </div>

          {(isEducator || isAdmin) && (
            <div style={{ marginTop: '1.25rem' }}>
              <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: '700', color: '#334155', marginBottom: '0.4rem' }}>
                Biography / Professional Summary
              </label>
              <textarea
                name="bio"
                value={formData.bio}
                onChange={handleChange}
                rows={3}
                placeholder="Brief summary of teaching experience, research interests, or courses taught..."
                style={{
                  width: '100%',
                  padding: '0.7rem 0.9rem',
                  border: '1px solid #cbd5e1',
                  borderRadius: '8px',
                  fontSize: '0.9rem',
                  outline: 'none',
                  boxSizing: 'border-box',
                  resize: 'vertical'
                }}
              />
            </div>
          )}
        </div>

        {/* Submit Button */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', borderTop: '1px solid #f1f5f9', paddingTop: '1.5rem' }}>
          <button
            type="submit"
            disabled={saving}
            style={{
              background: 'linear-gradient(135deg, #2563eb, #1d4ed8)',
              color: '#ffffff',
              border: 'none',
              borderRadius: '10px',
              padding: '0.75rem 1.75rem',
              fontSize: '0.95rem',
              fontWeight: '700',
              cursor: saving ? 'wait' : 'pointer',
              boxShadow: '0 4px 12px rgba(37,99,235,0.25)',
              transition: 'all 0.15s ease',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}
          >
            {saving ? 'Validating & Saving...' : '💾 Verify & Save Details'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default Profile;
