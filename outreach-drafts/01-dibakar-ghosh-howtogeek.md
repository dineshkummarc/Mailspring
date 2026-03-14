# Email Draft: Dibakar Ghosh (How-To Geek)

**To:** Dibakar Ghosh
**Contact:** LinkedIn: https://www.linkedin.com/in/dibakarg/ | MuckRack: https://muckrack.com/dibakar-ghosh
**Re:** https://www.howtogeek.com/this-is-my-favorite-email-client-on-linux-its-not-thunderbird/

---

**Subject:** Mailspring has a calendar now (and a lot more) — thought you'd want to know

Hi Dibakar,

I came across your How-To Geek piece about Mailspring being your favorite Linux email client, and it really resonated with our team. Thank you for writing it — it means a lot when someone takes the time to explain what makes Mailspring different.

I wanted to reach out because we've shipped some major updates over the last few months that address several of the gaps people have pointed out, and I thought you might find them interesting:

**Calendar (the big one):** Mailspring now has a full CalDAV calendar built in — month, week, day, and agenda views, drag-to-reschedule, recurring events with exception handling, event creation and editing with sync back to the server, and calendar search. This was far and away the most-requested feature, and it's shipping in a polished state with more improvements on the way.

**Linux-specific improvements:**
- Native Wayland support via Electron 39 — no more XWayland workarounds
- ARM64 (aarch64) builds are now available
- The community AUR package is now official
- Improved Fedora compatibility (broader libtidy dependency support, fixed soname issues)
- System tray fixes for GNOME, Unity, and Ubuntu 25
- Dark/light system tray icon support
- Default thin window framing with hamburger menu for a more native Linux look
- SMTP EHLO/HELO IPv6 address support
- Do Not Disturb detection on Linux

**Other highlights:**
- Grammar checking in the composer (via LanguageTool)
- One-click unsubscribe using RFC 2369/8058 headers
- Comprehensive accessibility overhaul (ARIA attributes, semantic landmarks, focus traps)
- VCard import/export for contacts
- TypeScript v3→v5 and React upgrades under the hood
- Numerous sync engine fixes (iCloud infinite sync bug, memory leaks, race conditions)

If you're ever thinking about doing a follow-up or updated piece, we'd love to help with screenshots, early access to upcoming features, or anything else that would be useful. And of course, we're always happy to hear feedback directly.

Thanks again for championing Mailspring. It really does make a difference.

Best,
[Your name]
Mailspring Team
