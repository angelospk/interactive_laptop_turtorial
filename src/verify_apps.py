import time
from playwright.sync_api import sync_playwright

def verify_apps():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(viewport={'width': 1280, 'height': 800})
        page = context.new_page()

        try:
            print("Logging in...")
            page.goto("http://localhost:5173")
            page.fill("input", "testuser")
            page.click("text=Σύνδεση")
            page.wait_for_load_state("networkidle")

            # --- Email Verification ---
            print("Navigating to Email Lesson (Module 6)...")
            page.goto("http://localhost:5173/modules/module6")
            page.wait_for_load_state("networkidle")
            # Click first lesson
            page.click(".grid > button:nth-child(1)")
            time.sleep(2)

            # Open Email App (it might be open by default or we need to open it)
            # Config says targetAppId: 'email', so it should be open?
            # Or we open it from taskbar.
            print("Opening Email App...")
            # Try clicking the mail icon in taskbar
            page.locator("button:has(svg.lucide-mail)").click()
            time.sleep(1)

            # Click Compose
            print("Clicking Compose...")
            page.click("text=Σύνταξη")
            time.sleep(1)
            page.screenshot(path="/home/jules/verification/email_compose.png")
            print("Captured email_compose.png")

            # Close modal
            page.click("button:has(svg.lucide-x)")

            # --- Browser Verification ---
            # We can switch apps or go to another lesson. Let's go to another lesson.
            print("Navigating to Browser Lesson (Module 5)...")
            page.goto("http://localhost:5173/modules/module5")
            page.wait_for_load_state("networkidle")
            page.click(".grid > button:nth-child(1)")
            time.sleep(2)

            # Open Browser
            print("Opening Browser...")
            page.locator("button:has(svg.lucide-globe)").click()
            time.sleep(1)

            # Click History button (it's in the toolbar, clock icon)
            print("Clicking History...")
            # Toolbar is .flex.items-center.gap-2.border-b
            # We need the button with Clock icon.
            page.locator("button:has(svg.lucide-history)").click()
            time.sleep(1)
            page.screenshot(path="/home/jules/verification/browser_history.png")
            print("Captured browser_history.png")

        except Exception as e:
            print(f"Error: {e}")
            page.screenshot(path="/home/jules/verification/app_error.png")
        finally:
            browser.close()

if __name__ == "__main__":
    verify_apps()
