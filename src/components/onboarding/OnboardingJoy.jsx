import { useState } from 'react'
import { useOnboarding } from '../../context/OnboardingContext'
import OnboardingLayout from './OnboardingLayout'

function OnboardingJoy() {
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

    if (!profileData.joyOutsideWork?.trim()) {
      newErrors.joyOutsideWork = 'Please share what brings you joy'
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
          <h1 className="form-title">What fills you with joy, outside your work?</h1>
        </div>

        <div className="input-group">
          <div className={`input-field-with-icon textarea-field ${errors.joyOutsideWork ? 'input-error' : ''}`}>
            <span className="input-icon joy-icon">☺</span>
            <textarea
              id="joyOutsideWork"
              name="joyOutsideWork"
              className="input-naked"
              placeholder="Keep this short and concise not more than 2 lines."
              value={profileData.joyOutsideWork}
              onChange={handleChange}
              rows={5}
            />
          </div>
          {errors.joyOutsideWork && <span className="error-text">{errors.joyOutsideWork}</span>}
        </div>

        <button className="btn-primary" onClick={validateAndNext}>
          Continue
        </button>
      </div>
    </OnboardingLayout>
  )
}

export default OnboardingJoy
