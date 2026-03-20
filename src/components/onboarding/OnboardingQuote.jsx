import { useState } from 'react'
import { useOnboarding } from '../../context/OnboardingContext'
import OnboardingLayout from './OnboardingLayout'

function OnboardingQuote() {
  const { profileData, updateProfileData, nextStep } = useOnboarding()
  const [errors, setErrors] = useState({})

  const handleChange = (e) => {
    const { name, value } = e.target
    updateProfileData({ [name]: value })

    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }))
    }
  }

  const validateAndNext = () => {
    const newErrors = {}

    if (!profileData.inspiringQuote?.trim()) {
      newErrors.inspiringQuote = 'Please share a quote that inspires you'
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
          <h1 className="form-title">A quote that inspires me</h1>
        </div>

        <div className="input-group">
          <div className={`input-field-with-icon textarea-field ${errors.inspiringQuote ? 'input-error' : ''}`}>
            <span className="input-icon quote-icon">"</span>
            <textarea
              id="inspiringQuote"
              name="inspiringQuote"
              className="input-naked"
              placeholder="This quote will be displayed as a part of your profile. Please provide the full quote along with the source."
              value={profileData.inspiringQuote}
              onChange={handleChange}
              rows={5}
            />
          </div>
          {errors.inspiringQuote && <span className="error-text">{errors.inspiringQuote}</span>}
        </div>

        <button className="btn-primary" onClick={validateAndNext}>
          Continue
        </button>
      </div>
    </OnboardingLayout>
  )
}

export default OnboardingQuote
