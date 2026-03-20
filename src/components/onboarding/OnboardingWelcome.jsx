import { useOnboarding } from '../../context/OnboardingContext'
import OnboardingLayout from './OnboardingLayout'

function OnboardingWelcome() {
  const { nextStep } = useOnboarding()

  return (
    <OnboardingLayout showProgress={false} showBack={false}>
      <div className="welcome-screen">
        {/* SuperMorpheus Full Logo */}
        <div className="welcome-logo">
          <img
            src="/SM/SM_Color_Whole.png"
            alt="Super Morpheus"
            className="welcome-logo-img"
          />
        </div>

        {/* Welcome Content */}
        <div className="welcome-content">
          <h1 className="welcome-title">Welcome to Gang 360</h1>
          <p className="welcome-subtitle">
            Join our community built on Truth, Progress, Generosity, Perseverance, Sincerity, Courage, and Aspiration.
          </p>
        </div>

        {/* Features List */}
        <div className="welcome-features">
          <div className="welcome-feature">
            <div className="feature-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                <circle cx="12" cy="7" r="4"/>
              </svg>
            </div>
            <div className="feature-text">
              <h3>Create Your Profile</h3>
              <p>Share your journey, experiences, and aspirations</p>
            </div>
          </div>

          <div className="welcome-feature">
            <div className="feature-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                <circle cx="9" cy="7" r="4"/>
                <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
              </svg>
            </div>
            <div className="feature-text">
              <h3>Connect with Members</h3>
              <p>Discover and network with like-minded professionals</p>
            </div>
          </div>

          <div className="welcome-feature">
            <div className="feature-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                <line x1="16" y1="2" x2="16" y2="6"/>
                <line x1="8" y1="2" x2="8" y2="6"/>
                <line x1="3" y1="10" x2="21" y2="10"/>
              </svg>
            </div>
            <div className="feature-text">
              <h3>Join Events</h3>
              <p>Participate in exclusive community gatherings</p>
            </div>
          </div>
        </div>

        {/* CTA Button */}
        <button className="btn-primary welcome-cta" onClick={nextStep}>
          Let's Get Started
        </button>

        <p className="welcome-time-note">
          This will take about 5 minutes
        </p>
      </div>
    </OnboardingLayout>
  )
}

export default OnboardingWelcome
