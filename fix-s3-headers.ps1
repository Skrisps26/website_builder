# Fix S3 object metadata to allow iframe embedding
# Replace PROJECT_ID with your actual project ID

$ProjectId = "6f13290b-6ad1-4754-a1c0-1b9c5fd31118"
$Bucket = "027354322205-v0-preview"
$Prefix = "previews/$ProjectId"

Write-Host "Copying S3 objects with new metadata to allow iframe embedding..."
Write-Host "Bucket: $Bucket"
Write-Host "Prefix: $Prefix"
Write-Host ""

# This command updates metadata for all HTML files
aws s3 cp "s3://$Bucket/$Prefix/" "s3://$Bucket/$Prefix/" `
  --recursive `
  --exclude "*" `
  --include "*.html" `
  --metadata-directive REPLACE `
  --content-type "text/html; charset=utf-8" `
  --cache-control "no-cache" `
  --acl public-read

Write-Host ""
Write-Host "Done! Try refreshing your app now."
