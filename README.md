# G360 Design System Guidelines

You are designing a mobile community/directory app called G360 with the following design specifications. Follow these guidelines precisely for consistency.

---

## 1. Screen Dimensions

- **Primary device**: iPhone 14 Pro (390px × 844px viewport)
- All screens should be designed for **mobile-first**
- Scrollable screens may have variable heights (e.g., Directory: 2282px, Profile: 3848px)

---

## 2. Color Palette

### Primary Colors

| Color | Hex Code | Usage |
|-------|----------|-------|
| Primary Green | `#648349` | Buttons, links, headings, tags text, interactive elements |
| Primary Green Light (Tag Background) | `#EDFAE2` | Light green for tag/chip backgrounds |

### Secondary Colors

| Color | Hex Code | Usage |
|-------|----------|-------|
| Golden/Orange | `#F0BA3F` | Event titles, accent elements |
| Event Card Background | `#FFF6DA` | Light cream/yellow for event cards |
| Red Notification Badge | Standard red | Notification indicators |

### Neutral Colors

| Color | Hex Code | Usage |
|-------|----------|-------|
| White | `#FFFFFF` | Page backgrounds, card backgrounds |
| Dark Gray (Body Text) | `#3C3C43` | Input text, body text |
| Medium Gray (Secondary Text) | `#898989` | Locations, secondary information |
| Light Gray | — | Dividers and subtle borders |

---

## 3. Typography

### Font Families

| Type | Font |
|------|------|
| Primary Font | Proxima Nova |
| Secondary Font | DM Sans (for input fields and some body text) |
| Accent Font | IBM Plex Sans (for tag labels) |

### Type Hierarchy

| Element | Font | Weight | Size | Line Height | Color |
|---------|------|--------|------|-------------|-------|
| Page Title (Welcome) | Proxima Nova | 700 (Bold) | 26px | 100% | `#648349` |
| Event Title | Proxima Nova | 700 (Bold) | 23px | 23px | `#F0BA3F` |
| User Name (Cards) | Proxima Nova | 600 (Semibold) | 18px | 100% | `#648349` |
| Section Headers | Proxima Nova | 600 (Semibold) | 16-18px | 100% | `#3C3C43` |
| Location/Subtitle | Proxima Nova | 400 (Regular) | 16px | 100% | `#898989` |
| Body Text | DM Sans | 400 (Regular) | 15px | 22px | `#3C3C43` |
| Tag Label | IBM Plex Sans | 400 (Regular) | 13px | 19px | `#648349` |
| Caption/Footer | DM Sans | 400 (Regular) | 12-13px | 100% | `#898989` |

---

## 4. Spacing System

- **Base unit**: 8px
- **Common paddings**: 16px, 20px, 24px
- **Card internal padding**: 16px
- **Section margins**: 24px vertical spacing
- **List item spacing**: 16px between items

---

## 5. Components

### Primary Button

```
Width: 318px (full-width minus margins) or flexible
Height: 64px
Border Radius: 10px
Background: #648349
Text: White, 16-17px, centered
Shadow: None
```

### Secondary Button (Google Sign-in)

```
Width: Full-width minus margins
Height: 56px
Border Radius: 10px
Background: White
Border: 1px solid light gray
Text: #3C3C43, 15px
Icon: Google logo left-aligned
```

### Input Field

```
Width: Full-width minus margins
Height: 56px approx
Background: #F5F5F5 or very light gray
Border: None (flat design)
Border Radius: 10px
Placeholder Text: #3C3C43 at 60% opacity
Font: DM Sans, 15px
```

### Tag/Chip

```
Height: 26px
Horizontal Padding: 12px
Border Radius: 5px
Background: #EDFAE2
Text: #648349, IBM Plex Sans, 13px, centered
```

### User Card (Directory List Item)

```
Full width
Padding: 16px
Profile Image: 56-65px circular
Name: Proxima Nova, 18px, Semibold, #648349
Location: Proxima Nova, 16px, Regular, #898989
Tags: Horizontal row below location
Divider: 1px light gray line below each card
```

### Event Card

```
Width: 390px (full width)
Height: 137px
Background: #FFF6DA
Border Radius: 10px
Contains: Event image (circular), title, date, location
Title: Proxima Nova, 23px, Bold, #F0BA3F
```

### Search Bar

```
Height: 48px
Background: #F5F5F5
Border Radius: 24px (pill shape)
Search icon: Left-aligned, gray
Placeholder: "Search by name, passion, location"
```

### Profile Avatar

```
Directory cards: 56-65px circular
Large profile header: 100-120px circular
Border: None or subtle white border
```

### Icon Button (Filter, etc.)

```
Size: 55px × 55px
Border Radius: 10px
Background: #648349
Icon: White
```

### Notification Icon

```
Size: 24px × 24px
Bell icon: Dark gray or black
Badge: Red circle, top-right
```

---

## 6. Navigation Patterns

### Status Bar

- **Time**: 09:39 format, left-aligned
- **Icons**: WiFi, cellular, battery on right
- **Height**: ~44px

### Back Navigation

- Left arrow icon
- Search field inline with back button

### Tab Bar (if applicable)

- Fixed at bottom
- Home, Search, Profile icons
- **Active**: `#648349`, **Inactive**: Gray

---

## 7. Screen Templates

### Login Screen

```
- Logo/Icon centered at top
- Welcome message: "Hey, Welcome Back!"
- Email input field
- Password input field
- "Forgot Password?" link
- Primary "Continue" button
- "Or Log In Using" divider
- Google sign-in button
- "Don't have an account? Sign Up" link
```

### Directory Screen

```
- Welcome header with user name
- Community update message with emoji
- New member carousel (circular avatars)
- Search bar
- Event/announcement card (yellow)
- "All members" count + Sort filter
- Scrollable list of user cards
```

### Search Results

```
- Search input with active query
- "Search results" header + filter icon
- List of matching users
- "Recently searched" section with clear option
```

### Profile Main

```
- Hero image/video with play indicator
- Tags row
- Name and location
- Bio text
- "Currently" section with role/company
- Multiple collapsible sections (Interests, Background, etc.)
- Quote card with gradient background
```

---

## 8. Imagery Guidelines

- **Profile photos**: Always circular, high quality
- **Event images**: Circular thumbnails in cards
- **Hero images**: Full-width with overlay for text
- **Icons**: Material design or FontAwesome style, line icons preferred

---

## 9. States & Interactions

- **Button hover/press**: Slight darkening of background
- **Input focus**: Subtle border or shadow
- **Card tap**: Navigate to detail/profile
- **Tags**: Tappable for filtering

---

## 10. Accessibility

- Maintain **4.5:1 contrast ratio** minimum
- Touch targets minimum **44px × 44px**
- Clear visual hierarchy
- Readable font sizes (minimum 13px)

---

## Usage Example

When generating UI code or designs for G360:

1. Always use the specified color values exactly
2. Maintain consistent spacing using 8px base units
3. Use Proxima Nova as the primary font family
4. Ensure all interactive elements meet minimum touch targets
5. Follow the established component patterns for consistency
6. Test designs at 390px width for mobile optimization

---

*Based on thorough analysis of G360 Figma designs*
# Trigger deployment
