import { useState } from 'react'
import { useOnboarding } from '../../context/OnboardingContext'
import OnboardingLayout from './OnboardingLayout'

function OnboardingAbout() {
  const { profileData, updateProfileData, nextStep } = useOnboarding()
  const [errors, setErrors] = useState({})

  const MAX_INTRO_WORDS = 100

  const countWords = (text) => {
    return text.trim().split(/\s+/).filter(word => word.length > 0).length
  }

  const handleChange = (e) => {
    const { name, value } = e.target

    // Word limit for introduction
    if (name === 'introduction') {
      const wordCount = countWords(value)
      if (wordCount > MAX_INTRO_WORDS) {
        return // Don't update if over limit
      }
    }

    updateProfileData({ [name]: value })

    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }))
    }
  }

  const validateAndNext = () => {
    const newErrors = {}

    if (!profileData.introduction?.trim()) {
      newErrors.introduction = 'Introduction is required'
    }
    if (!profileData.livesIn?.trim()) {
      newErrors.livesIn = 'Location is required'
    }
    if (!profileData.pincode?.trim()) {
      newErrors.pincode = 'Pincode is required'
    } else if (!/^\d+$/.test(profileData.pincode)) {
      newErrors.pincode = 'Pincode must be numeric'
    }
    if (!profileData.joyOutsideWork?.trim()) {
      newErrors.joyOutsideWork = 'This field is required'
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    nextStep()
  }

  const introWordCount = countWords(profileData.introduction || '')

  return (
    <OnboardingLayout>
      <div className="onboarding-form">
        <div className="form-header">
          <h1 className="form-title">About You</h1>
          <p className="form-subtitle">Help others get to know you better</p>
        </div>

        {/* Introduction */}
        <div className="input-group">
          <div className="label-with-counter">
            <label className="input-label" htmlFor="introduction">Introduction *</label>
            <span className={`word-counter ${introWordCount >= MAX_INTRO_WORDS ? 'limit-reached' : ''}`}>
              {introWordCount}/{MAX_INTRO_WORDS} words
            </span>
          </div>
          <textarea
            id="introduction"
            name="introduction"
            className={`input-field textarea-field ${errors.introduction ? 'input-error' : ''}`}
            placeholder="Write a brief introduction about yourself in 4-5 sentences. What drives you? What's your story?"
            value={profileData.introduction}
            onChange={handleChange}
            rows={5}
          />
          {errors.introduction && <span className="error-text">{errors.introduction}</span>}
        </div>

        {/* Location Fields */}
        <div className="input-group">
          <label className="input-label" htmlFor="livesIn">Lives In *</label>
          <input
            type="text"
            id="livesIn"
            name="livesIn"
            className={`input-field ${errors.livesIn ? 'input-error' : ''}`}
            placeholder="e.g., Bengaluru, India"
            value={profileData.livesIn}
            onChange={handleChange}
          />
          {errors.livesIn && <span className="error-text">{errors.livesIn}</span>}
        </div>

        <div className="form-row">
          <div className="input-group">
            <label className="input-label" htmlFor="pincode">Pincode *</label>
            <input
              type="text"
              id="pincode"
              name="pincode"
              className={`input-field ${errors.pincode ? 'input-error' : ''}`}
              placeholder="e.g., 560001"
              value={profileData.pincode}
              onChange={handleChange}
            />
            {errors.pincode && <span className="error-text">{errors.pincode}</span>}
          </div>

          <div className="input-group">
            <label className="input-label" htmlFor="locality">Locality / Area</label>
            <input
              type="text"
              id="locality"
              name="locality"
              className="input-field"
              placeholder="e.g., Whitefield"
              value={profileData.locality}
              onChange={handleChange}
            />
          </div>
        </div>

        {/* Joy Outside Work */}
        <div className="input-group">
          <label className="input-label" htmlFor="joyOutsideWork">
            What fills you with joy, outside your work? *
          </label>
          <textarea
            id="joyOutsideWork"
            name="joyOutsideWork"
            className={`input-field textarea-field ${errors.joyOutsideWork ? 'input-error' : ''}`}
            placeholder="Keep it short - hobbies, interests, passions that energize you"
            value={profileData.joyOutsideWork}
            onChange={handleChange}
            rows={2}
          />
          <span className="input-hint">Keep short, max 2 lines</span>
          {errors.joyOutsideWork && <span className="error-text">{errors.joyOutsideWork}</span>}
        </div>

        {/* Continue Button */}
        <button className="btn-primary" onClick={validateAndNext}>
          Continue
        </button>
      </div>
    </OnboardingLayout>
  )
}

export default OnboardingAbout
