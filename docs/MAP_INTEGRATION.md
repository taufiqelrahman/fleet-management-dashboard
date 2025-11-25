# Fleet Map Integration

## Overview

Interactive map showing real-time vehicle locations on dashboard using Leaflet.

## Features

- **Color-coded markers**: 🟢 Active, 🔴 Maintenance, ⚫ Inactive
- **Interactive popups**: Vehicle details on click
- **Auto-zoom**: Fits all vehicles in view
- **Multi-language**: EN, ID, AR support

## Implementation

**Stack**: Leaflet + react-leaflet  
**Location**: `components/maps/fleet-map.tsx`  
**Database**: Added `latitude`, `longitude` to Vehicle model  
**Demo Data**: 6 vehicles in Jakarta area

## Files Modified

- `components/maps/fleet-map.tsx` (new)
- `prisma/schema.prisma`, `prisma/seed.ts`
- `app/[locale]/dashboard/page.tsx`, `app/globals.css`
- `messages/{en,id,ar}.json`

## Usage

Navigate to `/dashboard` - map appears below analytics charts. Click markers for details.

## Future Enhancements

- WebSocket for real-time updates
- Route history with polylines
- Geofencing & alerts
- Vehicle clustering

## Demo Coordinates (Jakarta)

| Vehicle                | Latitude | Longitude | Location        |
| ---------------------- | -------- | --------- | --------------- |
| Toyota Avanza          | -6.2088  | 106.8456  | Central (Monas) |
| Daihatsu Gran Max      | -6.1751  | 106.8272  | North           |
| Mitsubishi Colt Diesel | -6.2615  | 106.7810  | West (Workshop) |
| Toyota Fortuner        | -6.2297  | 106.9234  | East            |
| Honda City             | -6.3012  | 106.8136  | South (Parking) |
| Suzuki Carry           | -6.1944  | 106.8229  | Port            |
