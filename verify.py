from playwright.sync_api import sync_playwright
import time
import os

with sync_playwright() as p:
    browser = p.chromium.launch()
    context = browser.new_context(record_video_dir="videos")
    page = context.new_page()
    page.goto("http://localhost:8000")

    # Wait for the WASM app to initialize and become interactive
    page.wait_for_selector("#sourceInput")

    # Type initial value
    page.fill("#sourceInput", "123")
    time.sleep(0.5)

    # Type spaces to trigger the new early return logic
    page.type("#sourceInput", "   ")
    time.sleep(0.5)

    # Verify the char count is updated correctly
    char_count = page.inner_text("#charCount")
    print(f"Char Count: {char_count}")

    # Take screenshot
    page.screenshot(path="screenshot.png")

    context.close()
    browser.close()
    print("Done")
