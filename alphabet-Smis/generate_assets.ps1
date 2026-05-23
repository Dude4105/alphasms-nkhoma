Add-Type -AssemblyName System.Drawing

$img = [System.Drawing.Image]::FromFile("public/Logo.jpg")

# 192x192
$bmp192 = New-Object System.Drawing.Bitmap 192, 192
$g192 = [System.Drawing.Graphics]::FromImage($bmp192)
$g192.DrawImage($img, 0, 0, 192, 192)
$bmp192.Save("public/pwa-192x192.png", [System.Drawing.Imaging.ImageFormat]::Png)

# 512x512
$bmp512 = New-Object System.Drawing.Bitmap 512, 512
$g512 = [System.Drawing.Graphics]::FromImage($bmp512)
$g512.DrawImage($img, 0, 0, 512, 512)
$bmp512.Save("public/pwa-512x512.png", [System.Drawing.Imaging.ImageFormat]::Png)

# Desktop screenshot (1280x720) wide
$imgDesktop = [System.Drawing.Image]::FromFile("public/hero_bg.png")
$bmpDesktop = New-Object System.Drawing.Bitmap 1280, 720
$gDesk = [System.Drawing.Graphics]::FromImage($bmpDesktop)
$gDesk.DrawImage($imgDesktop, 0, 0, 1280, 720)
$bmpDesktop.Save("public/screenshot-desktop.png", [System.Drawing.Imaging.ImageFormat]::Png)

# Mobile screenshot (720x1280) narrow
$imgMobile = [System.Drawing.Image]::FromFile("public/hero_bg.png")
$bmpMobile = New-Object System.Drawing.Bitmap 720, 1280
$gMob = [System.Drawing.Graphics]::FromImage($bmpMobile)
$gMob.DrawImage($imgMobile, 0, 0, 720, 1280)
$bmpMobile.Save("public/screenshot-mobile.png", [System.Drawing.Imaging.ImageFormat]::Png)

Write-Host "Assets generated successfully!"
