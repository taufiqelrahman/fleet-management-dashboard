# Fleet Map Integration

## Overview

Interactive map with real-time vehicle tracking and advanced filtering.

## Features

- **Color-coded markers**: 🟢 Active, 🔴 Maintenance, ⚫ Inactive
- **Smart filters**: Search by name/plate/driver, filter by status/type
- **Interactive popups**: Click for vehicle details
- **Auto-zoom**: Fits all visible vehicles
- **Multi-language**: EN, ID, AR

## Implementation

**Stack**: Leaflet + react-leaflet  
**Location**: `components/maps/fleet-map.tsx`  
**Database**: `latitude`, `longitude` fields in Vehicle model  
**Demo**: 6 vehicles across Jakarta

## Files Modified

- `components/maps/fleet-map.tsx` (new)
- `prisma/schema.prisma`, `prisma/seed.ts`
- `app/[locale]/dashboard/page.tsx`, `app/globals.css`
- `messages/{en,id,ar}.json`

## Usage

**Location**: `/dashboard` (below analytics charts)

**Filters**:

- Search bar: Filter by vehicle name, license plate, or driver
- Status dropdown: Active / Maintenance / Inactive
- Type dropdown: Sedan / SUV / Truck / Van
- Clear button: Reset all filters

**Interactions**: Click markers for vehicle details popup

## Future Ideas

- Real-time GPS updates via WebSocket
- Route history polylines
- Geofencing alerts
- Marker clustering for large fleets

## Demo Coordinates (Jakarta)

| Vehicle                | Latitude | Longitude | Location        |
| ---------------------- | -------- | --------- | --------------- |
| Toyota Avanza          | -6.2088  | 106.8456  | Central (Monas) |
| Daihatsu Gran Max      | -6.1751  | 106.8272  | North           |
| Mitsubishi Colt Diesel | -6.2615  | 106.7810  | West (Workshop) |
| Toyota Fortuner        | -6.2297  | 106.9234  | East            |
| Honda City             | -6.3012  | 106.8136  | South (Parking) |
| Suzuki Carry           | -6.1944  | 106.8229  | Port            |
