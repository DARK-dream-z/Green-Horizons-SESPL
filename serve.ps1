# Sunshine Solar Solutions - PowerShell Local Development Web Server
$port = 5173
$prefix = "http://localhost:$port/"

try {
    $listener = New-Object System.Net.HttpListener
    $listener.Prefixes.Add($prefix)
    $listener.Start()
} catch {
    $port = 8080
    $prefix = "http://localhost:$port/"
    $listener = New-Object System.Net.HttpListener
    $listener.Prefixes.Add($prefix)
    $listener.Start()
}

Write-Host "=========================================================" -ForegroundColor Green
Write-Host "  Sunshine Solar Solutions Local Dev Server Active" -ForegroundColor Yellow
Write-Host "  Access Website at: $prefix" -ForegroundColor Cyan
Write-Host "=========================================================" -ForegroundColor Green

Start-Process $prefix

$mimeMap = @{
    ".html" = "text/html; charset=utf-8"
    ".css"  = "text/css; charset=utf-8"
    ".js"   = "application/javascript; charset=utf-8"
    ".png"  = "image/png"
    ".jpg"  = "image/jpeg"
    ".svg"  = "image/svg+xml"
    ".json" = "application/json"
}

$rootDir = $PSScriptRoot

while ($listener.IsListening) {
    try {
        $context = $listener.GetContext()
        $request = $context.Request
        $response = $context.Response

        $urlPath = $request.Url.LocalPath
        if ($urlPath -eq "/") { $urlPath = "/index.html" }

        $localFilePath = Join-Path $rootDir ($urlPath -replace "^/", "")

        if (Test-Path $localFilePath -PathType Leaf) {
            $ext = [System.IO.Path]::GetExtension($localFilePath).ToLower()
            if ($mimeMap.ContainsKey($ext)) {
                $response.ContentType = $mimeMap[$ext]
            } else {
                $response.ContentType = "application/octet-stream"
            }

            $bytes = [System.IO.File]::ReadAllBytes($localFilePath)
            $response.ContentLength64 = $bytes.Length
            $response.OutputStream.Write($bytes, 0, $bytes.Length)
        } else {
            $response.StatusCode = 404
            $notFoundBytes = [System.Text.Encoding]::UTF8.GetBytes("404 Not Found")
            $response.OutputStream.Write($notFoundBytes, 0, $notFoundBytes.Length)
        }
        $response.OutputStream.Close()
    } catch {
        # Silent continue on client disconnects
    }
}
