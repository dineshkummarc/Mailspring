# Email Draft: Patrick Hearn (XDA Developers)

**To:** Patrick Hearn
**Contact:** XDA profile: https://www.xda-developers.com/author/patrick-hearn/
**Re:** https://www.xda-developers.com/ditched-slow-thunderbird-setup-for-faster-alternative/

---

**Subject:** Big Mailspring updates since your XDA piece — calendar, Wayland, and more

Hi Patrick,

I saw your XDA piece about ditching Thunderbird for Mailspring and wanted to say thanks — it was a great writeup and it's driven a lot of people to give Mailspring a serious look.

Since that article went up, we've shipped some substantial updates that I think would make for a compelling follow-up if you're ever looking for one:

**Full calendar support:** This was the #1 missing feature people cited. Mailspring now has a complete CalDAV calendar — month/week/day/agenda views, drag-to-reschedule, event editing with server sync, recurring event support, and search. It's built in, not a plugin.

**Major Linux platform work:**
- Native Wayland support (Electron 39) — huge for modern Fedora and Ubuntu users
- ARM64/aarch64 builds now available
- Official AUR package for Arch Linux
- Fixed system tray issues on GNOME, Unity, and Ubuntu 25
- Thin window framing with hamburger menu as the Linux default
- Improved Fedora dependency handling

**Quality-of-life improvements:**
- Built-in grammar checking (LanguageTool integration)
- One-click unsubscribe (RFC 2369/8058)
- Full accessibility overhaul
- VCard import/export
- Sync engine stability fixes (iCloud, memory leaks, deadlocks resolved)

The Thunderbird comparison has only gotten more interesting — especially on the Linux side where we now have native Wayland and a calendar to go alongside the UI advantages you highlighted.

Happy to provide screenshots, answer questions, or give early access to anything in the pipeline if that's useful.

Cheers,
[Your name]
Mailspring Team
