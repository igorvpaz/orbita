Add-Type -AssemblyName System.Drawing
$destination = Join-Path $PSScriptRoot '..\apps\web\public\icons'
foreach ($size in @(192, 512)) {
  $bitmap = [System.Drawing.Bitmap]::new($size, $size)
  $canvas = [System.Drawing.Graphics]::FromImage($bitmap)
  $canvas.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
  $canvas.Clear([System.Drawing.ColorTranslator]::FromHtml('#081521'))
  $teal = [System.Drawing.ColorTranslator]::FromHtml('#86e8d0')
  $stroke = [System.Drawing.Pen]::new($teal, [float]($size * 0.047))
  $brush = [System.Drawing.SolidBrush]::new($teal)
  $canvas.DrawEllipse($stroke, [float]($size * 0.18), [float]($size * 0.18), [float]($size * 0.64), [float]($size * 0.64))
  $canvas.DrawEllipse($stroke, [float]($size * 0.32), [float]($size * 0.32), [float]($size * 0.36), [float]($size * 0.36))
  $canvas.FillEllipse($brush, [float]($size * 0.455), [float]($size * 0.455), [float]($size * 0.09), [float]($size * 0.09))
  $canvas.FillEllipse($brush, [float]($size * 0.745), [float]($size * 0.28), [float]($size * 0.11), [float]($size * 0.11))
  $bitmap.Save((Join-Path $destination "icon-$size.png"), [System.Drawing.Imaging.ImageFormat]::Png)
  $brush.Dispose(); $stroke.Dispose(); $canvas.Dispose(); $bitmap.Dispose()
}
