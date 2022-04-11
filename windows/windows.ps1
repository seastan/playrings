# 
# Builds the app for Windows. Assumes dependencies:
# Elixir, Node, Visual Studio, sqlite3
#

function Invoke-CmdScript {
  param(
    [String] $scriptName
  )
  $cmdLine = """$scriptName"" $args & set"
  & $Env:SystemRoot\system32\cmd.exe /c $cmdLine |
  select-string '^([^=]*)=(.*)$' | foreach-object {
    $varName = $_.Matches[0].Groups[1].Value
    $varValue = $_.Matches[0].Groups[2].Value
    set-item Env:$varName $varValue
  }
}

# Set environment
Invoke-CmdScript "C:\Program Files\Microsoft Visual Studio\2022\Community\VC\Auxiliary\Build\vcvarsall.bat" amd64

# Build frontend
cd $PSScriptRoot\frontend
npm install
npx browserslist@latest --update-db
npm run build:css
npm run build

# Build backend
cd $PSScriptRoot\backend
set MIX_ENV=prod
set PORT=4000
mix deps.get -y
mix compile
mix release

$ReleaseDir = "$PSScriptRoot\backend\_build\dev\rel\dragncards"

# Create databases
cd $ReleaseDir\lib\dragncards-0.1.0
cmd /c "$ReleaseDir\bin\migrate.bat"
Get-Content $PSScriptRoot\backend\users.sql -Raw | sqlite3 .\dragncards_dev

# Move frontend to phoenix
mv $PSScriptRoot\frontend\build .\priv\static
cd $ReleaseDir
mkdir cards
cmd /k "mklink /j .\lib\dragncards-0.1.0\priv\static\images\cards .\cards"