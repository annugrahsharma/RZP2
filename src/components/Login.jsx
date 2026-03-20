import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import StatusBar from './StatusBar'
import '../styles/auth.css'

function Login() {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showAssistanceModal, setShowAssistanceModal] = useState(false)

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    // Mock login - just log the data
    console.log('Login attempt:', formData)
    // Navigate to onboarding after login
    navigate('/onboarding')
  }

  return (
    <>
      <StatusBar />
      <div className="page-content">
        <div className="auth-screen">
          {/* SuperMorpheus Full Logo */}
          <div className="auth-logo">
            <img
              src="/SM/SM_Color_Whole.png"
              alt="Super Morpheus"
              className="auth-logo-img"
            />
          </div>

          {/* Welcome Text */}
          <div className="auth-welcome">
            <h1 className="auth-title">Welcome to Gang 360</h1>
            <p className="auth-subtitle">Sign in to continue</p>
          </div>

          {/* Login Form */}
          <form className="auth-form" onSubmit={handleSubmit}>
            <div className="input-group">
              <label className="input-label" htmlFor="email">Email</label>
              <input
                type="email"
                id="email"
                name="email"
                className="input-field"
                placeholder="Enter your email"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>

            <div className="input-group">
              <label className="input-label" htmlFor="password">Password</label>
              <div className="password-wrapper">
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  name="password"
                  className="input-field"
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
                      <line x1="1" y1="1" x2="23" y2="23"/>
                    </svg>
                  ) : (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                      <circle cx="12" cy="12" r="3"/>
                    </svg>
                  )}
                </button>
              </div>
            </div>

            <div className="forgot-password">
              <a href="#">Forgot Password?</a>
            </div>

            <button type="submit" className="btn-primary">
              Continue
            </button>
          </form>

          {/* Footer with Need Assistance */}
          <div className="auth-footer">
            <button
              className="need-assistance-link"
              onClick={() => setShowAssistanceModal(true)}
            >
              Need Assistance?
            </button>
          </div>
        </div>
      </div>

      {/* Assistance Modal */}
      {showAssistanceModal && (
        <div className="modal-overlay" onClick={() => setShowAssistanceModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button
              className="modal-close"
              onClick={() => setShowAssistanceModal(false)}
              aria-label="Close modal"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="6" x2="6" y2="18"/>
                <line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>

            <h2 className="modal-title">Need Assistance?</h2>

            <p className="modal-description">
              If you need any assistance with accessing or using the platform, please reach out to us.
            </p>

            <div className="modal-contact">
              <div className="contact-item">
                <span className="contact-label">Email:</span>
                <a href="mailto:gang360@supermorpheus.com" className="contact-link">
                  gang360@supermorpheus.com
                </a>
              </div>

              <div className="contact-item">
                <span className="contact-label">Phone:</span>
                <a href="tel:+919711493162" className="contact-link">
                  +91-97114-93162
                </a>
              </div>
            </div>

            <p className="modal-note">
              We'll get back to you quickly to help you access your account.
            </p>
          </div>
        </div>
      )}
    </>
  )
}

export default Login
