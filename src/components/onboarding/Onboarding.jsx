import { useOnboarding } from '../../context/OnboardingContext'
import OnboardingWelcome from './OnboardingWelcome'
import OnboardingBasicInfo from './OnboardingBasicInfo'
import OnboardingProfessional from './OnboardingProfessional'
import OnboardingQuote from './OnboardingQuote'
import OnboardingJoy from './OnboardingJoy'
import OnboardingIntro from './OnboardingIntro'
import OnboardingLocation from './OnboardingLocation'
import OnboardingSocial from './OnboardingSocial'
import OnboardingContent from './OnboardingContent'
import LifeStoriesHub from './LifeStoriesHub'
import OnboardingComplete from './OnboardingComplete'

function Onboarding() {
  const { currentStep } = useOnboarding()

  const steps = [
    <OnboardingWelcome key="welcome" />,
    <OnboardingBasicInfo key="basic-info" />,
    <OnboardingProfessional key="professional" />,
    <OnboardingQuote key="quote" />,
    <OnboardingJoy key="joy" />,
    <OnboardingIntro key="intro" />,
    <OnboardingLocation key="location" />,
    <OnboardingSocial key="social" />,
    <OnboardingContent key="content" />,
    <LifeStoriesHub key="life-stories" />,
    <OnboardingComplete key="complete" />
  ]

  return steps[currentStep] || steps[0]
}

export default Onboarding
