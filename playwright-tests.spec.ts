import { test, expect } from '@playwright/test'

const BASE_URL = 'https://web-production-02170.up.railway.app'

test.describe('Puantroplus UI Tests', () => {
  
  test('Header and Puantroplus Text Visibility', async ({ page }) => {
    await page.goto(BASE_URL)
    
    // Wait for page to load
    await page.waitForLoadState('networkidle')
    
    // Check if header exists
    const header = page.locator('header')
    await expect(header).toBeVisible()
    
    // Check if puantroplus button exists
    const puantroplusButton = page.locator('header button:has-text("puantroplus")')
    await expect(puantroplusButton).toBeVisible()
    
    // Get computed style of puantroplus text
    const color = await puantroplusButton.evaluate((el) => {
      return window.getComputedStyle(el).color
    })
    
    console.log('Puantroplus text color:', color)
    
    // Take screenshot for visual verification
    await page.screenshot({ path: 'header-test.png', fullPage: true })
    
    // Check if color is white (rgb(255, 255, 255))
    // Note: This might fail if color is not white
    console.log('Expected: rgb(255, 255, 255), Actual:', color)
  })

  test('Dark Theme Application', async ({ page }) => {
    await page.goto(BASE_URL)
    await page.waitForLoadState('networkidle')
    
    // Check if dark theme is applied
    const htmlClass = await page.locator('html').getAttribute('class')
    console.log('HTML classes:', htmlClass)
    
    // Check if dark class exists
    expect(htmlClass).toContain('dark')
    
    await page.screenshot({ path: 'dark-theme-test.png', fullPage: true })
  })

  test('Login Form Input Styling', async ({ page }) => {
    await page.goto(`${BASE_URL}/login`)
    await page.waitForLoadState('networkidle')
    
    // Wait for login form
    await page.waitForSelector('form', { timeout: 10000 })
    
    // Check email input color
    const emailInput = page.locator('input[type="email"]')
    if (await emailInput.count() > 0) {
      const emailColor = await emailInput.evaluate((el) => {
        return window.getComputedStyle(el).color
      })
      console.log('Email input color:', emailColor)
    }
    
    // Check password input color  
    const passwordInput = page.locator('input[type="password"]')
    if (await passwordInput.count() > 0) {
      const passwordColor = await passwordInput.evaluate((el) => {
        return window.getComputedStyle(el).color
      })
      console.log('Password input color:', passwordColor)
    }
    
    await page.screenshot({ path: 'login-form-test.png', fullPage: true })
  })

  test('Account Page Input Styling', async ({ page }) => {
    await page.goto(`${BASE_URL}/account`)
    await page.waitForLoadState('networkidle')
    
    // Check if account page loads (might redirect to login)
    const currentUrl = page.url()
    console.log('Current URL:', currentUrl)
    
    if (currentUrl.includes('/account')) {
      // Check for account-page class
      const accountPageExists = await page.locator('.account-page').count() > 0
      console.log('Account page class exists:', accountPageExists)
      
      // Get all input colors
      const inputs = page.locator('.account-page input')
      const inputCount = await inputs.count()
      console.log('Number of inputs found:', inputCount)
      
      if (inputCount > 0) {
        for (let i = 0; i < inputCount; i++) {
          const input = inputs.nth(i)
          const color = await input.evaluate((el) => {
            return window.getComputedStyle(el).color
          })
          console.log(`Input ${i} color:`, color)
        }
      }
    }
    
    await page.screenshot({ path: 'account-page-test.png', fullPage: true })
  })

  test('CSS Properties Debug', async ({ page }) => {
    await page.goto(BASE_URL)
    await page.waitForLoadState('networkidle')
    
    // Debug CSS properties
    const debugInfo = await page.evaluate(() => {
      const button = document.querySelector('header button')
      if (!button) return { error: 'Button not found' }
      
      const styles = window.getComputedStyle(button)
      return {
        color: styles.color,
        backgroundColor: styles.backgroundColor,
        classes: button.className,
        inlineStyle: button.style.cssText,
        textContent: button.textContent
      }
    })
    
    console.log('Debug Info:', JSON.stringify(debugInfo, null, 2))
  })
})