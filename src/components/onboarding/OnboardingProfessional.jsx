import { useState } from 'react'
import { useOnboarding } from '../../context/OnboardingContext'
import OnboardingLayout from './OnboardingLayout'

function OnboardingProfessional() {
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

    if (!profileData.currentOrganization?.trim()) {
      newErrors.currentOrganization = 'Organization is required'
    }
    if (!profileData.currentRole?.trim()) {
      newErrors.currentRole = 'Role is required'
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
          <h1 className="form-title">What do you do?</h1>
          <p className="form-subtitle">Tell us about your professional life</p>
        </div>

        <div className="input-group">
          <label className="input-label" htmlFor="currentOrganization">Current Organization *</label>
          <input
            type="text"
            id="currentOrganization"
            name="currentOrganization"
            className={`input-field ${errors.currentOrganization ? 'input-error' : ''}`}
            placeholder="Company or organization name"
            value={profileData.currentOrganization}
            onChange={handleChange}
          />
          {errors.currentOrganization && <span className="error-text">{errors.currentOrganization}</span>}
        </div>

        <div className="input-group">
          <label className="input-label" htmlFor="currentRole">Current Role *</label>
          <input
            type="text"
            id="currentRole"
            name="currentRole"
            className={`input-field ${errors.currentRole ? 'input-error' : ''}`}
            placeholder="e.g., Founder & CEO"
            value={profileData.currentRole}
            onChange={handleChange}
          />
          {errors.currentRole && <span className="error-text">{errors.currentRole}</span>}
        </div>

        {/* Continue Button */}
        <button className="btn-primary" onClick={validateAndNext}>
          Continue
        </button>
      </div>
    </OnboardingLayout>
  )
}

export default OnboardingProfessional
