// Mock data for Gang 360 app

export const currentUser = {
  id: 'user-001',
  firstName: 'Anu',
  lastName: 'Grah',
  email: 'anu@supermorpheus.com',
  profilePicture: null,
  currentOrganization: 'Super Morpheus',
  currentRole: 'Product Lead',
  livesIn: 'Bengaluru, India',
  introduction: 'Passionate about building products that make a difference. Love connecting with fellow entrepreneurs and sharing ideas.',
  profileCompletion: 65,
  status: 'basic', // basic, active, super
  joinedDate: '2025-01-15'
}

export const members = [
  {
    id: 'member-001',
    firstName: 'Priya',
    lastName: 'Sharma',
    profilePicture: null,
    currentOrganization: 'TechStart India',
    currentRole: 'Founder & CEO',
    livesIn: 'Mumbai, India',
    email: 'priya@techstart.in',
    phone: '+91 98765 43210',
    introduction: 'Building the future of EdTech in India. Former Google engineer turned entrepreneur.',
    status: 'super',
    tags: ['EdTech', 'AI/ML', 'Startup']
  },
  {
    id: 'member-002',
    firstName: 'Rahul',
    lastName: 'Verma',
    profilePicture: null,
    currentOrganization: 'GreenEnergy Solutions',
    currentRole: 'Co-Founder',
    livesIn: 'Delhi, India',
    email: 'rahul@greenenergy.co',
    phone: '+91 98765 43211',
    introduction: 'Climate tech enthusiast. Working on making renewable energy accessible to everyone.',
    status: 'active',
    tags: ['CleanTech', 'Sustainability', 'B2B']
  },
  {
    id: 'member-003',
    firstName: 'Ananya',
    lastName: 'Krishnan',
    profilePicture: null,
    currentOrganization: 'HealthFirst',
    currentRole: 'CTO',
    livesIn: 'Chennai, India',
    email: 'ananya@healthfirst.com',
    phone: '+91 98765 43212',
    introduction: 'Healthcare technology leader with 15 years of experience. Passionate about digital health.',
    status: 'super',
    tags: ['HealthTech', 'Digital Health', 'SaaS']
  },
  {
    id: 'member-004',
    firstName: 'Vikram',
    lastName: 'Singh',
    profilePicture: null,
    currentOrganization: 'FinLeap',
    currentRole: 'Founder',
    livesIn: 'Bengaluru, India',
    email: 'vikram@finleap.in',
    phone: '+91 98765 43213',
    introduction: 'Fintech founder focused on financial inclusion. Building banking for the next billion.',
    status: 'active',
    tags: ['FinTech', 'Payments', 'Inclusion']
  },
  {
    id: 'member-005',
    firstName: 'Meera',
    lastName: 'Patel',
    profilePicture: null,
    currentOrganization: 'CreativeMinds',
    currentRole: 'Design Director',
    livesIn: 'Pune, India',
    email: 'meera@creativeminds.co',
    phone: '+91 98765 43214',
    introduction: 'Design thinking advocate. Helping startups build user-centric products.',
    status: 'basic',
    tags: ['Design', 'UX', 'Consulting']
  },
  {
    id: 'member-006',
    firstName: 'Arjun',
    lastName: 'Nair',
    profilePicture: null,
    currentOrganization: 'LogiTech Solutions',
    currentRole: 'CEO',
    livesIn: 'Hyderabad, India',
    email: 'arjun@logitech.in',
    phone: '+91 98765 43215',
    introduction: 'Supply chain optimization expert. Making logistics smarter with AI.',
    status: 'super',
    tags: ['LogiTech', 'AI', 'Supply Chain']
  }
]

export const newMembers = members.slice(0, 4) // Last 4 members as "new"

export const events = [
  {
    id: 'event-001',
    title: 'Gurukul 2025',
    subtitle: 'Annual Retreat - Goa',
    date: 'March 15-18, 2025',
    location: 'Goa, India',
    attendeesCount: 45,
    image: null
  }
]

export const stats = {
  totalMembers: 789,
  newMembersThisWeek: 12,
  upcomingEvents: 1
}
