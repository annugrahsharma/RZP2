import { useNavigate } from 'react-router-dom'
import { useOnboarding } from '../../context/OnboardingContext'
import OnboardingLayout from './OnboardingLayout'

function OnboardingComplete() {
  const navigate = useNavigate()
  const { profileData, getCompletionPercentage } = useOnboarding()

  const completionPercentage = getCompletionPercentage()

  const handleGoToDashboard = () => {
    // In real app, would save profile data first
    console.log('Profile data:', profileData)
    navigate('/dashboard')
  }

  const handleAddVideos = () => {
    navigate('/profile/videos')
  }

  return (
    <OnboardingLayout showProgress={false} showBack={false}>
      <div className="complete-screen">
        {/* Success Icon */}
        <div className="complete-icon">
          <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
            <polyline points="22 4 12 14.01 9 11.01"/>
          </svg>
        </div>

        {/* Congratulations Message */}
        <div className="complete-content">
          <h1 className="complete-title">You're All Set!</h1>
          <p className="complete-subtitle">
            Your profile is ready. Welcome to the Super Morpheus community!
          </p>
        </div>

        {/* Profile Summary Card */}
        <div className="profile-summary-card">
          <div className="summary-header">
            <div className="summary-avatar">
              {profileData.profilePicturePreview ? (
                <img src={profileData.profilePicturePreview} alt="Profile" />
              ) : (
                <div className="summary-avatar-placeholder">
                  {profileData.firstName?.charAt(0) || 'U'}
                  {profileData.lastName?.charAt(0) || ''}
                </div>
              )}
            </div>
            <div className="summary-info">
              <h3 className="summary-name">
                {profileData.firstName} {profileData.lastName}
              </h3>
              <p className="summary-role">
                {profileData.currentRole} at {profileData.currentOrganization}
              </p>
              <p className="summary-location">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                  <circle cx="12" cy="10" r="3"/>
                </svg>
                {profileData.livesIn || 'Location not set'}
              </p>
            </div>
          </div>

          {/* Completion Progress */}
          <div className="summary-progress">
            <div className="progress-label">
              <span>Profile Completion</span>
              <span className="progress-value">{completionPercentage}%</span>
            </div>
            <div className="progress-bar-container">
              <div
                className="progress-bar-fill"
                style={{ width: `${completionPercentage}%` }}
              />
            </div>
          </div>

          {/* Status Badge */}
          <div className="summary-status">
            <span className={`status-badge ${completionPercentage === 100 ? 'status-active' : 'status-basic'}`}>
              {completionPercentage === 100 ? 'Active' : 'Basic'}
            </span>
            <span className="status-hint">
              {completionPercentage < 100
                ? 'Complete your profile to unlock full features'
                : 'Your profile is fully complete'}
            </span>
          </div>
        </div>

        {/* Next Steps */}
        <div className="next-steps">
          <h4 className="next-steps-title">What's Next?</h4>

          <div className="next-step-item">
            <div className="step-icon video-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polygon points="23 7 16 12 23 17 23 7"/>
                <rect x="1" y="5" width="15" height="14" rx="2" ry="2"/>
              </svg>
            </div>
            <div className="step-content">
              <h5>Add Your Story Videos</h5>
              <p>Share your Early Life, Professional Journey, and Current Life through video</p>
            </div>
            <span className="step-badge">Become Super</span>
          </div>

          <div className="next-step-item">
            <div className="step-icon members-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                <circle cx="9" cy="7" r="4"/>
                <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
              </svg>
            </div>
            <div className="step-content">
              <h5>Browse Members</h5>
              <p>Discover and connect with other community members</p>
            </div>
          </div>

          <div className="next-step-item">
            <div className="step-icon event-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                <line x1="16" y1="2" x2="16" y2="6"/>
                <line x1="8" y1="2" x2="8" y2="6"/>
                <line x1="3" y1="10" x2="21" y2="10"/>
              </svg>
            </div>
            <div className="step-content">
              <h5>Join Gurukul 2025</h5>
              <p>Connect with attendees of our flagship community event</p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="complete-actions">
          <button className="btn-primary" onClick={handleGoToDashboard}>
            Go to Dashboard
          </button>

          <button className="btn-secondary" onClick={handleAddVideos}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polygon points="23 7 16 12 23 17 23 7"/>
              <rect x="1" y="5" width="15" height="14" rx="2" ry="2"/>
            </svg>
            Add Story Videos
          </button>
        </div>
      </div>
    </OnboardingLayout>
  )
}

export default OnboardingComplete
