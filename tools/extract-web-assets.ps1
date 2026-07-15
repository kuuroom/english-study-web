Add-Type -AssemblyName System.Drawing

$sourcePath = (Resolve-Path "$PSScriptRoot/../data/web-item.png").Path
$outputDir = Join-Path $PSScriptRoot "../data/assets"
New-Item -ItemType Directory -Force -Path $outputDir | Out-Null
$source = [System.Drawing.Bitmap]::new($sourcePath)

function Remove-ConnectedWhite([System.Drawing.Bitmap]$bitmap) {
  $width = $bitmap.Width
  $height = $bitmap.Height
  $seen = [bool[,]]::new($width, $height)
  $queue = [System.Collections.Generic.Queue[System.Drawing.Point]]::new()

  for ($x = 0; $x -lt $width; $x++) {
    $queue.Enqueue([System.Drawing.Point]::new($x, 0))
    $queue.Enqueue([System.Drawing.Point]::new($x, $height - 1))
  }
  for ($y = 0; $y -lt $height; $y++) {
    $queue.Enqueue([System.Drawing.Point]::new(0, $y))
    $queue.Enqueue([System.Drawing.Point]::new($width - 1, $y))
  }

  while ($queue.Count -gt 0) {
    $point = $queue.Dequeue()
    if ($point.X -lt 0 -or $point.Y -lt 0 -or $point.X -ge $width -or $point.Y -ge $height -or $seen[$point.X, $point.Y]) { continue }
    $seen[$point.X, $point.Y] = $true
    $color = $bitmap.GetPixel($point.X, $point.Y)
    if ($color.R -lt 238 -or $color.G -lt 238 -or $color.B -lt 238) { continue }
    $bitmap.SetPixel($point.X, $point.Y, [System.Drawing.Color]::Transparent)
    $queue.Enqueue([System.Drawing.Point]::new($point.X + 1, $point.Y))
    $queue.Enqueue([System.Drawing.Point]::new($point.X - 1, $point.Y))
    $queue.Enqueue([System.Drawing.Point]::new($point.X, $point.Y + 1))
    $queue.Enqueue([System.Drawing.Point]::new($point.X, $point.Y - 1))
  }
}

function Save-Crop($name, $x, $y, $width, $height, $transparent = $true) {
  $rectangle = [System.Drawing.Rectangle]::new($x, $y, $width, $height)
  $crop = [System.Drawing.Bitmap]::new($width, $height, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
  $graphics = [System.Drawing.Graphics]::FromImage($crop)
  $graphics.DrawImage($source, [System.Drawing.Rectangle]::new(0, 0, $width, $height), $rectangle, [System.Drawing.GraphicsUnit]::Pixel)
  $graphics.Dispose()
  if ($transparent) { Remove-ConnectedWhite $crop }
  $crop.Save((Join-Path $outputDir $name), [System.Drawing.Imaging.ImageFormat]::Png)
  $crop.Dispose()
}

# ロゴ・キャラクター
Save-Crop "logo.png" 17 17 435 145
Save-Crop "hero-party.png" 15 175 430 190
Save-Crop "rabbit-basic.png" 480 45 90 125
Save-Crop "rabbit-happy.png" 575 45 90 125
Save-Crop "rabbit-wand.png" 670 45 90 125
Save-Crop "rabbit-reading.png" 770 45 105 125
Save-Crop "cat-sitting.png" 480 185 90 90
Save-Crop "cat-wand.png" 575 185 90 90
Save-Crop "cat-writing.png" 675 185 100 90
Save-Crop "cat-sleeping.png" 775 185 100 90
Save-Crop "penguin-basic.png" 480 275 95 100
Save-Crop "penguin-book.png" 575 275 95 100
Save-Crop "penguin-music.png" 675 275 95 100
Save-Crop "penguin-study.png" 775 275 105 100
Save-Crop "graduate-cat.png" 480 375 90 90
Save-Crop "cat-thinking.png" 575 375 90 90
Save-Crop "cat-explain.png" 675 375 90 90
Save-Crop "cat-cheer.png" 775 375 100 90

# アイコン・装飾・エフェクト
Save-Crop "icon-crown.png" 920 45 45 45
Save-Crop "icon-star.png" 970 45 45 45
Save-Crop "icon-gem.png" 1020 45 45 45
Save-Crop "icon-heart-gem.png" 1070 45 45 45
Save-Crop "icon-fire.png" 1120 45 45 45
Save-Crop "icon-potion.png" 1170 45 45 45
Save-Crop "shield-heart.png" 920 125 50 60
Save-Crop "shield-book.png" 980 125 50 60
Save-Crop "shield-sword.png" 1035 125 50 60
Save-Crop "shield-star.png" 1090 125 50 60
Save-Crop "shield-crown.png" 1145 125 50 60
Save-Crop "ribbon-pink.png" 915 205 95 45
Save-Crop "ribbon-purple.png" 1025 205 95 45
Save-Crop "ribbon-cream.png" 1135 205 95 45
Save-Crop "ribbon-green.png" 920 255 95 45
Save-Crop "sparkles.png" 1010 255 220 55
Save-Crop "flowers.png" 915 320 315 70
Save-Crop "effects.png" 15 860 410 125

# ボタン・UIパーツ・パネル
Save-Crop "button-next.png" 1275 45 240 60
Save-Crop "button-retry.png" 1275 115 240 60
Save-Crop "button-quest-list.png" 1275 185 240 60
Save-Crop "number-badges.png" 1260 245 130 65
Save-Crop "status-labels.png" 1390 245 125 165
Save-Crop "frame-quest.png" 15 465 190 170
Save-Crop "frame-correct.png" 210 465 200 135
Save-Crop "frame-incorrect.png" 210 610 200 105
Save-Crop "panel-quest-list.png" 15 650 180 180
Save-Crop "panel-status.png" 205 720 210 145
Save-Crop "speech-correct.png" 1240 490 285 85
Save-Crop "speech-incorrect.png" 1240 580 285 85
Save-Crop "panel-explanation.png" 1240 670 285 115
Save-Crop "loading-panel.png" 460 855 285 145
Save-Crop "levelup-panel.png" 760 835 255 170

# 背景イラスト
Save-Crop "background-castle.png" 425 515 255 250 $false
Save-Crop "background-classroom.png" 690 515 250 250 $false
Save-Crop "background-forest.png" 950 515 255 250 $false

$source.Dispose()
Write-Output "Extracted assets to $outputDir"
