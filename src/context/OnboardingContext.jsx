import { createContext, useContext, useState } from 'react'

const OnboardingContext = createContext()

const initialProfileData = {
  // Basic Info
  profilePicture: null,
  profilePicturePreview: null,
  firstName: '',
  middleName: '',
  lastName: '',
  currentOrganization: '',
  currentRole: '',
  inspiringQuote: '',

  // About Section
  introduction: '',
  livesIn: '',
  city: '',
  pincode: '',
  locality: '',
  joyOutsideWork: '',

  // Coordinates/Social
  email: '',
  mobile: '',
  twitter: '',
  instagram: '',
  linkedin: '',
  contentLinks: [],
  otherSocialLinks: [],

  // Life Stories
  lifeStories: {
    earlyLife: {
      inputMethod: null, // 'video', 'audio', 'text'
      videoBlob: null,
      videoUrl: null,
      audioBlob: null,
      audioUrl: null,
      text: '',
      // Extracted/editable content
      interests: [],
      bornIn: '',
      hometown: '',
      schools: [], // { name, location }
      universities: [], // { name, location, major }
      summary: ''
    },
    professional: {
      inputMethod: null,
      videoBlob: null,
      videoUrl: null,
      audioBlob: null,
      audioUrl: null,
      text: '',
      // Extracted/editable content
      skills: [],
      firstJob: null, // { company, titles: [] }
      subsequentJobs: [], // { company, titles: [] }
      summary: ''
    },
    current: {
      inputMethod: null,
      videoBlob: null,
      videoUrl: null,
      audioBlob: null,
      audioUrl: null,
      text: '',
      // Extracted/editable content
      interests: [],
      rolesOrganizations: [], // { organization, role }
      travelCities: [],
      summary: ''
    }
  }
}

// Life story prompts data
export const lifeStoryPrompts = {
  earlyLife: {
    title: 'Your Early Life',
    subtitle: 'Tell gang members the story of your early life',
    icon: '🌱',
    prompts: [
      'Places where you were born and grew up',
      'Various cities you lived in and experienced',
      'Family and parents',
      'Who were your friends — what did you do together?',
      'What were the things that interested you?',
      'Educational institutes you attended — schools, colleges, universities. Give some idea of timelines.',
      'Anything else that feels natural'
    ]
  },
  professional: {
    title: 'Your Professional Life',
    subtitle: 'Share your professional journey and career experiences',
    icon: '💼',
    introText: 'Try to follow a chronological order with a sense of timelines:',
    prompts: [
      'No. of years in your professional journey',
      'Various jobs including titles / roles as intern, employee, founder, owner, freelancer',
      'Organisations you have worked with — role, work, duration, cities / countries',
      'From each role — share specific learnings, experiences, or incidents that stand out',
      'Cover all career except what you are doing right now'
    ]
  },
  current: {
    title: 'Your Current Life',
    subtitle: 'Tell us about your life and work right now',
    icon: '✨',
    sections: [
      {
        title: 'Personal',
        prompts: ['Location / base, family, friends, areas of interest']
      },
      {
        title: 'Professional',
        prompts: [
          'Name of your current organisation and your work profile',
          'How and when did you start this journey / role?',
          'What work does the organisation do — problems solved via products, solutions, services',
          'Current state — progress in terms of products, customers, revenues, team size',
          'Anything interesting about your organisation / startup, team etc.'
        ]
      }
    ]
  }
}

export function OnboardingProvider({ children }) {
  const [profileData, setProfileData] = useState(initialProfileData)
  const [currentStep, setCurrentStep] = useState(0)

  // Life stories flow state
  const [selectedLifeStory, setSelectedLifeStory] = useState(null) // 'earlyLife', 'professional', 'current'
  const [lifeStorySubStep, setLifeStorySubStep] = useState('selection') // 'selection', 'prompts', 'inputMethod', 'input', 'confirm'

  const totalSteps = 11 // Welcome, Name, Work, Quote, Joy, Intro, Location, Social, Content, LifeStories, Complete

  const updateProfileData = (updates) => {
    setProfileData(prev => ({ ...prev, ...updates }))
  }

  const updateLifeStory = (storyKey, updates) => {
    setProfileData(prev => ({
      ...prev,
      lifeStories: {
        ...prev.lifeStories,
        [storyKey]: {
          ...prev.lifeStories[storyKey],
          ...updates
        }
      }
    }))
  }

  const nextStep = () => {
    if (currentStep < totalSteps - 1) {
      setCurrentStep(prev => prev + 1)
    }
  }

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1)
    }
  }

  const goToStep = (step) => {
    if (step >= 0 && step < totalSteps) {
      setCurrentStep(step)
    }
  }

  // Life stories navigation
  const selectLifeStory = (storyKey) => {
    setSelectedLifeStory(storyKey)
    setLifeStorySubStep('prompts')
  }

  const goToInputMethodSelection = () => {
    setLifeStorySubStep('inputMethod')
  }

  const selectInputMethod = (method) => {
    updateLifeStory(selectedLifeStory, { inputMethod: method })
    // For text, skip input and go directly to confirm
    if (method === 'text') {
      setLifeStorySubStep('confirm')
    } else {
      setLifeStorySubStep('input')
    }
  }

  const goToConfirmation = () => {
    setLifeStorySubStep('confirm')
  }

  const backToLifeStorySelection = () => {
    setSelectedLifeStory(null)
    setLifeStorySubStep('selection')
  }

  const backToPrompts = () => {
    setLifeStorySubStep('prompts')
  }

  const backToInputMethod = () => {
    setLifeStorySubStep('inputMethod')
  }

  const backToInput = () => {
    const story = profileData.lifeStories[selectedLifeStory]
    // For text, go back to input method since there's no separate input step
    if (story.inputMethod === 'text') {
      setLifeStorySubStep('inputMethod')
    } else {
      setLifeStorySubStep('input')
    }
  }

  const completeLifeStory = () => {
    setSelectedLifeStory(null)
    setLifeStorySubStep('selection')
  }

  const isLifeStoryComplete = (storyKey) => {
    const story = profileData.lifeStories[storyKey]
    // Check if confirmation data exists (summary is filled)
    return story.summary && story.summary.trim().length > 0
  }

  const getCompletionPercentage = () => {
    const fields = [
      profileData.firstName,
      profileData.lastName,
      profileData.currentOrganization,
      profileData.currentRole,
      profileData.inspiringQuote,
      profileData.joyOutsideWork,
      profileData.introduction,
      profileData.locality,
      profileData.city,
      profileData.pincode
    ]

    const filledFields = fields.filter(field => field && field.trim() !== '').length
    return Math.round((filledFields / fields.length) * 100)
  }

  const value = {
    profileData,
    updateProfileData,
    updateLifeStory,
    currentStep,
    setCurrentStep,
    totalSteps,
    nextStep,
    prevStep,
    goToStep,
    getCompletionPercentage,
    // Life stories
    selectedLifeStory,
    lifeStorySubStep,
    selectLifeStory,
    goToInputMethodSelection,
    selectInputMethod,
    goToConfirmation,
    backToLifeStorySelection,
    backToPrompts,
    backToInputMethod,
    backToInput,
    completeLifeStory,
    isLifeStoryComplete
  }

  return (
    <OnboardingContext.Provider value={value}>
      {children}
    </OnboardingContext.Provider>
  )
}

export function useOnboarding() {
  const context = useContext(OnboardingContext)
  if (!context) {
    throw new Error('useOnboarding must be used within an OnboardingProvider')
  }
  return context
}
