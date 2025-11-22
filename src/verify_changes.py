import time
from playwright.sync_api import sync_playwright, expect

def verify_frontend():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(viewport={'width': 1280, 'height': 800})
        page = context.new_page()

        try:
            # 1. Visit the app
            print("Navigating to app...")
            page.goto("http://localhost:5173")
            page.wait_for_load_state("networkidle")

            # Check if we are on login page
            if page.locator("text=Ψηφιακός Αλφαβητισμός").is_visible():
                print("Login page detected. Logging in...")
                page.screenshot(path="/home/jules/verification/login_page.png")

                # Login
                page.fill("input[placeholder='user01, user02, κλπ.']", "testuser")
                page.click("text=Σύνδεση / Δημιουργία Λογαριασμού")

                # Wait for navigation
                page.wait_for_load_state("networkidle")
                print("Logged in.")

            # 2. Verify Module Grid (Home Page)
            # The home page lists the modules. We should see our new Module 10 here.
            time.sleep(2) # Wait for animations
            page.screenshot(path="/home/jules/verification/modules_grid.png")
            print("Captured modules_grid.png")

            # 3. Navigate to a lesson to see the Desktop environment
            # We need to enter a lesson that uses the desktop simulation.
            # Module 9 Lesson 2 (Connect Wifi) is a good candidate as it uses Settings and Taskbar.
            # Or we can just try to find a "Module 9" card and click it.

            print("Navigating to Module 9...")
            # Using a selector based on text content might be safer if we don't know exact IDs
            # But let's assume standard layout.
            # Let's try to find a link or button with "Module 9" or similar text.
            # If not found, we might need to inspect the screenshot or source.
            # For now, let's try to find the card for Module 9.

            # Assuming cards are clickable.
            # Let's look for "Advanced" or "Εγκατάσταση" text which might be in Module 9 title/desc.
            # Based on seeds, Module 9 is "Advanced (Install, Settings)".
            # Let's click the 9th card if possible, or search by text.

            # Actually, let's try to go directly to the module page if possible.
            # Url pattern seems to be /modules/[id]
            print("Going directly to Module 9...")
            page.goto("http://localhost:5173/modules/module9")
            page.wait_for_load_state("networkidle")
            time.sleep(1)
            page.screenshot(path="/home/jules/verification/module9_page.png")

            # Now click the first lesson to open the Desktop simulation
            print("Clicking first lesson...")
            page.click("text=Εγκατάσταση Εφαρμογής") # Title of lesson 1 in Module 9
            time.sleep(2)

            # Now we should be in the desktop environment
            page.screenshot(path="/home/jules/verification/desktop_simulation.png")
            print("Captured desktop_simulation.png")

            # 4. Open Quick Settings (Taskbar)
            print("Opening Quick Settings...")
            # Locate system tray area
            # The taskbar is at the bottom.
            # We look for the button containing the Wifi icon in the bottom right.
            # Using a more specific locator if possible.
            # In Taskbar.svelte: onQuickSettingsClick is attached to a button with Wifi icon.
            # We can try to click the button that has the Wifi icon.
            page.locator(".absolute.right-0.bottom-0").click() # Click the taskbar container first to focus? No.

            # Find button with Wifi icon
            # The icon is likely an SVG.
            tray_button = page.locator("button:has(svg.lucide-wifi)")
            if tray_button.count() > 0:
                tray_button.first.click()
                time.sleep(1)
                page.screenshot(path="/home/jules/verification/quick_settings_open.png")
                print("Captured quick_settings_open.png")
            else:
                print("Could not find system tray button.")

            # 5. Verify Settings App (Uninstall section)
            # We need to open Settings app.
            # In the lesson, we might have to open it via Start Menu or it might be pinned.
            # Let's try clicking Start Menu.
            print("Opening Start Menu...")
            start_btn = page.locator("button[title='Start']")
            start_btn.click()
            time.sleep(1)
            page.screenshot(path="/home/jules/verification/start_menu_open.png")

            # Close Start menu
            start_btn.click()

        except Exception as e:
            print(f"Error: {e}")
            page.screenshot(path="/home/jules/verification/error_v2.png")
        finally:
            browser.close()

if __name__ == "__main__":
    verify_frontend()
