@echo off
rem Ανοίγει τις παρουσιασεις ΚΑΠΗ σε πληρη οθονη (offline). Διπλο κλικ.
set HERE=%~dp0
set URL=file:///%HERE%index.html
set URL=%URL:\=/%
where msedge >nul 2>nul && (start "" msedge --kiosk "%URL%" --edge-kiosk-type=fullscreen & goto :eof)
if exist "%ProgramFiles(x86)%\Microsoft\Edge\Application\msedge.exe" (start "" "%ProgramFiles(x86)%\Microsoft\Edge\Application\msedge.exe" --kiosk "%URL%" --edge-kiosk-type=fullscreen & goto :eof)
if exist "%ProgramFiles%\Google\Chrome\Application\chrome.exe" (start "" "%ProgramFiles%\Google\Chrome\Application\chrome.exe" --kiosk "%URL%" & goto :eof)
rem Εφεδρικο: ανοιγμα με τον προεπιλεγμενο περιηγητη
start "" "%HERE%index.html"
