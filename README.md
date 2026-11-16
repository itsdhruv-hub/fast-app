# Fasting Reminder

An Expo Go compatible personal fasting calendar with local reminders, recurring weekly schedules, history, and optional Supabase persistence.

## Run in Expo Go

1. Install Node.js LTS and Expo Go on the phone.
2. From this folder run `npm.cmd install`.
3. Copy `.env.example` to `.env` only if Supabase persistence is wanted, then add the project URL and public anon/publishable key.
4. Run `npm.cmd start` and scan the QR code with Expo Go. This project uses port 8082 because port 8081 is already occupied on the development machine.

If Expo Go shows a blue “Something went wrong” page, run `powershell -ExecutionPolicy Bypass -File .\start-expo.ps1`, then enter the printed `exp://...:8082` address in Expo Go. The phone and computer must be on the same Wi-Fi network.

For a phone using mobile data or a different network, run `npm.cmd run start:tunnel -- --clear`. This uses the local ngrok provider on port 8083 and does not require the Expo signed tunnel login.

The app works in local personal mode without Supabase. Local mode stores the schedule on the device with AsyncStorage and still supports notification scheduling. The database password is not used in the mobile app and must never be placed in `.env`, source files, or a client bundle.

## Supabase setup

Run `supabase/migrations/20261116000000_create_fasting_reminder.sql` in the Supabase SQL editor. Add only the project URL and the public anon/publishable key to `.env`:

```env
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-public-anon-key
```

Never use a service-role key in Expo. The migration includes RLS policies for authenticated users and an initial anonymous personal mode.

## Android / iOS notes

Local notifications are scheduled on the device and do not require the app to remain open. Android notification permission and battery optimization settings can affect delivery. Expo Go is suitable for development; use an EAS development or production build when you need a standalone app with stable native notification configuration.

## Implemented workflows

- One-time fasts with name, type, date, notes, reminder toggle, and edit support.
- Weekly recurrence with a bounded eight-week scheduling window.
- Countdown reminders three days before, a separate night-before reminder, and fasting-day reminders.
- Deterministic cancellation and rescheduling when an event is edited, deleted, or the app is reopened.
- Completed events remain visible until explicitly saved to history or deleted.
- Calendar, history filters, reminder settings, notification permission status, and local timezone display.

## Verification status

The source is ready to run after dependencies are installed with `npm.cmd install` and `npm.cmd start`. A physical Expo Go run and notification delivery test still need to be performed on a device.
