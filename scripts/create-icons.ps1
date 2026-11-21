Add-Type -AssemblyName System.Drawing

function Create-PwaIcon($path, $size) {
    $bmp = New-Object System.Drawing.Bitmap($size, $size)
    $g = [System.Drawing.Graphics]::FromImage($bmp)
    $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
    
    $rect = New-Object System.Drawing.Rectangle(0, 0, $size, $size)
    $c1 = [System.Drawing.Color]::FromArgb(255, 37, 99, 235)
    $c2 = [System.Drawing.Color]::FromArgb(255, 79, 70, 229)
    $brush = New-Object System.Drawing.Drawing2D.LinearGradientBrush($rect, $c1, $c2, 45.0)
    $g.FillRectangle($brush, $rect)
    
    $pts = @(
        (New-Object System.Drawing.PointF([float]($size * 0.55), [float]($size * 0.18))),
        (New-Object System.Drawing.PointF([float]($size * 0.32), [float]($size * 0.52))),
        (New-Object System.Drawing.PointF([float]($size * 0.52), [float]($size * 0.52))),
        (New-Object System.Drawing.PointF([float]($size * 0.45), [float]($size * 0.82))),
        (New-Object System.Drawing.PointF([float]($size * 0.70), [float]($size * 0.45))),
        (New-Object System.Drawing.PointF([float]($size * 0.50), [float]($size * 0.45)))
    )
    $fillBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::White)
    $g.FillPolygon($fillBrush, $pts)
    
    $bmp.Save($path, [System.Drawing.Imaging.ImageFormat]::Png)
    $g.Dispose()
    $bmp.Dispose()
}

if (!(Test-Path client\public)) {
    New-Item -ItemType Directory -Path client\public -Force
}

Create-PwaIcon "client\public\icon-192.png" 192
Create-PwaIcon "client\public\icon-512.png" 512
Create-PwaIcon "client\public\icon-maskable-192.png" 192
Create-PwaIcon "client\public\icon-maskable-512.png" 512

Write-Host "PWA icons generated successfully."
