# Google Maps Embed Coordinate Extraction

## Overview
The system now extracts latitude and longitude coordinates **directly from Google Maps embed iframe URLs** instead of relying on geocoding services. This ensures 100% accuracy and eliminates the need for external API calls when creating/updating dealers.

## How It Works

### 1. Google Maps Embed URL Structure
When you get a Google Maps embed code, it looks like this:
```html
<iframe src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3961.5372470093403!2d39.27642687475608!3d-6.825993693171834!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x185c4b089adbba71%3A0x6ff764ca49d138e5!2sDarcity%20Promotion!5e0!3m2!1sen!2sin!4v1763027779665!5m2!1sen!2sin" width="600" height="450" style="border:0;" allowfullscreen="" loading="lazy" referrerpolicy="no-referrer-when-downgrade"></iframe>
```

The `pb` parameter contains encoded coordinates in the format:
- `!2d{longitude}!3d{latitude}`
- Example: `!2d39.276426!3d-6.825993`

### 2. Coordinate Extraction Methods

The backend PHP function `extractCoordinatesFromEmbed()` uses multiple methods to extract coordinates:

#### Method 1: `pb` Parameter (Primary)
```regex
!2d([-\d.]+)!3d([-\d.]+)
```
Extracts: `!2d39.276426!3d-6.825993`
- Longitude: 39.276426
- Latitude: -6.825993

#### Method 2: `ll` Parameter (Fallback)
```regex
ll=([-\d.]+),([-\d.]+)
```
Extracts: `ll=-6.825993,39.276426`

#### Method 3: `center` Parameter (Fallback)
```regex
center=([-\d.]+)%2C([-\d.]+)
```
Extracts: `center=-6.825993%2C39.276426`

### 3. Validation
All extracted coordinates are validated to ensure they're within valid ranges:
- Latitude: -90 to +90
- Longitude: -180 to +180

### 4. Priority Order
When creating or updating a dealer:
1. **First**: Try to extract coordinates from Google Maps embed iframe
2. **Fallback**: If no embed or extraction fails, use Nominatim geocoding
3. **Stored**: Coordinates are saved to `dealers` table (`latitude`, `longitude` columns)

## Usage

### For Dealers Management (Admin)

1. Go to **Admin → Dealers Management**
2. Click **"Add New Dealer"**
3. Fill in the form fields:
   - Company Name: Darcity Promotion
   - Address: Nkrumah Street, Pugu Road, Opposite CBD hotel
   - City: Dar es Salaam
   - State: Dar es Salaam
   - Country: Tanzania

4. **Get Google Maps Embed Code:**
   - Go to Google Maps
   - Search for the location
   - Click "Share" → "Embed a map"
   - Copy the entire `<iframe>` code

5. **Paste in "Location" field:**
```html
<iframe src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3961.5372470093403!2d39.27642687475608!3d-6.825993693171834!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x185c4b089adbba71%3A0x6ff764ca49d138e5!2sDarcity%20Promotion!5e0!3m2!1sen!2sin!4v1763027779665!5m2!1sen!2sin" width="600" height="450" style="border:0;" allowfullscreen="" loading="lazy" referrerpolicy="no-referrer-when-downgrade"></iframe>
```

6. Click **"Create Dealer"**

### What Happens Next

1. **Backend Extracts Coordinates:**
   - Parses the iframe `src` URL
   - Finds `!2d39.276426!3d-6.825993`
   - Extracts: `lat=-6.825993`, `lng=39.276426`
   - Saves to database

2. **Dealers Page Auto-Updates:**
   - Polls for new dealers every 10 seconds
   - Detects the new dealer
   - Flies to the location: `lat=-6.825993, lng=39.276426`
   - Places green butterfly marker
   - Creates shaded circle (50km radius)
   - Opens dealer card popup

3. **Popup Displays:**
   - Company name and contact
   - Full address
   - Phone numbers (clickable)
   - Email (clickable)
   - Website (clickable)
   - **Embedded Google Map** (same iframe you pasted!)

## Example Embed Code for Tanzania
```html
<iframe src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3961.5372470093403!2d39.27642687475608!3d-6.825993693171834!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x185c4b089adbba71%3A0x6ff764ca49d138e5!2sDarcity%20Promotion%20%7C%20Best%20Printing%20Company%20in%20Dar%20es%20Salaam%20-%20Tanzania.!5e0!3m2!1sen!2sin!4v1763027779665!5m2!1sen!2sin" width="600" height="450" style="border:0;" allowfullscreen="" loading="lazy" referrerpolicy="no-referrer-when-downgrade"></iframe>
```

**Extracted Coordinates:**
- Latitude: -6.825993693171834
- Longitude: 39.27642687475608
- Location: Dar es Salaam, Tanzania

## Benefits

✅ **100% Accurate**: Uses exact coordinates from Google Maps  
✅ **No External APIs**: No geocoding service needed  
✅ **No API Keys**: Free, no usage limits  
✅ **Works Offline**: Once coordinates are extracted  
✅ **Instant**: No waiting for geocoding API response  
✅ **Visual Confirmation**: Shows the same map in the popup  
✅ **Auto-Zoom**: Dealers page automatically flies to new locations  

## Technical Details

### Files Modified
- `backend/app/Http/Controllers/Admin/DealerController.php`
  - Added `extractCoordinatesFromEmbed($embedCode)`
  - Added `isValidCoordinate($lat, $lng)`
  - Modified `store()` to prioritize embed coordinates
  - Modified `update()` to prioritize embed coordinates

### Database
Coordinates are stored in the `dealers` table:
```sql
latitude: decimal(10, 8)   -- e.g., -6.82599369
longitude: decimal(11, 8)  -- e.g., 39.27642688
```

### Logging
All coordinate extraction attempts are logged:
```php
\Log::info('Extracted coordinates from Google Maps embed (pb parameter)', [
    'lat' => -6.825993,
    'lng' => 39.276426,
    'url' => '...'
]);
```

## Troubleshooting

### Issue: Marker not appearing
**Solution**: Check the Laravel log to see if coordinates were extracted:
```bash
tail -f backend/storage/logs/laravel.log
```

### Issue: Wrong location
**Solution**: Verify the Google Maps embed URL contains the correct `!2d` and `!3d` parameters

### Issue: Marker appears but popup is empty
**Solution**: Make sure all dealer fields are filled, especially phone numbers and website

## Testing

1. **Create a new dealer** with the Tanzania embed code
2. **Check the log** for: `"Extracted coordinates from Google Maps embed"`
3. **Open Dealers page** within 10 seconds
4. **Watch** the map fly to Tanzania
5. **Click the marker** to see the full dealer card with embedded map

Done! 🎉

