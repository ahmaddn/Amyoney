Add-Type -AssemblyName System.Drawing

$b = New-Object System.Drawing.Bitmap((Join-Path (Get-Location) 'assets/images/splash-icon.png'))
$whiteCount = 0
for ($x = 0; $x -lt 50; $x++) {
    for ($y = 0; $y -lt 50; $y++) {
        $p = $b.GetPixel($x, $y)
        if ($p.R -gt 240 -and $p.G -gt 240 -and $p.B -gt 240) { $whiteCount++ }
    }
}
Write-Output "White pixels in 50x50 corner: $whiteCount / 2500"
$b.Dispose()
