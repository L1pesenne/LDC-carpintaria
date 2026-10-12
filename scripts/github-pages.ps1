param([ValidateSet('inspect','enable','status')][string]$Mode = 'inspect')
$ErrorActionPreference = 'Stop'
$env:GIT_TERMINAL_PROMPT = '0'
$env:GCM_INTERACTIVE = 'never'
$credentialInput = "protocol=https`nhost=github.com`n`n"
$credentialLines = $credentialInput | git credential fill
if ($LASTEXITCODE -ne 0) { throw 'Não foi possível obter a autenticação do GitHub.' }
$credentialFields = @{}
foreach ($line in $credentialLines) {
  $parts = $line -split '=', 2
  if ($parts.Count -eq 2) { $credentialFields[$parts[0]] = $parts[1] }
}
if (-not $credentialFields['password']) { throw 'Autenticação do GitHub indisponível.' }
$requestHeaders = @{ Authorization = 'Bearer ' + $credentialFields['password']; Accept = 'application/vnd.github+json'; 'X-GitHub-Api-Version' = '2022-11-28'; 'User-Agent' = 'LDC-pages-setup' }
$baseUri = 'https://api.github.com/repos/L1pesenne/LDC-carpintaria'
function Invoke-Github([string]$Path, [string]$Method = 'GET', $Body = $null) {
  $arguments = @{ Uri = $baseUri + $Path; Method = $Method; Headers = $requestHeaders }
  if ($null -ne $Body) { $arguments.Body = ($Body | ConvertTo-Json -Depth 6); $arguments.ContentType = 'application/json' }
  Invoke-RestMethod @arguments
}
if ($Mode -eq 'inspect') {
  $repository = Invoke-Github ''
  [pscustomobject]@{ Repository = $repository.full_name; Private = $repository.private; CanAdmin = $repository.permissions.admin; DefaultBranch = $repository.default_branch } | ConvertTo-Json -Compress
}
try { $pages = Invoke-Github '/pages' } catch {
  if ([int]$_.Exception.Response.StatusCode -ne 404) { throw 'Não foi possível consultar a configuração do Pages.' }
  $pages = $null
}
if ($Mode -eq 'enable') {
  $settings = @{ build_type = 'workflow' }
  if ($null -eq $pages) { $pages = Invoke-Github '/pages' 'POST' $settings }
  else { Invoke-Github '/pages' 'PUT' $settings | Out-Null; $pages = Invoke-Github '/pages' }
}
if ($pages) { [pscustomobject]@{ PagesUrl = $pages.html_url; BuildType = $pages.build_type; Status = $pages.status } | ConvertTo-Json -Compress }
else { Write-Output 'Pages ainda não configurado.' }
if ($Mode -eq 'status') {
  $runs = Invoke-Github '/actions/workflows/pages.yml/runs?per_page=1'
  $runs.workflow_runs | Select-Object -First 1 id,status,conclusion,html_url,head_sha | ConvertTo-Json -Compress
}
