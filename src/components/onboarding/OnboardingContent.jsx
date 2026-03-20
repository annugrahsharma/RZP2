import { useState } from 'react'
import { useOnboarding } from '../../context/OnboardingContext'
import OnboardingLayout from './OnboardingLayout'

function OnboardingContent() {
  const { profileData, updateProfileData, nextStep } = useOnboarding()
  const [links, setLinks] = useState(profileData.contentLinks || [{ url: '', description: '' }])

  const updateLinks = (newLinks) => {
    setLinks(newLinks)
    updateProfileData({ contentLinks: newLinks })
  }

  const handleLinkChange = (index, field, value) => {
    const newLinks = [...links]
    newLinks[index] = { ...newLinks[index], [field]: value }
    updateLinks(newLinks)
  }

  const addLink = () => {
    updateLinks([...links, { url: '', description: '' }])
  }

  const removeLink = (index) => {
    if (links.length === 1) {
      updateLinks([{ url: '', description: '' }])
    } else {
      const newLinks = links.filter((_, i) => i !== index)
      updateLinks(newLinks)
    }
  }

  const validateAndNext = () => {
    // Content links are optional, just move forward
    // Filter out empty links before saving
    const validLinks = links.filter(link => link.url.trim() !== '')
    updateProfileData({ contentLinks: validLinks })
    nextStep()
  }

  return (
    <OnboardingLayout>
      <div className="onboarding-form">
        <div className="form-header">
          <h1 className="form-title">Content Links</h1>
          <p className="form-subtitle">Few links of the content you have written/created and would like to share Blogs, videos, podcasts, etc.</p>
        </div>

        <div className="content-links-list">
          {links.map((link, index) => (
            <div key={index} className="content-link-item">
              <div className="content-link-fields">
                <div className="input-group">
                  <label className="input-label">Link</label>
                  <div className="input-with-icon-row">
                    <div className="input-with-icon-inline">
                      <svg className="field-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/>
                        <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>
                      </svg>
                      <input
                        type="url"
                        className="input-field input-field-icon"
                        placeholder="e.g., https://blog.com/post"
                        value={link.url}
                        onChange={(e) => handleLinkChange(index, 'url', e.target.value)}
                      />
                    </div>
                    <button
                      type="button"
                      className="delete-link-btn"
                      onClick={() => removeLink(index)}
                    >
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                      </svg>
                    </button>
                  </div>
                </div>

                <div className="input-group">
                  <label className="input-label">Description</label>
                  <div className="input-with-icon-inline">
                    <svg className="field-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="12" cy="12" r="10"/>
                      <line x1="12" y1="16" x2="12" y2="12"/>
                      <line x1="12" y1="8" x2="12.01" y2="8"/>
                    </svg>
                    <input
                      type="text"
                      className="input-field input-field-icon"
                      placeholder="e.g., A short description of the link"
                      value={link.description}
                      onChange={(e) => handleLinkChange(index, 'description', e.target.value)}
                    />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <button type="button" className="add-content-link-btn" onClick={addLink}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="12" y1="5" x2="12" y2="19"/>
            <line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
          Add Content Link
        </button>

        <button className="btn-primary" onClick={validateAndNext}>
          Continue
        </button>

        <p className="skip-note">This is optional. You can add content links later.</p>
      </div>
    </OnboardingLayout>
  )
}

export default OnboardingContent
