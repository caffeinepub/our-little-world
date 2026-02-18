# Specification

## Summary
**Goal:** Replace Internet Identity authentication with automatic IP-based user identification.

**Planned changes:**
- Remove Internet Identity authentication system and all login/logout UI components
- Implement backend endpoint to detect and register users by IP address
- Automatically create user profiles when new IP addresses are detected
- Update ProfileSetupModal to prompt for name automatically for new IPs
- Replace Principal-based identification with IP-based identification throughout the application
- Update admin authorization to use IP addresses instead of Principals

**User-visible outcome:** Users can access the application immediately without logging in. New users are automatically prompted to enter their name when first detected by IP address, and all existing features work seamlessly with the new identification system.
