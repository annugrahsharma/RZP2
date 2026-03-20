import { useState } from 'react'
import { useOnboarding } from '../../context/OnboardingContext'
import OnboardingLayout from './OnboardingLayout'

function OnboardingBasicInfo() {
  const { profileData, updateProfileData, nextStep } = useOnboarding()
  const [errors, setErrors] = useState({})

  const handleChange = (e) => {
    const { name, value } = e.target
    updateProfileData({ [name]: value })

    // Clear error when user types
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }))
    }
  }

  const validateAndNext = () => {
    const newErrors = {}

    if (!profileData.firstName?.trim()) {
      newErrors.firstName = 'First name is required'
    }
    if (!profileData.lastName?.trim()) {
      newErrors.lastName = 'Last name is required'
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    nextStep()
  }

  return (
    <OnboardingLayout>
      <div className="onboarding-form">
        <div className="form-header">
          <h1 className="form-title">What's your name?</h1>
          <p className="form-subtitle">Let's start with the basics</p>
        </div>

        {/* Name Fields */}
        <div className="input-group">
          <label className="input-label" htmlFor="firstName">First Name *</label>
          <input
            type="text"
            id="firstName"
            name="firstName"
            className={`input-field ${errors.firstName ? 'input-error' : ''}`}
            placeholder="e.g., John"
            value={profileData.firstName}
            onChange={handleChange}
          />
          {errors.firstName && <span className="error-text">{errors.firstName}</span>}
        </div>

        <div className="input-group">
          <label className="input-label" htmlFor="lastName">Last Name *</label>
          <input
            type="text"
            id="lastName"
            name="lastName"
            className={`input-field ${errors.lastName ? 'input-error' : ''}`}
            placeholder="e.g., Kennedy"
            value={profileData.lastName}
            onChange={handleChange}
          />
          {errors.lastName && <span className="error-text">{errors.lastName}</span>}
        </div>

        {/* Continue Button */}
        <button className="btn-primary" onClick={validateAndNext}>
          Continue
        </button>
      </div>
    </OnboardingLayout>
  )
}

export default OnboardingBasicInfo
