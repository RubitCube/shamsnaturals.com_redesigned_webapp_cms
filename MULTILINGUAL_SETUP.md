# Multilingual Translation Support - Setup Guide

## Overview

The application now supports **5 languages** with automatic translation:

- 🇺🇸 **English (USA)** - `en-US`
- 🇬🇧 **English (UK)** - `en-GB`
- 🇮🇹 **Italian** - `it`
- 🇦🇪 **Arabic (UAE)** - `ar`
- 🇮🇳 **Hindi (India)** - `hi`

## Features

✅ **Language Selector** - Dropdown with country flags next to Dealer Login button
✅ **Automatic Translation** - All page content translates instantly
✅ **RTL Support** - Arabic language displays in right-to-left format
✅ **Language Persistence** - Selected language is saved in localStorage
✅ **Browser Detection** - Automatically detects user's browser language

## Implementation Details

### Files Created

1. **`frontend/src/i18n/config.ts`** - i18next configuration
2. **`frontend/src/i18n/locales/en-US.json`** - English (USA) translations
3. **`frontend/src/i18n/locales/en-GB.json`** - English (UK) translations
4. **`frontend/src/i18n/locales/it.json`** - Italian translations
5. **`frontend/src/i18n/locales/ar.json`** - Arabic (UAE) translations
6. **`frontend/src/i18n/locales/hi.json`** - Hindi (India) translations
7. **`frontend/src/components/LanguageSelector.tsx`** - Language selector component

### Files Updated

1. **`frontend/src/main.tsx`** - Added i18n import
2. **`frontend/src/components/Layout/Navbar.tsx`** - Added translations and LanguageSelector
3. **`frontend/src/pages/HomePage.tsx`** - Added translations
4. **`frontend/src/pages/EventsPage.tsx`** - Added translations
5. **`frontend/src/pages/EventDetailPage.tsx`** - Added translations
6. **`frontend/src/index.css`** - Added RTL support styles

### Dependencies Installed

- `i18next` - Core internationalization framework
- `react-i18next` - React bindings for i18next
- `i18next-browser-languagedetector` - Browser language detection

## Usage

### In Components

```tsx
import { useTranslation } from "react-i18next";

const MyComponent = () => {
  const { t } = useTranslation();

  return (
    <div>
      <h1>{t("nav.home")}</h1>
      <p>{t("home.title")}</p>
    </div>
  );
};
```

### Translation Keys Structure

```json
{
  "nav": {
    "home": "Home",
    "about": "About Us",
    "products": "Products",
    ...
  },
  "home": {
    "title": "Welcome to Shams Naturals",
    "newArrivals": "New Arrivals",
    ...
  },
  "products": {
    "title": "Products",
    "viewMore": "View More",
    ...
  }
}
```

## Language Selector Component

The `LanguageSelector` component:

- Displays current language flag and code
- Shows dropdown with all available languages
- Includes country names for clarity
- Highlights currently selected language
- Closes on outside click
- Positioned next to Dealer Login button

## RTL Support

Arabic language automatically:

- Sets `dir="rtl"` on document
- Adjusts text alignment
- Reverses spacing utilities
- Maintains proper layout

## Adding New Translations

### Step 1: Add to all language files

Add the new key to all 5 language files:

- `en-US.json`
- `en-GB.json`
- `it.json`
- `ar.json`
- `hi.json`

### Step 2: Use in components

```tsx
const { t } = useTranslation();
<p>{t("new.key")}</p>;
```

## Language Files Location

All translation files are in:

```
frontend/src/i18n/locales/
├── en-US.json
├── en-GB.json
├── it.json
├── ar.json
└── hi.json
```

## Current Translation Coverage

✅ **Navigation** - All menu items
✅ **Homepage** - Titles, buttons, sections
✅ **Events** - Page titles, descriptions, buttons
✅ **Common** - Loading, errors, general messages

## Future Enhancements

To add translations for more pages:

1. Add translation keys to all language files
2. Import `useTranslation` hook in the component
3. Replace hardcoded text with `t('key')` calls

## Testing

1. Click the language selector dropdown
2. Select a different language (e.g., Italian 🇮🇹)
3. Verify all text changes to Italian
4. Check that language persists on page refresh
5. Test Arabic to verify RTL layout

---

**Status:** ✅ Fully Implemented
**Last Updated:** November 21, 2025
