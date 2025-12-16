# Changelog

All notable changes to NextFleet will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Version](https://semver.org/spec/v2.0.0.html).

## [1.3.0] - 2025-12-14

### Added

- **Web Push Notifications**
  - Browser push notification support using Web Push API
  - VAPID-authenticated secure push delivery
  - PushSubscription database model for managing user subscriptions
  - `/api/push/subscribe` endpoint for subscribing/unsubscribing to push notifications
  - `lib/push-notifications.ts` helper library with functions for sending push notifications
  - Service worker (`public/service-worker.js`) for background push notification handling
  - `PushNotificationToggle` component in navbar/sidebar for managing notification permissions
  - Auto-cleanup of expired push subscriptions (410/404 error handling)
  - Role-based notification targeting (send by user roles)
  - Support for notification icons, badges, and custom vibration patterns
  - Multi-language support for push notification translations (EN/ID/AR)

## [1.2.0] - 2025-12-14

### Changed

- **[MAJOR]** Upgraded Node.js from v18 to v24.11.1 for improved performance and latest features
  - Updated Dockerfile to use `node:24-alpine` across all stages
  - Updated CI/CD workflows to use Node.js 24.11.1
  - Updated `.nvmrc` to enforce Node.js 24.11.1
  - Updated `package.json` engine requirement to `>=24.11.1`
  - Updated README.md prerequisites to Node.js 24.11.1
  - Performance improvements with V8 12.4+ engine
  - Better ESM and TypeScript support
  - Enhanced memory management

### Fixed

- Fixed CSS parsing error by moving `@import` statements above `@tailwind` directives

## [1.1.0] - 2025-12-14

### Security

- **[CRITICAL]** Updated Next.js from 15.0.0 to 16.0.10 to patch CVE-2025-66478 security vulnerability
- All dependencies verified and updated to latest secure versions

### Added

- **Real-time Notification System**

  - Bell icon with unread badge counter in navbar/sidebar
  - 6 notification types: Clock In/Out, Vehicle Status Changes, Maintenance Reminders, Shift Reminders, System notifications
  - Auto-triggered notifications for clock-in/out and vehicle maintenance status changes
  - 30-second polling for real-time updates using TanStack Query
  - Mark as read (individual & bulk) and delete actions
  - Scrollable notification history with relative timestamps
  - Full multi-language support (EN/ID/AR)
  - Notification model in Prisma schema with indexes
  - Server actions for notification CRUD operations
  - Complete documentation in `docs/NOTIFICATION_SYSTEM.md`

- **UI Components**
  - ScrollArea component from Radix UI for notification list
  - NotificationCenter dropdown component integrated in layout
  - Color-coded emoji icons for different notification types

### Changed

- Updated README.md to reflect Next.js 16 and new notification features
- Enhanced attendance system to trigger clock-in/out notifications automatically
- Enhanced vehicle management to notify Admin/Operators on maintenance status changes
- Improved translation structure with dedicated `notifications.*` keys

### Fixed

- Translation keys for vehicle status chart (`vehicles.active` → `vehicles.status.active`)
- TypeScript type issues with auth session casting
- Prisma client regeneration for Notification model
- ESLint warnings for unused imports in notification components

### Documentation

- Created comprehensive `NOTIFICATION_SYSTEM.md` (400+ lines)
- Updated README.md with notification features, tech stack, and project structure
- Added CHANGELOG.md for version tracking

## [1.0.0] - 2025-12-01

### Added

- Initial release with complete fleet management dashboard
- Next.js 15 (App Router) with TypeScript
- Role-based access control (5 roles: Admin, Operator, Employee, Supervisor, HR)
- Vehicle management with CRUD operations
- Trip tracking and analytics
- Attendance tracking with GPS location
- Timesheet management with activity logging
- Shift scheduling system
- Real-time fleet map with Leaflet integration
- Multi-language support (EN/ID/AR) with RTL for Arabic
- Interactive charts and analytics with Recharts
- Export to PDF and CSV functionality
- NextAuth.js authentication with credentials provider
- Prisma ORM with PostgreSQL (Neon) database
- TanStack Query for state management
- ShadCN/UI component library
- Comprehensive documentation
- Docker support for deployment
- Unit tests with Jest

---

**Note:** For detailed technical documentation, see:

- `/docs/TECHNICAL.md` - Architecture & implementation details
- `/docs/RBAC_SYSTEM.md` - Role-based access control guide
- `/docs/ATTENDANCE_SYSTEM.md` - Attendance & timesheet guide
- `/docs/MAP_INTEGRATION.md` - Fleet map integration guide
- `/docs/NOTIFICATION_SYSTEM.md` - Notification system guide
