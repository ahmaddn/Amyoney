Add-Type -AssemblyName System.Drawing

function Check-File($path) {
    $fullPath = Join-Path (Get-Location) $path
    $b = New-Object System.Drawing.Bitmap($fullPath)
    $c0 = $b.GetPixel(0, 0)
    $cCenter = $b.GetPixel([int]($b.Width / 2), [int]($b.Height / 2))
    $cMidTop = $b.GetPixel([int]($b.Width / 2), 5)
    Write-Output "File: $path ($($b.Width)x$($b.Height))"
    Write-Output "  Corner (0,0): A=$($c0.A), R=$($c0.R), G=$($c0.G), B=$($c0.B)"
    Write-Output "  Center:       A=$($cCenter.A), R=$($cCenter.R), G=$($cCenter.G), B=$($cCenter.B)"
    Write-Output "  MidTop (w/2,5): A=$($cMidTop.A), R=$($cMidTop.R), G=$($cMidTop.G), B=$($cMidTop.B)"
    $b.Dispose()
}

Check-File "assets/images/splash-icon.png"
Check-File "assets/images/emblem-transparent.png"
Check-File "assets/images/icon-forest.png"
