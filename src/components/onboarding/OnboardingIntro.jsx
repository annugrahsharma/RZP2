import { useState } from 'react'
import { useOnboarding } from '../../context/OnboardingContext'
import OnboardingLayout from './OnboardingLayout'

function OnboardingIntro() {
  const { profileData, updateProfileData, nextStep } = useOnboarding()
  const [errors, setErrors] = useState({})

  const MAX_WORDS = 100

  const countWords = (text) => {
    return text.trim().split(/\s+/).filter(word => word.length > 0).length
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    const wordCount = countWords(value)

    if (wordCount > MAX_WORDS) {
      return
    }

    updateProfileData({ [name]: value })

    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }))
    }
  }

  const validateAndNext = () => {
    const newErrors = {}

    if (!profileData.introduction?.trim()) {
      newErrors.introduction = 'Please write a short introduction'
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    nextStep()
  }

  const wordCount = countWords(profileData.introduction || '')

  return (
    <OnboardingLayout>
      <div className="onboarding-form">
        <div className="form-header">
          <h1 className="form-title">A short intro about you</h1>
        </div>

        <div className="input-group">
          <label className="input-label" htmlFor="introduction">Introduction *</label>
          <div className={`input-field-with-icon textarea-field ${errors.introduction ? 'input-error' : ''}`}>
            <span className="input-icon intro-icon">📝</span>
            <textarea
              id="introduction"
              name="introduction"
              className="input-naked"
              placeholder="Your introduction in 4-5 sentences or 100 words."
              value={profileData.introduction}
              onChange={handleChange}
              rows={5}
            />
          </div>
          <div className="word-counter-row">
            <span className={`word-counter ${wordCount >= MAX_WORDS ? 'limit-reached' : ''}`}>
              {wordCount} / {MAX_WORDS} words
            </span>
          </div>
          {errors.introduction && <span className="error-text">{errors.introduction}</span>}
        </div>

        <button className="btn-primary" onClick={validateAndNext}>
          Continue
        </button>
      </div>
    </OnboardingLayout>
  )
}

export default OnboardingIntro
