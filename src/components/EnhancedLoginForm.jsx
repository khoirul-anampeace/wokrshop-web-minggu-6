import React, { useState } from 'react';
import styles from '../styles/LoginForm.module.css';

const EnhancedLoginForm = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false
  });

  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [loginAttempts, setLoginAttempts] = useState(0);
  const [isLocked, setIsLocked] = useState(false);
  const [lockoutTime, setLockoutTime] = useState(0);
  const [loginError, setLoginError] = useState('');

  const MAX_ATTEMPTS = 5;
  const LOCKOUT_DURATION = 30; // seconds

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;

    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));

    // Clear login error when user starts typing
    if (loginError) {
      setLoginError('');
    }

    // Validate field in real-time if it's been touched
    if (touched[name]) {
      const fieldError = validateField(name, type === 'checkbox' ? checked : value);
      setErrors(prev => ({
        ...prev,
        [name]: fieldError
      }));
    }
  };

  const handleBlur = (e) => {
    const { name, value, type, checked } = e.target;

    setTouched(prev => ({
      ...prev,
      [name]: true
    }));

    const fieldError = validateField(name, type === 'checkbox' ? checked : value);
    setErrors(prev => ({
      ...prev,
      [name]: fieldError
    }));
  };

  const validateField = (fieldName, value) => {
    switch (fieldName) {
      case 'email':
        if (!value.trim()) return 'Email is required';
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return 'Please enter a valid email address';
        return '';

      case 'password':
        if (!value) return 'Password is required';
        if (value.length < 6) return 'Password must be at least 6 characters';
        return '';

      default:
        return '';
    }
  };

  const validateForm = () => {
    const newErrors = {};
    let isValid = true;

    Object.keys(formData).forEach(field => {
      if (field !== 'rememberMe') {
        const error = validateField(field, formData[field]);
        if (error) {
          newErrors[field] = error;
          isValid = false;
        }
      }
    });

    setErrors(newErrors);
    return isValid;
  };

  const simulateLogin = () => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        // Simulasi: Login berhasil jika email mengandung "success"
        if (formData.email.toLowerCase().includes('success')) {
          resolve({ success: true });
        } else {
          reject({ success: false, message: 'Invalid email or password' });
        }
      }, 2000);
    });
  };

  const startLockout = () => {
    setIsLocked(true);
    setLockoutTime(LOCKOUT_DURATION);
    
    const countdown = setInterval(() => {
      setLockoutTime(prev => {
        if (prev <= 1) {
          clearInterval(countdown);
          setIsLocked(false);
          setLoginAttempts(0);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (isLocked) return;

    const allTouched = {};
    Object.keys(formData).forEach(field => {
      allTouched[field] = true;
    });
    setTouched(allTouched);

    if (validateForm()) {
      setIsLoading(true);
      setLoginError('');

      try {
        await simulateLogin();
        console.log('Login successful:', formData);
        setIsSubmitted(true);
        setLoginAttempts(0);
        
        setTimeout(() => {
          setFormData({
            email: '',
            password: '',
            rememberMe: false
          });
          setTouched({});
          setIsSubmitted(false);
        }, 3000);
      } catch (error) {
        const newAttempts = loginAttempts + 1;
        setLoginAttempts(newAttempts);
        
        if (newAttempts >= MAX_ATTEMPTS) {
          setLoginError(`Too many failed attempts. Account locked for ${LOCKOUT_DURATION} seconds.`);
          startLockout();
        } else {
          setLoginError(`${error.message}. ${MAX_ATTEMPTS - newAttempts} attempts remaining.`);
        }
      } finally {
        setIsLoading(false);
      }
    }
  };

  if (isSubmitted) {
    return (
      <div className={styles.container}>
        <div className={styles.successMessage}>
          <h3>🎉 Login Successful!</h3>
          <p>Welcome back! Redirecting to your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Welcome Back</h1>
      <p className={styles.subtitle}>Login to continue to your account</p>

      {/* Lockout Alert */}
      {isLocked && (
        <div className={styles.lockoutAlert}>
          <strong>🔒 Account Temporarily Locked</strong>
          <p>Too many failed login attempts. Try again in <strong>{lockoutTime}s</strong></p>
        </div>
      )}

      {/* Error Alert */}
      {loginError && !isLocked && (
        <div className={styles.errorAlert}>
          <strong>❌ Login Failed</strong>
          <p>{loginError}</p>
        </div>
      )}

      {/* Attempts Counter */}
      {loginAttempts > 0 && !isLocked && (
        <div className={styles.attemptsCounter}>
          ⚠️ Failed attempts: {loginAttempts}/{MAX_ATTEMPTS}
        </div>
      )}

      {/* Testing Info */}
      <div className={styles.infoAlert}>
        <strong>💡 Testing Guide:</strong>
        <ul>
          <li>Use email with "success" to login successfully</li>
          <li>Use any other email to simulate failed login</li>
          <li>After 5 failed attempts, account will be locked for 30s</li>
        </ul>
      </div>

      <form className={styles.form} onSubmit={handleSubmit}>
        {/* Email */}
        <div className={styles.formGroup}>
          <label className={styles.label}>Email Address *</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleInputChange}
            onBlur={handleBlur}
            className={`${styles.input} ${errors.email ? styles.error : ''}`}
            placeholder="your.email@example.com"
            autoComplete="email"
            disabled={isLoading || isLocked}
          />
          {errors.email && <span className={styles.validationError}>{errors.email}</span>}
          
          {formData.email && !errors.email && touched.email && (
            <div className={styles.validationSuccess}>✓ Valid email format</div>
          )}
        </div>

        {/* Password */}
        <div className={styles.formGroup}>
          <label className={styles.label}>Password *</label>
          <div className={styles.passwordWrapper}>
            <input
              type={showPassword ? 'text' : 'password'}
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              onBlur={handleBlur}
              className={`${styles.input} ${errors.password ? styles.error : ''}`}
              placeholder="Enter your password"
              autoComplete="current-password"
              disabled={isLoading || isLocked}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              disabled={isLoading || isLocked}
              className={styles.passwordToggle}
            >
              {showPassword ? '👁️' : '👁️‍🗨️'}
            </button>
          </div>
          {errors.password && <span className={styles.validationError}>{errors.password}</span>}
          
          {formData.password && !errors.password && touched.password && (
            <div className={styles.validationSuccess}>✓ Password entered</div>
          )}
        </div>

        {/* Remember Me & Forgot Password */}
        <div className={styles.rememberForgotRow}>
          <label className={styles.checkboxGroup}>
            <input
              type="checkbox"
              name="rememberMe"
              checked={formData.rememberMe}
              onChange={handleInputChange}
              className={styles.checkbox}
              disabled={isLoading || isLocked}
            />
            <span className={styles.checkboxLabel}>Remember me</span>
          </label>

          <a 
            href="#" 
            className={`${styles.forgotLink} ${isLoading || isLocked ? styles.disabled : ''}`}
          >
            Forgot Password?
          </a>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          className={styles.submitButton}
          disabled={isLoading || isLocked}
        >
          {isLoading ? (
            <>
              <div className={styles.spinner} />
              Logging in...
            </>
          ) : (
            'Login'
          )}
        </button>

        {/* Register Link */}
        <div className={`${styles.registerLink} ${isLoading || isLocked ? styles.disabled : ''}`}>
          Don't have an account?{' '}
          <a href="#">Register here</a>
        </div>
      </form>
    </div>
  );
};

export default EnhancedLoginForm;