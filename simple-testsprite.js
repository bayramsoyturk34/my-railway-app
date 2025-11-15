const puppeteer = require('puppeteer');

async function testHeaderVisibility() {
  console.log('🧪 TestSprite Header Test Starting...');
  
  const browser = await puppeteer.launch({ headless: false });
  const page = await browser.newPage();
  
  try {
    // Navigate to your app
    await page.goto('https://web-production-02170.up.railway.app');
    await page.waitForLoadState('networkidle');
    
    // Check if header exists
    const header = await page.$('header');
    console.log('✅ Header exists:', !!header);
    
    // Check if puantroplus button exists  
    const puantroplusButton = await page.$('header button:has-text("puantroplus")');
    console.log('✅ Puantroplus button exists:', !!puantroplusButton);
    
    // Get actual text color
    const textColor = await page.evaluate(() => {
      const button = document.querySelector('header button');
      return window.getComputedStyle(button).color;
    });
    console.log('🎨 Current text color:', textColor);
    
    // Take screenshot for visual verification
    await page.screenshot({ path: 'header-test-result.png' });
    
    console.log('📸 Screenshot saved as header-test-result.png');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    await browser.close();
  }
}

testHeaderVisibility();