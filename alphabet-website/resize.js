const { Jimp } = require("jimp");

async function generateAssets() {
  console.log("Generating PWA icons...");
  
  // Read the original logo
  const logo = await Jimp.read("public/Logo.jpg");
  
  // Generate 192x192 icon
  const icon192 = logo.clone();
  icon192.cover(192, 192);
  await icon192.write("public/pwa-192x192.png");
  console.log("Generated pwa-192x192.png");
  
  // Generate 512x512 icon
  const icon512 = logo.clone();
  icon512.cover(512, 512);
  await icon512.write("public/pwa-512x512.png");
  console.log("Generated pwa-512x512.png");

  console.log("Generating PWA screenshots...");
  
  // Read a background image for screenshots
  const bg = await Jimp.read("public/hero_bg.png");
  
  // Generate Desktop Screenshot (Wide: 1280x720)
  const desktopShot = bg.clone();
  desktopShot.cover(1280, 720);
  await desktopShot.write("public/screenshot-desktop.png");
  console.log("Generated screenshot-desktop.png");

  // Generate Mobile Screenshot (Narrow: 720x1280)
  const mobileShot = bg.clone();
  mobileShot.cover(720, 1280);
  await mobileShot.write("public/screenshot-mobile.png");
  console.log("Generated screenshot-mobile.png");
  
  console.log("All assets generated successfully!");
}

generateAssets().catch(err => {
  console.error("Error generating assets:", err);
  process.exit(1);
});
