import { useOnboarding, lifeStoryPrompts } from '../../context/OnboardingContext'

function LifeStorySelection() {
  const { selectLifeStory, isLifeStoryComplete, nextStep, profileData } = useOnboarding()

  const stories = [
    { key: 'earlyLife', ...lifeStoryPrompts.earlyLife },
    { key: 'professional', ...lifeStoryPrompts.professional },
    { key: 'current', ...lifeStoryPrompts.current }
  ]

  // Get the input method label for completed stories
  const getInputMethodLabel = (storyKey) => {
    const story = profileData.lifeStories[storyKey]
    if (!story.inputMethod) return null
    const labels = { video: 'Video', audio: 'Audio', text: 'Text' }
    return labels[story.inputMethod]
  }

  const allComplete = stories.every(s => isLifeStoryComplete(s.key))
  const someComplete = stories.some(s => isLifeStoryComplete(s.key))

  return (
    <div className="onboarding-form">
      <div className="form-header">
        <h1 className="form-title">Share Your Life Story</h1>
        <p className="form-subtitle">
          Help gang members know you better by sharing your journey across three chapters of life.
        </p>
      </div>

      <div className="life-story-cards">
        {stories.map((story) => {
          const isComplete = isLifeStoryComplete(story.key)
          const inputMethod = getInputMethodLabel(story.key)

          return (
            <button
              key={story.key}
              className={`life-story-card ${isComplete ? 'completed' : ''}`}
              onClick={() => selectLifeStory(story.key)}
            >
              <div className="story-card-icon">{story.icon}</div>
              <div className="story-card-content">
                <h3 className="story-card-title">{story.title}</h3>
                <p className="story-card-subtitle">{story.subtitle}</p>
                {isComplete && inputMethod && (
                  <span className="story-card-badge">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M20 6L9 17l-5-5"/>
                    </svg>
                    {inputMethod} added
                  </span>
                )}
              </div>
              <div className="story-card-arrow">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M9 18l6-6-6-6"/>
                </svg>
              </div>
            </button>
          )
        })}
      </div>

      <button className="btn-primary" onClick={nextStep}>
        {allComplete ? 'Continue' : someComplete ? 'Continue (you can add more later)' : 'Skip for now'}
      </button>

      <p className="skip-note">
        You can add or update your life stories anytime from your profile.
      </p>
    </div>
  )
}

export default LifeStorySelection
