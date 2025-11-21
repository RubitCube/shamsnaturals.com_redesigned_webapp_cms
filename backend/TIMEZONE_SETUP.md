# Timezone Configuration

This application supports multi-timezone functionality for events and other datetime fields.

## Configuration

### Timezone Settings

The timezone configuration is stored in `backend/config/timezone.php`:

- **Default (Storage)**: UTC - All dates are stored in UTC in the database
- **Client Timezone**: Asia/Dubai (UAE) - Used for displaying dates to end users on public pages
- **Admin Timezone**: Asia/Kolkata (India) - Used for displaying dates in the admin panel

### Environment Variables

You can override these settings in your `.env` file:

```env
APP_TIMEZONE=UTC
CLIENT_TIMEZONE=Asia/Dubai
ADMIN_TIMEZONE=Asia/Kolkata
```

## How It Works

### Backend (Laravel)

1. **Storage**: All datetime values are stored in UTC in the database
2. **Admin API**: When retrieving events in the admin panel, dates are converted to India timezone (Asia/Kolkata)
3. **Public API**: When retrieving events on public pages, dates are converted to UAE timezone (Asia/Dubai)
4. **Saving**: When admin saves an event date, it's converted from India timezone to UTC before storage

### Frontend

1. **Admin Panel**: Displays dates in India timezone (Asia/Kolkata)
2. **Public Pages**: Displays dates in UAE timezone (Asia/Dubai)
3. **Date Inputs**: Uses browser's local timezone (should be India for admin users)

## Files Modified

### Backend
- `backend/config/timezone.php` - Timezone configuration
- `backend/app/Models/Event.php` - Added timezone conversion methods
- `backend/app/Http/Controllers/Admin/EventController.php` - Timezone conversion for admin operations
- `backend/app/Http/Controllers/API/EventController.php` - Timezone conversion for public API

### Frontend
- `frontend/src/pages/admin/AdminEvents.tsx` - Updated date display and formatting
- `frontend/src/pages/EventsPage.tsx` - Already displays dates (will show in UAE timezone from API)
- `frontend/src/pages/EventDetailPage.tsx` - Already displays dates (will show in UAE timezone from API)
- `frontend/src/components/EventsGallery.tsx` - Already displays dates (will show in UAE timezone from API)

## Testing

1. **Admin Panel**: Create an event with a date/time in the admin panel (India timezone)
2. **Database**: Check that the date is stored in UTC
3. **Admin Display**: Verify the date displays correctly in India timezone
4. **Public Display**: Verify the date displays correctly in UAE timezone on public pages

## Notes

- The timezone conversion is handled automatically by the backend
- No changes are needed to existing event data - they will be converted on-the-fly
- All new events will be stored in UTC and converted when displayed

