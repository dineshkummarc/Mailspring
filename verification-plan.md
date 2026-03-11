# Build Migration Verification Plan

## Overview

This document defines a series of checks to verify that artifacts produced by the **new** electron-builder-based build system are equivalent to those produced by the **old** Grunt + @electron/packager build system.

Each check should be run against **both** OLD and NEW build artifacts and the results compared. Differences should be analyzed to determine whether they are expected (e.g., timestamp changes) or represent regressions.

### Notation

- `OLD_DIR` = output directory from old build (e.g., `app/dist-old/`)
- `NEW_DIR` = output directory from new build (e.g., `app/dist/`)
- `OLD_APP` = path to the unpacked application directory
- `NEW_APP` = path to the unpacked application directory

---

## 1. Pre-Build Step Verification

### 1.1 Commit Hash Injection

**What:** The old build injected a git commit hash via `runWriteCommitHashIntoPackage` in the afterCopy hook. The new build uses `scripts/inject-commit-hash.js` as a pre-build step.

| # | Check | Command / Method | Expected Result |
|---|-------|-----------------|-----------------|
| 1.1.1 | Commit hash present in bundled package.json | `cat {APP}/resources/app/package.json \| jq .commitHash` (or extract from ASAR: `npx asar extract {APP}/resources/app.asar /tmp/asar-check && cat /tmp/asar-check/package.json \| jq .commitHash`) | 8-character hex string matching `git rev-parse HEAD \| cut -c1-8` |
| 1.1.2 | Placeholder NOT present | `grep -r "COMMIT_INSERTED_DURING_PACKAGING" {APP}/resources/` | No matches |
| 1.1.3 | Hash is identical between old and new | Compare outputs of 1.1.1 | Must match (same git HEAD) |

### 1.2 TypeScript Compilation

**What:** The old build transpiled TypeScript in the afterCopy hook via `runTranspilers`. The new build uses `scripts/compile-typescript.js` as a pre-build step.

| # | Check | Command / Method | Expected Result |
|---|-------|-----------------|-----------------|
| 1.2.1 | No .ts/.tsx/.jsx files in final app | `npx asar list {APP}/resources/app.asar \| grep -E '\.(ts\|tsx\|jsx)$' \| grep -v '\.d\.ts$'` | No matches (only .js and .d.ts allowed) |
| 1.2.2 | .js files exist for all expected modules | `npx asar list {APP}/resources/app.asar \| grep -E '(src\|internal_packages).*\.js$' \| wc -l` | Non-zero count, matching between old and new |
| 1.2.3 | Transpiled JS content is equivalent | Extract ASAR from both, diff representative files: `diff <(cat old/src/browser/main.js) <(cat new/src/browser/main.js)` | Identical or semantically equivalent |
| 1.2.4 | Source maps present (inline) | `grep -c 'sourceMappingURL=data:' {extracted}/src/flux/actions.js` | Count > 0 (inlineSourceMap: true in tsconfig) |

---

## 2. ASAR Archive Verification

### 2.1 ASAR Structure

| # | Check | Command / Method | Expected Result |
|---|-------|-----------------|-----------------|
| 2.1.1 | ASAR file exists | `ls -la {APP}/resources/app.asar` | File exists, non-zero size |
| 2.1.2 | ASAR unpacked directory exists | `ls -d {APP}/resources/app.asar.unpacked/` | Directory exists |
| 2.1.3 | File listing comparison | `npx asar list {OLD_APP}/resources/app.asar > /tmp/old-asar.txt && npx asar list {NEW_APP}/resources/app.asar > /tmp/new-asar.txt && diff /tmp/old-asar.txt /tmp/new-asar.txt` | Identical or expected differences only |
| 2.1.4 | ASAR size comparison | `ls -la {OLD_APP}/resources/app.asar && ls -la {NEW_APP}/resources/app.asar` | Within 5% of each other |

### 2.2 ASAR Unpack Rules

The following files MUST be outside the ASAR (in `app.asar.unpacked/`):

| # | Check | Command / Method | Expected Result |
|---|-------|-----------------|-----------------|
| 2.2.1 | mailsync binary unpacked | `ls {APP}/resources/app.asar.unpacked/mailsync*` | Binary exists with execute permission |
| 2.2.2 | Native .node modules unpacked | `find {APP}/resources/app.asar.unpacked/ -name '*.node'` | At least 1 .node file found |
| 2.2.3 | Shared libraries unpacked | `find {APP}/resources/app.asar.unpacked/ -name '*.so' -o -name '*.so.*' -o -name '*.dll'` | Native libs present (platform-dependent) |
| 2.2.4 | Spellchecker unpacked | `ls -d {APP}/resources/app.asar.unpacked/node_modules/spellchecker/` | Directory exists |
| 2.2.5 | Vendor directory unpacked | `find {APP}/resources/app.asar.unpacked/ -path '*/vendor/*' -type f` | Files present if vendor dir exists |
| 2.2.6 | Task files unpacked | `find {APP}/resources/app.asar.unpacked/ -path '*/src/tasks/*'` | Task source files present |
| 2.2.7 | Extensions directory unpacked | `ls -d {APP}/resources/app.asar.unpacked/static/extensions/` | Directory exists |
| 2.2.8 | Licenses file unpacked | `ls {APP}/resources/app.asar.unpacked/static/all_licenses.html` | File exists |
| 2.2.9 | quickpreview unpacked | `find {APP}/resources/app.asar.unpacked/ -path '*/src/quickpreview/*'` | Files present |
| 2.2.10 | Compare unpacked file lists | `find {OLD_APP}/resources/app.asar.unpacked/ -type f \| sort > /tmp/old-unpacked.txt && find {NEW_APP}/resources/app.asar.unpacked/ -type f \| sort > /tmp/new-unpacked.txt && diff /tmp/old-unpacked.txt /tmp/new-unpacked.txt` | Identical or expected differences |

### 2.3 File Exclusion Rules

These files MUST NOT be in the ASAR or unpacked directory:

| # | Check | Command / Method | Expected Result |
|---|-------|-----------------|-----------------|
| 2.3.1 | No spec/ directory | `npx asar list {APP}/resources/app.asar \| grep '^/spec/'` | No matches |
| 2.3.2 | No build/ directory | `npx asar list {APP}/resources/app.asar \| grep '^/build/'` | No matches |
| 2.3.3 | No .md files | `npx asar list {APP}/resources/app.asar \| grep '\.md$'` | No matches |
| 2.3.4 | No .log files | `npx asar list {APP}/resources/app.asar \| grep '\.log$'` | No matches |
| 2.3.5 | No test directories in node_modules | `npx asar list {APP}/resources/app.asar \| grep 'node_modules/.*/tests\?/'` | No matches |
| 2.3.6 | No .h/.cc source files | `npx asar list {APP}/resources/app.asar \| grep -E '\.(h\|cc)$'` | No matches |
| 2.3.7 | No docs/dist directories | `npx asar list {APP}/resources/app.asar \| grep '^/docs/'` | No matches |
| 2.3.8 | No .gyp/.gypi build files | `npx asar list {APP}/resources/app.asar \| grep -E '\.(gyp\|gypi)$'` | No matches |

---

## 3. macOS Verification

### 3.1 Application Bundle Structure

| # | Check | Command / Method | Expected Result |
|---|-------|-----------------|-----------------|
| 3.1.1 | .app bundle exists | `ls -d {DIR}/mac*/Mailspring.app/` | Directory exists |
| 3.1.2 | Info.plist exists | `ls {APP}/Contents/Info.plist` | File exists |
| 3.1.3 | Main executable exists | `ls {APP}/Contents/MacOS/Mailspring` | Executable file |
| 3.1.4 | Frameworks directory exists | `ls -d {APP}/Contents/Frameworks/` | Contains Electron framework |

### 3.2 Info.plist Keys

Extract and compare critical keys from `Info.plist`:

| # | Check | Command / Method | Expected Result |
|---|-------|-----------------|-----------------|
| 3.2.1 | Bundle identifier | `defaults read {APP}/Contents/Info.plist CFBundleIdentifier` | `com.mailspring.mailspring` |
| 3.2.2 | Bundle name | `defaults read {APP}/Contents/Info.plist CFBundleName` | `Mailspring` |
| 3.2.3 | Bundle version | `defaults read {APP}/Contents/Info.plist CFBundleShortVersionString` | `1.19.0` |
| 3.2.4 | App category | `defaults read {APP}/Contents/Info.plist LSApplicationCategoryType` | `public.app-category.business` |
| 3.2.5 | Principal class (from extra.plist) | `defaults read {APP}/Contents/Info.plist NSPrincipalClass` | `AtomApplication` |
| 3.2.6 | Focus status description | `defaults read {APP}/Contents/Info.plist NSFocusStatusUsageDescription` | String mentioning "Focus mode" and "Do Not Disturb" |
| 3.2.7 | URL schemes registered | `/usr/libexec/PlistBuddy -c "Print :CFBundleURLTypes" {APP}/Contents/Info.plist` | Contains `mailspring` and `mailto` schemes |
| 3.2.8 | Document types | `/usr/libexec/PlistBuddy -c "Print :CFBundleDocumentTypes" {APP}/Contents/Info.plist` | Contains document type with `LSHandlerRank = Alternate` |
| 3.2.9 | Copyright string | `defaults read {APP}/Contents/Info.plist NSHumanReadableCopyright` | `Copyright (C) 2014-2026 Foundry 376, LLC. All rights reserved.` |
| 3.2.10 | Full plist diff | `diff <(defaults read {OLD_APP}/Contents/Info.plist) <(defaults read {NEW_APP}/Contents/Info.plist)` | Identical or expected diffs only |

### 3.3 Code Signing

| # | Check | Command / Method | Expected Result |
|---|-------|-----------------|-----------------|
| 3.3.1 | App is signed | `codesign -dv --verbose=4 {APP} 2>&1` | Shows signing identity, no errors |
| 3.3.2 | Signing identity matches | `codesign -dv {APP} 2>&1 \| grep "Authority="` | Same signing authority chain in old and new |
| 3.3.3 | Team identifier | `codesign -dv {APP} 2>&1 \| grep "TeamIdentifier="` | `X9RJ36K9D4` |
| 3.3.4 | Hardened runtime enabled | `codesign -dv --verbose=4 {APP} 2>&1 \| grep "flags="` | Contains `runtime` flag |
| 3.3.5 | Verify signature validity | `codesign --verify --deep --strict {APP}` | Exit code 0, no errors |
| 3.3.6 | Gatekeeper assessment | `spctl --assess --type execute {APP}` | `accepted` (requires notarization) |

### 3.4 Entitlements

| # | Check | Command / Method | Expected Result |
|---|-------|-----------------|-----------------|
| 3.4.1 | Main app entitlements | `codesign -d --entitlements - {APP} 2>&1` | Contains all entitlements from entitlements.plist |
| 3.4.2 | Application identifier | (from 3.4.1 output) | `X9RJ36K9D4.com.mailspring.mailspring` |
| 3.4.3 | Team identifier entitlement | (from 3.4.1 output) | `X9RJ36K9D4` |
| 3.4.4 | Keychain access groups | (from 3.4.1 output) | `X9RJ36K9D4.*` |
| 3.4.5 | Communication notifications | (from 3.4.1 output) | `com.apple.developer.usernotifications.communication = true` |
| 3.4.6 | Time-sensitive notifications | (from 3.4.1 output) | `com.apple.developer.usernotifications.time-sensitive = true` |
| 3.4.7 | Apple Events automation | (from 3.4.1 output) | `com.apple.security.automation.apple-events = true` |
| 3.4.8 | JIT allowed | (from 3.4.1 output) | `com.apple.security.cs.allow-jit = true` |
| 3.4.9 | Network client/server | (from 3.4.1 output) | Both `network.client` and `network.server = true` |
| 3.4.10 | Printer access | (from 3.4.1 output) | `com.apple.security.device.print = true` |
| 3.4.11 | Helper process entitlements | `codesign -d --entitlements - {APP}/Contents/Frameworks/Mailspring\ Helper.app 2>&1` | Contains only child entitlements (subset: apple-events, jit, print, network) |
| 3.4.12 | Helper must NOT have keychain | (from 3.4.11 output) | No `keychain-access-groups` entry |
| 3.4.13 | Helper must NOT have notifications | (from 3.4.11 output) | No `usernotifications` entries |
| 3.4.14 | Entitlements diff (main) | `diff <(codesign -d --entitlements - {OLD_APP}) <(codesign -d --entitlements - {NEW_APP})` | Identical |
| 3.4.15 | Entitlements diff (helper) | Compare helper entitlements between old and new | Identical |

### 3.5 Provisioning Profile

| # | Check | Command / Method | Expected Result |
|---|-------|-----------------|-----------------|
| 3.5.1 | Profile embedded | `ls {APP}/Contents/embedded.provisionprofile` | File exists (if signing enabled) |
| 3.5.2 | Profile validity | `security cms -D -i {APP}/Contents/embedded.provisionprofile` | Valid XML with team ID and app ID |
| 3.5.3 | Profile team ID | (from 3.5.2 output, check TeamIdentifier) | `X9RJ36K9D4` |
| 3.5.4 | Profile app ID | (from 3.5.2 output, check application-identifier) | `X9RJ36K9D4.com.mailspring.mailspring` |
| 3.5.5 | Profile expiry | (from 3.5.2 output, check ExpirationDate) | Not expired |
| 3.5.6 | Profile comparison | `diff <(security cms -D -i {OLD_APP}/...) <(security cms -D -i {NEW_APP}/...)` | Identical (same profile used) |

### 3.6 Notarization

| # | Check | Command / Method | Expected Result |
|---|-------|-----------------|-----------------|
| 3.6.1 | Notarization ticket stapled | `stapler validate {APP}` | `The validate action worked!` |
| 3.6.2 | Notarization status | `xcrun notarytool history --apple-id $APPLE_ID --password $APPLE_ID_PASSWORD --team-id $APPLE_TEAM_ID` | Shows accepted submission |
| 3.6.3 | Gatekeeper passes | `spctl --assess --type execute --verbose {APP}` | `source=Notarized Developer ID` |

### 3.7 DMG Verification

| # | Check | Command / Method | Expected Result |
|---|-------|-----------------|-----------------|
| 3.7.1 | DMG file exists | `ls {DIR}/Mailspring*.dmg` | File exists |
| 3.7.2 | DMG mounts | `hdiutil attach {DIR}/Mailspring*.dmg -mountpoint /tmp/dmg-check` | Mounts successfully |
| 3.7.3 | App bundle in DMG | `ls /tmp/dmg-check/Mailspring.app` | Exists |
| 3.7.4 | DMG background image | `ls /tmp/dmg-check/.background/` | Background image present |
| 3.7.5 | DMG is NOT signed | `codesign -dv {DIR}/Mailspring*.dmg 2>&1` | No signing (dmg.sign: false) |
| 3.7.6 | DMG size comparison | `ls -la {OLD_DIR}/*.dmg && ls -la {NEW_DIR}/*.dmg` | Within 10% of each other |

### 3.8 ZIP Verification

| # | Check | Command / Method | Expected Result |
|---|-------|-----------------|-----------------|
| 3.8.1 | ZIP file exists | `ls {DIR}/Mailspring*.zip` | File exists |
| 3.8.2 | ZIP contains app | `unzip -l {DIR}/Mailspring*.zip \| head -20` | Contains `Mailspring.app/` |
| 3.8.3 | ZIP app is signed | Extract and verify: `codesign --verify --deep {extracted}/Mailspring.app` | Valid signature |
| 3.8.4 | ZIP size comparison | `ls -la {OLD_DIR}/*.zip && ls -la {NEW_DIR}/*.zip` | Within 10% |

### 3.9 Architecture

| # | Check | Command / Method | Expected Result |
|---|-------|-----------------|-----------------|
| 3.9.1 | Main binary architecture | `file {APP}/Contents/MacOS/Mailspring` | Same arch (x64 or arm64) in both old and new |
| 3.9.2 | Framework architecture | `file {APP}/Contents/Frameworks/Electron\ Framework.framework/Electron\ Framework` | Same arch |
| 3.9.3 | mailsync architecture | `file {APP}/resources/app.asar.unpacked/mailsync` | Same arch |

---

## 4. Windows Verification

### 4.1 Unpacked Application Structure

| # | Check | Command / Method | Expected Result |
|---|-------|-----------------|-----------------|
| 4.1.1 | Unpacked dir exists | `ls {DIR}/win-unpacked/` (new) or `ls {DIR}/mailspring-win32-x64/` (old) | Directory exists |
| 4.1.2 | Main executable | `ls {WINAPP}/mailspring.exe` | File exists |
| 4.1.3 | Resources directory | `ls {WINAPP}/resources/app.asar` | ASAR file exists |
| 4.1.4 | Electron DLLs present | `ls {WINAPP}/*.dll \| wc -l` | Multiple DLLs present |

### 4.2 Windows Resource Files

These files must exist alongside (or within) the application directory:

| # | Check | Command / Method | Expected Result |
|---|-------|-----------------|-----------------|
| 4.2.1 | Registry file: mailto registration | `ls {WINAPP}/mailspring-mailto-registration.reg` | File exists |
| 4.2.2 | Registry file: mailto default | `ls {WINAPP}/mailspring-mailto-default.reg` | File exists |
| 4.2.3 | Visual Elements manifest | `ls {WINAPP}/mailspring.VisualElementsManifest.xml` | File exists |
| 4.2.4 | Tile image 150px | `ls {WINAPP}/mailspring-150px.png` | File exists |
| 4.2.5 | Tile image 75px | `ls {WINAPP}/mailspring-75px.png` | File exists |
| 4.2.6 | Elevation helper CMD | `ls {WINAPP}/elevate.cmd` | File exists |
| 4.2.7 | Elevation helper VBS | `ls {WINAPP}/elevate.vbs` | File exists |
| 4.2.8 | File content comparison | `diff {OLD_WINAPP}/mailspring-mailto-registration.reg {NEW_WINAPP}/mailspring-mailto-registration.reg` | Identical content |
| 4.2.9 | Visual Elements content | `diff {OLD_WINAPP}/mailspring.VisualElementsManifest.xml {NEW_WINAPP}/mailspring.VisualElementsManifest.xml` | Identical |
| 4.2.10 | Elevation script content | `diff {OLD_WINAPP}/elevate.vbs {NEW_WINAPP}/elevate.vbs` | Identical |

### 4.3 Windows Code Signing

| # | Check | Command / Method | Expected Result |
|---|-------|-----------------|-----------------|
| 4.3.1 | EXE is signed | `signtool verify /pa /v {WINAPP}/mailspring.exe` (or PowerShell: `Get-AuthenticodeSignature`) | Valid signature |
| 4.3.2 | Signing certificate subject | `signtool verify /pa /v {WINAPP}/mailspring.exe \| findstr "Issued to"` | `Foundry 376, LLC` |
| 4.3.3 | Timestamp present | `signtool verify /pa /v {WINAPP}/mailspring.exe \| findstr "Timestamp"` | Valid timestamp |
| 4.3.4 | Signature comparison | Compare signing details between old and new | Same certificate authority, same subject |

### 4.4 Windows EXE Metadata

| # | Check | Command / Method | Expected Result |
|---|-------|-----------------|-----------------|
| 4.4.1 | File description | PowerShell: `(Get-Item {WINAPP}/mailspring.exe).VersionInfo.FileDescription` | `Mailspring` |
| 4.4.2 | Company name | `.VersionInfo.CompanyName` | `Foundry 376, LLC` |
| 4.4.3 | Product name | `.VersionInfo.ProductName` | `Mailspring` |
| 4.4.4 | Legal copyright | `.VersionInfo.LegalCopyright` | `Copyright (C) 2014-2026 Foundry 376, LLC. All rights reserved.` |
| 4.4.5 | Product version | `.VersionInfo.ProductVersion` | `1.19.0` |
| 4.4.6 | Metadata comparison | Compare all VersionInfo fields between old and new | Identical |

### 4.5 NSIS Installer (New) vs Squirrel Installer (Old)

> **Note:** The old build used `electron-winstaller` (Squirrel.Windows) producing `MailspringSetup.exe`. The new build uses NSIS. These are fundamentally different installer technologies, so direct binary comparison is not possible. Instead, verify equivalent end-user behavior.

| # | Check | Command / Method | Expected Result |
|---|-------|-----------------|-----------------|
| 4.5.1 | Installer file exists | `ls {DIR}/Mailspring*.exe` (installer, not the app exe) | File exists |
| 4.5.2 | Installer is signed | `signtool verify /pa {DIR}/Mailspring*.exe` | Valid signature |
| 4.5.3 | Installer icon | Visual inspection or resource extraction | Mailspring icon (mailspring-square.ico) |
| 4.5.4 | Install creates app dir | Run installer, check `%LOCALAPPDATA%\Programs\Mailspring\` or chosen dir | Application installed correctly |
| 4.5.5 | Registry entries created | `reg query "HKCU\SOFTWARE\Classes\mailspring"` after install | Protocol handler registered |
| 4.5.6 | mailto handler available | `reg query "HKCU\SOFTWARE\Clients\Mail\Mailspring"` after install | Mail client registered |
| 4.5.7 | Uninstaller works | Run uninstaller from Add/Remove Programs | Clean removal |
| 4.5.8 | Resource files deployed | Check installed directory for .reg, .vbs, .xml, .png files | All present |

### 4.6 Windows Architecture

| # | Check | Command / Method | Expected Result |
|---|-------|-----------------|-----------------|
| 4.6.1 | EXE architecture | `dumpbin /headers {WINAPP}/mailspring.exe \| findstr "machine"` or `file mailspring.exe` | x64 (AMD64) |
| 4.6.2 | Architecture matches old | Compare architecture of both builds | Both x64 |

---

## 5. Linux Verification

### 5.1 DEB Package Verification

#### 5.1.1 Package Metadata

| # | Check | Command / Method | Expected Result |
|---|-------|-----------------|-----------------|
| 5.1.1.1 | DEB file exists | `ls {DIR}/mailspring*amd64.deb` | File exists |
| 5.1.1.2 | Package name | `dpkg-deb -f {DEB} Package` | `mailspring` |
| 5.1.1.3 | Version | `dpkg-deb -f {DEB} Version` | `1.19.0` |
| 5.1.1.4 | Architecture | `dpkg-deb -f {DEB} Architecture` | `amd64` |
| 5.1.1.5 | Section | `dpkg-deb -f {DEB} Section` | `mail` |
| 5.1.1.6 | Maintainer | `dpkg-deb -f {DEB} Maintainer` | Contains `Mailspring` |
| 5.1.1.7 | Description | `dpkg-deb -f {DEB} Description` | Non-empty, mentions email |
| 5.1.1.8 | Full control diff | `diff <(dpkg-deb -f {OLD_DEB}) <(dpkg-deb -f {NEW_DEB})` | Identical or expected differences |

#### 5.1.2 Dependencies

| # | Check | Command / Method | Expected Result |
|---|-------|-----------------|-----------------|
| 5.1.2.1 | Dependencies field | `dpkg-deb -f {DEB} Depends` | Contains all required deps |
| 5.1.2.2 | libasound2 | (from Depends field) | `libasound2t64 \| libasound2` present |
| 5.1.2.3 | libcurl | (from Depends field) | `libcurl4t64 \| libcurl4` present |
| 5.1.2.4 | libgtk-3 | (from Depends field) | `libgtk-3-0t64 (>=3.10.0) \| libgtk-3-0` present |
| 5.1.2.5 | libnss3 | (from Depends field) | `libnss3` present |
| 5.1.2.6 | libsecret | (from Depends field) | `libsecret-1-0` present |
| 5.1.2.7 | libsasl2 | (from Depends field) | `libsasl2-2` present |
| 5.1.2.8 | libssl | (from Depends field) | `libssl3` present |
| 5.1.2.9 | libtidy | (from Depends field) | `libtidy5deb1 \| libtidy58` present |
| 5.1.2.10 | xdg-utils | (from Depends field) | `xdg-utils` present |
| 5.1.2.11 | libnotify4 | (from Depends field) | `libnotify4` present |
| 5.1.2.12 | Recommends | `dpkg-deb -f {DEB} Recommends` | `gir1.2-gnomekeyring-1.0` |
| 5.1.2.13 | Dep comparison | `diff <(dpkg-deb -f {OLD_DEB} Depends \| tr ',' '\n' \| sort) <(dpkg-deb -f {NEW_DEB} Depends \| tr ',' '\n' \| sort)` | Identical |

#### 5.1.3 DEB Contents

| # | Check | Command / Method | Expected Result |
|---|-------|-----------------|-----------------|
| 5.1.3.1 | File listing | `dpkg-deb -c {DEB} \| head -50` | Shows install paths |
| 5.1.3.2 | Main binary | `dpkg-deb -c {DEB} \| grep 'usr/share/mailspring/mailspring$'` | Present |
| 5.1.3.3 | Symlink in /usr/bin | `dpkg-deb -c {DEB} \| grep 'usr/bin/mailspring'` | Symlink to `../share/mailspring/mailspring` |
| 5.1.3.4 | Desktop file | `dpkg-deb -c {DEB} \| grep '\.desktop$'` | `usr/share/applications/mailspring.desktop` |
| 5.1.3.5 | AppData/metainfo | `dpkg-deb -c {DEB} \| grep -E '(appdata\|metainfo).*mailspring'` | Metadata XML present |
| 5.1.3.6 | Copyright file | `dpkg-deb -c {DEB} \| grep copyright` | `usr/share/doc/mailspring/copyright` |
| 5.1.3.7 | File count comparison | `dpkg-deb -c {OLD_DEB} \| wc -l && dpkg-deb -c {NEW_DEB} \| wc -l` | Within 5% of each other |

#### 5.1.4 DEB Icons

| # | Check | Command / Method | Expected Result |
|---|-------|-----------------|-----------------|
| 5.1.4.1 | 16x16 icon | `dpkg-deb -c {DEB} \| grep 'icons/hicolor/16x16'` | Present |
| 5.1.4.2 | 32x32 icon | `dpkg-deb -c {DEB} \| grep 'icons/hicolor/32x32'` | Present |
| 5.1.4.3 | 64x64 icon | `dpkg-deb -c {DEB} \| grep 'icons/hicolor/64x64'` | Present |
| 5.1.4.4 | 128x128 icon | `dpkg-deb -c {DEB} \| grep 'icons/hicolor/128x128'` | Present |
| 5.1.4.5 | 256x256 icon | `dpkg-deb -c {DEB} \| grep 'icons/hicolor/256x256'` | Present |
| 5.1.4.6 | 512x512 icon | `dpkg-deb -c {DEB} \| grep 'icons/hicolor/512x512'` | Present |
| 5.1.4.7 | All 6 sizes present | Count icon entries | 6 icon sizes |

#### 5.1.5 DEB Maintainer Scripts

| # | Check | Command / Method | Expected Result |
|---|-------|-----------------|-----------------|
| 5.1.5.1 | postinst exists | `dpkg-deb --ctrl-tarfile {DEB} \| tar -t \| grep postinst` | Present |
| 5.1.5.2 | postinst sets sandbox perms | `dpkg-deb --ctrl-tarfile {DEB} \| tar -xO ./postinst \| grep 'chmod.*4755.*chrome-sandbox'` | Permission setting present |
| 5.1.5.3 | postinst updates icon cache | `dpkg-deb --ctrl-tarfile {DEB} \| tar -xO ./postinst \| grep 'gtk-update-icon-cache'` | Icon cache update present |
| 5.1.5.4 | postrm exists | `dpkg-deb --ctrl-tarfile {DEB} \| tar -t \| grep postrm` | Present |
| 5.1.5.5 | Lintian overrides | `dpkg-deb -c {DEB} \| grep lintian` | Override file present |
| 5.1.5.6 | Script comparison | Extract and diff maintainer scripts from old and new | Identical or expected differences |

#### 5.1.6 Chrome Sandbox Permissions

| # | Check | Command / Method | Expected Result |
|---|-------|-----------------|-----------------|
| 5.1.6.1 | Sandbox binary in package | `dpkg-deb -c {DEB} \| grep chrome-sandbox` | Present |
| 5.1.6.2 | After install: setuid bit | `stat -c '%a' /usr/share/mailspring/chrome-sandbox` (after install) | `4755` (setuid) |

### 5.2 RPM Package Verification

#### 5.2.1 Package Metadata

| # | Check | Command / Method | Expected Result |
|---|-------|-----------------|-----------------|
| 5.2.1.1 | RPM file exists | `ls {DIR}/mailspring*.x86_64.rpm` | File exists |
| 5.2.1.2 | Package name | `rpm -qp --queryformat '%{NAME}' {RPM}` | `mailspring` |
| 5.2.1.3 | Version | `rpm -qp --queryformat '%{VERSION}' {RPM}` | `1.19.0` |
| 5.2.1.4 | Architecture | `rpm -qp --queryformat '%{ARCH}' {RPM}` | `x86_64` |
| 5.2.1.5 | License | `rpm -qp --queryformat '%{LICENSE}' {RPM}` | `GPLv3` or `GPL-3.0+` |
| 5.2.1.6 | URL | `rpm -qp --queryformat '%{URL}' {RPM}` | `https://getmailspring.com/` |
| 5.2.1.7 | Description | `rpm -qp --queryformat '%{DESCRIPTION}' {RPM}` | Non-empty, mentions email |

#### 5.2.2 RPM Dependencies

| # | Check | Command / Method | Expected Result |
|---|-------|-----------------|-----------------|
| 5.2.2.1 | Required deps | `rpm -qp --requires {RPM}` | Contains libsecret, libXScrnSaver, libcurl, etc. |
| 5.2.2.2 | Dep comparison | `diff <(rpm -qp --requires {OLD_RPM} \| sort) <(rpm -qp --requires {NEW_RPM} \| sort)` | Identical or expected differences |

#### 5.2.3 RPM Contents

| # | Check | Command / Method | Expected Result |
|---|-------|-----------------|-----------------|
| 5.2.3.1 | File listing | `rpm -qpl {RPM} \| head -50` | Shows install paths |
| 5.2.3.2 | Main binary | `rpm -qpl {RPM} \| grep 'usr/share/mailspring/mailspring$'` | Present |
| 5.2.3.3 | Symlink in /usr/bin | `rpm -qpl {RPM} \| grep 'usr/bin/mailspring'` | Present |
| 5.2.3.4 | Desktop file | `rpm -qpl {RPM} \| grep '\.desktop$'` | Present |
| 5.2.3.5 | Icons (6 sizes) | `rpm -qpl {RPM} \| grep 'icons/hicolor' \| wc -l` | 6 entries |
| 5.2.3.6 | AppData | `rpm -qpl {RPM} \| grep -E '(appdata\|metainfo)'` | Present |
| 5.2.3.7 | File count comparison | `rpm -qpl {OLD_RPM} \| wc -l && rpm -qpl {NEW_RPM} \| wc -l` | Within 5% |

#### 5.2.4 RPM Scripts

| # | Check | Command / Method | Expected Result |
|---|-------|-----------------|-----------------|
| 5.2.4.1 | Post-install script | `rpm -qp --scripts {RPM} \| grep -A20 'postinstall'` | Contains chrome-sandbox chmod and icon cache update |
| 5.2.4.2 | build_id_links disabled | `rpm -qp --queryformat '%{BUILDARCHS}' {RPM}` or check spec | `_build_id_links none` applied |
| 5.2.4.3 | Script comparison | `diff <(rpm -qp --scripts {OLD_RPM}) <(rpm -qp --scripts {NEW_RPM})` | Identical or expected differences |

### 5.3 Desktop File Verification

| # | Check | Command / Method | Expected Result |
|---|-------|-----------------|-----------------|
| 5.3.1 | Extract desktop file | Extract from DEB/RPM or read from installed location | File exists |
| 5.3.2 | Exec line | `grep '^Exec=' mailspring.desktop` | `mailspring %U` |
| 5.3.3 | Icon | `grep '^Icon=' mailspring.desktop` | `mailspring` |
| 5.3.4 | Categories | `grep '^Categories=' mailspring.desktop` | Contains `Network` and `Email` |
| 5.3.5 | MIME types | `grep '^MimeType=' mailspring.desktop` | `x-scheme-handler/mailto;x-scheme-handler/mailspring;` |
| 5.3.6 | Desktop Actions | `grep '^\[Desktop Action' mailspring.desktop` | `[Desktop Action NewMessage]` present |
| 5.3.7 | Translations present | `grep '^Name\[' mailspring.desktop \| wc -l` | Multiple translations (112+ in original) |
| 5.3.8 | Validate desktop file | `desktop-file-validate mailspring.desktop` | No errors |
| 5.3.9 | Desktop file diff | `diff {old}/mailspring.desktop {new}/mailspring.desktop` | Identical |

### 5.4 AppData/Metainfo Verification

| # | Check | Command / Method | Expected Result |
|---|-------|-----------------|-----------------|
| 5.4.1 | Extract metainfo | Extract from DEB/RPM | File exists |
| 5.4.2 | Component type | `grep '<component type=' mailspring.appdata.xml` | `type="desktop"` |
| 5.4.3 | License | `grep '<project_license>' mailspring.appdata.xml` | `GPL-3.0+` |
| 5.4.4 | Homepage URL | `grep '<url type="homepage">' mailspring.appdata.xml` | `https://getmailspring.com/` |
| 5.4.5 | VCS browser | `grep '<url type="vcs-browser">' mailspring.appdata.xml` | GitHub URL |
| 5.4.6 | Release entries | `grep '<release ' mailspring.appdata.xml \| wc -l` | 32+ release entries |
| 5.4.7 | Latest release version | `grep '<release ' mailspring.appdata.xml \| head -1` | `version="1.19.0"` |
| 5.4.8 | Content rating | `grep 'content_rating' mailspring.appdata.xml` | OARS 1.0 rating present |
| 5.4.9 | Validate appdata | `appstream-util validate mailspring.appdata.xml` | No errors |
| 5.4.10 | AppData diff | `diff {old}/mailspring.appdata.xml {new}/mailspring.appdata.xml` | Identical |

---

## 6. Cross-Platform Checks

### 6.1 Version Consistency

| # | Check | Command / Method | Expected Result |
|---|-------|-----------------|-----------------|
| 6.1.1 | macOS version | `defaults read {APP}/Contents/Info.plist CFBundleShortVersionString` | `1.19.0` |
| 6.1.2 | Windows version | `(Get-Item mailspring.exe).VersionInfo.ProductVersion` | `1.19.0` |
| 6.1.3 | DEB version | `dpkg-deb -f {DEB} Version` | `1.19.0` |
| 6.1.4 | RPM version | `rpm -qp --queryformat '%{VERSION}' {RPM}` | `1.19.0` |
| 6.1.5 | All match | Compare 6.1.1 through 6.1.4 | All identical |

### 6.2 Protocol Handler Registration

| # | Check | Command / Method | Expected Result |
|---|-------|-----------------|-----------------|
| 6.2.1 | macOS: mailspring:// | Check Info.plist `CFBundleURLTypes` | `mailspring` scheme registered |
| 6.2.2 | macOS: mailto: | Check Info.plist `CFBundleURLTypes` | `mailto` scheme registered |
| 6.2.3 | Windows: mailspring:// | Check registry after install | Protocol handler registered |
| 6.2.4 | Windows: mailto: | Check registry `Clients\Mail\Mailspring` | Mail client registered |
| 6.2.5 | Linux: mailspring:// | Check desktop file MimeType | `x-scheme-handler/mailspring` |
| 6.2.6 | Linux: mailto: | Check desktop file MimeType | `x-scheme-handler/mailto` |

### 6.3 Electron Version

| # | Check | Command / Method | Expected Result |
|---|-------|-----------------|-----------------|
| 6.3.1 | macOS Electron version | `{APP}/Contents/Frameworks/Electron\ Framework.framework/Versions/A/Electron\ Framework --version` or check plist | `39.2.7` |
| 6.3.2 | Windows Electron version | Check `mailspring.exe` version resources or `version` file | `39.2.7` |
| 6.3.3 | Linux Electron version | Check binary or version file | `39.2.7` |
| 6.3.4 | Consistent across platforms | Compare 6.3.1–6.3.3 | All identical |
| 6.3.5 | Matches old build | Compare with old build Electron version | Identical |

### 6.4 Application Size Comparison

| # | Check | Command / Method | Expected Result |
|---|-------|-----------------|-----------------|
| 6.4.1 | macOS .app size | `du -sh {APP}` | Within 15% of old build |
| 6.4.2 | Windows unpacked size | `du -sh {WINAPP}` (or Get-ChildItem -Recurse \| Measure-Object) | Within 15% of old build |
| 6.4.3 | Linux installed size | `dpkg-deb -f {DEB} Installed-Size` | Within 15% of old build |
| 6.4.4 | ASAR size | `ls -la {APP}/resources/app.asar` | Within 10% of old build |

---

## 7. Functional Smoke Tests

After verifying artifacts structurally, run these smoke tests on both old and new builds:

### 7.1 Application Launch

| # | Check | Method | Expected Result |
|---|-------|--------|-----------------|
| 7.1.1 | App launches without crash | Start application | Main window appears |
| 7.1.2 | No console errors on startup | Check dev tools console | No critical errors |
| 7.1.3 | Correct version shown | Check About dialog or menu | `1.19.0` displayed |
| 7.1.4 | Correct commit hash | Check About dialog or devtools `$m.AppVersion` | 8-char hash matches |

### 7.2 Core Functionality

| # | Check | Method | Expected Result |
|---|-------|--------|-----------------|
| 7.2.1 | Mailsync process starts | Check process list for `mailsync` | Process running |
| 7.2.2 | Native modules load | Attempt to use spellchecker, sqlite | No "module not found" errors |
| 7.2.3 | Internal packages load | Check for composer, thread-list, message-list | All plugins activated |
| 7.2.4 | Extensions directory accessible | Check preferences > extensions | Extension loading works |
| 7.2.5 | Protocol handler works | Open `mailspring://` URL | App responds |

---

## 8. Known Expected Differences

The following differences between old and new builds are **expected** and should NOT be treated as failures:

| Difference | Reason |
|-----------|--------|
| Installer technology (Windows): Squirrel → NSIS | Intentional migration from electron-winstaller to electron-builder NSIS |
| Windows install path: `%LOCALAPPDATA%\Mailspring` → `%LOCALAPPDATA%\Programs\Mailspring` | NSIS default vs Squirrel default |
| Windows update mechanism | Squirrel auto-update vs NSIS update (may need separate verification) |
| Build metadata in package.json | electron-builder may add/modify metadata |
| File ordering inside ASAR | Different packing algorithms may produce different ordering |
| ASAR file size | Different compression/packing may produce slightly different sizes |
| Installer file size | Different installer technology produces different sizes |
| Timestamps in packages | Build time differences |
| DMG layout/appearance | electron-builder DMG creation vs custom `create-mac-zip` task |
| Linux package maintainer scripts | electron-builder's FPM-based generation vs hand-written scripts |

---

## 9. Verification Execution Checklist

### Pre-requisites
- [ ] Old build artifacts available at `OLD_DIR`
- [ ] New build artifacts available at `NEW_DIR`
- [ ] Both builds used same git commit (or same `COMMIT_INSERTED_DURING_PACKAGING`)
- [ ] Both builds used same Electron version (39.2.7)
- [ ] Same code signing certificates/profiles used for both (if signing enabled)
- [ ] Required tools installed: `codesign`, `dpkg-deb`, `rpm`, `npx asar`, `signtool` (as applicable)

### Execution Order
1. **Section 1** (Pre-build steps) - verify TypeScript compilation and commit hash
2. **Section 2** (ASAR) - verify archive structure and contents
3. **Section 3** (macOS) - if macOS artifacts available
4. **Section 4** (Windows) - if Windows artifacts available
5. **Section 5** (Linux) - if Linux artifacts available
6. **Section 6** (Cross-platform) - verify consistency
7. **Section 7** (Smoke tests) - functional verification
8. **Section 8** (Review known differences) - document any unexpected deltas

### Reporting

For each check, record:
- **Status**: PASS / FAIL / SKIP / EXPECTED_DIFF
- **Old value**: Value from old build
- **New value**: Value from new build
- **Notes**: Any relevant context

Flag any FAIL results for investigation before approving the migration.
