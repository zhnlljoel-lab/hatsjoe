$git = "C:\Users\Comercio en forma\AppData\Local\GitPortable\PortableGit\cmd\git.exe"
$message = $args[0]
if (-not $message) {
    $message = "Auto-update from Antigravity"
}
& $git add .
& $git commit -m $message
& $git push
