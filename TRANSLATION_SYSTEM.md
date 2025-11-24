# Comprehensive Translation System - Shams Naturals

## Overview
This document provides a complete guide to the multi-language translation system implemented across the entire website and admin panel.

## Supported Languages

1. **English (US)** - `en-US` 🇺🇸
2. **English (UK)** - `en-GB` 🇬🇧  
3. **Italian** - `it` 🇮🇹
4. **Arabic** - `ar` 🇦🇪
5. **Hindi** - `hi` 🇮🇳

## Translation Files Location

```
frontend/src/i18n/locales/
├── en-US.json (Frontend translations - US English)
├── en-GB.json (Frontend translations - UK English)
├── it.json (Frontend translations - Italian)
├── ar.json (Frontend translations - Arabic)
├── hi.json (Frontend translations - Hindi)
├── admin-en-US.json (Admin panel translations - US English)
├── admin-en-GB.json (Admin panel translations - UK English)
├── admin-it.json (Admin panel translations - Italian)
├── admin-ar.json (Admin panel translations - Arabic)
└── admin-hi.json (Admin panel translations - Hindi)
```

## How to Use Translations

### In Frontend Components

```typescript
import { useTranslation } from 'react-i18next';

function MyComponent() {
  const { t } = useTranslation();
  
  return (
    <div>
      <h1>{t('home.title')}</h1>
      <p>{t('home.description')}</p>
    </div>
  );
}
```

### In Admin Panel Components

```typescript
import { useTranslation } from 'react-i18next';

function AdminComponent() {
  const { t } = useTranslation('admin'); // Specify 'admin' namespace
  
  return (
    <div>
      <h1>{t('admin.dashboard')}</h1>
      <button>{t('admin.save')}</button>
    </div>
  );
}
```

## Language Selector Features

The language selector is already implemented in the navbar and provides:

- ✅ Flag icons for visual recognition
- ✅ Language name in native script
- ✅ Country indicator
- ✅ Automatic language detection
- ✅ Persistent language selection (saved in localStorage)
- ✅ RTL support for Arabic
- ✅ Dropdown with all available languages

## RTL (Right-to-Left) Support

Arabic language automatically enables RTL mode:
- Document direction changes to `rtl`
- Layout mirrors appropriately
- Text alignment adjusts automatically

## Adding New Translations

### Step 1: Add to Frontend Translation File

Edit `frontend/src/i18n/locales/[language].json`:

```json
{
  "yourSection": {
    "yourKey": "Your translated text"
  }
}
```

### Step 2: Add to Admin Translation File

Edit `frontend/src/i18n/locales/admin-[language].json`:

```json
{
  "admin": {
    "yourKey": "Your translated text"
  }
}
```

### Step 3: Use in Component

```typescript
const { t } = useTranslation();
// or for admin
const { t } = useTranslation('admin');

return <span>{t('yourSection.yourKey')}</span>;
```

## Translation Keys Structure

### Frontend (Public Pages)

- `nav.*` - Navigation menu items
- `home.*` - Homepage content
- `products.*` - Products page
- `about.*` - About page
- `contact.*` - Contact page
- `dealers.*` - Dealers page
- `events.*` - Events page
- `footer.*` - Footer content
- `common.*` - Common/shared translations

### Admin Panel

- `admin.dashboard` - Dashboard items
- `admin.products` - Product management
- `admin.categories` - Category management
- `admin.banners` - Banner management
- `admin.dealers` - Dealer management
- `admin.blogs` - Blog management
- `admin.events` - Event management
- `admin.pages` - Page management
- `admin.seo` - SEO management
- `admin.settings` - Settings
- `admin.common` - Common admin terms

## Dynamic Content Translation

For content coming from the database (products, categories, blogs, events):
- These are NOT translated via JSON files
- Content should be entered in multiple languages in the database
- Alternatively, integrate a backend translation API

## Best Practices

### 1. Always Use Translation Keys
❌ **Bad:**
```typescript
<button>Save</button>
```

✅ **Good:**
```typescript
<button>{t('admin.save')}</button>
```

### 2. Use Descriptive Keys
❌ **Bad:**
```json
{
  "btn1": "Click here"
}
```

✅ **Good:**
```json
{
  "contact": {
    "submitButton": "Click here"
  }
}
```

### 3. Group Related Translations
❌ **Bad:**
```json
{
  "productName": "Product Name",
  "productPrice": "Product Price",
  "categoryName": "Category Name"
}
```

✅ **Good:**
```json
{
  "product": {
    "name": "Product Name",
    "price": "Product Price"
  },
  "category": {
    "name": "Category Name"
  }
}
```

### 4. Handle Plurals

```typescript
// In translation file
{
  "items": "{{count}} item",
  "items_plural": "{{count}} items"
}

// In component
t('items', { count: 1 }); // "1 item"
t('items', { count: 5 }); // "5 items"
```

### 5. Use Interpolation for Dynamic Values

```typescript
// In translation file
{
  "welcome": "Welcome, {{name}}!"
}

// In component
t('welcome', { name: 'John' }); // "Welcome, John!"
```

## Testing Translations

### 1. Check All Languages
- Switch to each language using the language selector
- Verify all text is translated
- Check for missing translations (will show key instead of text)

### 2. Verify RTL (Arabic)
- Switch to Arabic
- Check layout direction
- Verify text alignment
- Test navigation and buttons

### 3. Check Admin Panel
- Login to admin panel
- Switch languages
- Verify all admin interface text is translated

## Missing Translation Handling

If a translation key is missing:
- Development: Shows the key (e.g., `admin.missingKey`)
- Production: Same behavior (helps identify missing translations)

To add fallback English:
```typescript
t('some.key', 'Default English Text')
```

## Updating Translations

### For Developers:
1. Add translation keys to all language JSON files
2. Use the key in components with `t()` function
3. Test in all supported languages

### For Translators:
1. Access JSON files in `frontend/src/i18n/locales/`
2. Update values (keep keys unchanged)
3. Maintain JSON structure
4. Save with UTF-8 encoding

## Translation Coverage

### Current Implementation:
✅ Navigation menu
✅ Homepage
✅ Product pages
✅ Contact page
✅ Footer
✅ Admin panel navigation
✅ Common UI elements
✅ Form labels and buttons
✅ Error messages
✅ Success messages

### Requires Manual Translation:
⚠️ Database content (products, categories, descriptions)
⚠️ Blog posts
⚠️ Event descriptions
⚠️ Page content
⚠️ SEO meta tags

## Language Detection

The system automatically detects language in this order:
1. Previously selected language (from localStorage)
2. Browser language preference
3. Fallback to English (US)

## Maintenance

### Adding a New Language

1. **Create translation files:**
```bash
frontend/src/i18n/locales/[lang].json
frontend/src/i18n/locales/admin-[lang].json
```

2. **Update i18n config:**
```typescript
// frontend/src/i18n/config.ts
import newLang from './locales/[lang].json';
import adminNewLang from './locales/admin-[lang].json';

const resources = {
  '[lang]': {
    translation: newLang,
    admin: adminNewLang
  },
  // ... other languages
};
```

3. **Add to language selector:**
```typescript
// frontend/src/components/LanguageSelector.tsx
const languages: Language[] = [
  // ... existing languages
  { code: '[lang]', name: 'Language Name', flagImage: '[country-code]', country: 'Country' },
];
```

4. **Add RTL support (if needed):**
```typescript
// frontend/src/i18n/config.ts
const updateDocumentDirection = (lng: string) => {
  if (lng === 'ar' || lng === '[new-rtl-lang]') {
    document.documentElement.dir = 'rtl';
  } else {
    document.documentElement.dir = 'ltr';
  }
};
```

## Google Translate Integration (Optional)

For automatic translation of database content:

```typescript
// Example: Translate product names dynamically
const translateText = async (text: string, targetLang: string) => {
  // Implement Google Translate API or similar
  // This would require backend support
};
```

## Performance Considerations

- Translation files are loaded only for the selected language
- Language switching is instant (no page reload)
- Translations are cached in memory
- Minimal bundle size impact (~2KB per language)

## Troubleshooting

### Translation Not Showing
1. Check if key exists in JSON file
2. Verify correct namespace ('translation' vs 'admin')
3. Check console for i18next warnings
4. Verify JSON syntax is valid

### RTL Not Working
1. Check if language code is 'ar'
2. Verify RTL CSS is loaded
3. Check document direction in DevTools

### Language Not Persisting
1. Check localStorage is enabled
2. Verify key 'i18nextLng' is saved
3. Clear cache and cookies

## Support

For translation issues or questions:
- Check i18next documentation: https://www.i18next.com/
- Review React i18next docs: https://react.i18next.com/
- Contact development team

---

**Last Updated:** November 2025
**Version:** 1.0.0

