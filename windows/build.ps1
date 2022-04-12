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
$Env:MIX_ENV = "prod"
$Env:PORT = "4000"
$Env:RELEASE_DISTRIBUTION = "none"
Invoke-CmdScript "C:\Program Files\Microsoft Visual Studio\2022\Community\VC\Auxiliary\Build\vcvarsall.bat" amd64
$RootDir = "$PSScriptRoot\.."

# Build frontend
cd $RootDir\frontend
npm install
npx browserslist@latest --update-db
npm run build:css
npm run build

# Build backend
cd $RootDir\backend
mix deps.get
mix compile
mix release

$ReleaseDir = "$RootDir\backend\_build\prod\rel\dragncards"

# Create databases
cd $ReleaseDir\lib\dragncards-0.1.0
cmd /c "$ReleaseDir\bin\migrate.bat"
Get-Content $RootDir\backend\users.sql -Raw | sqlite3 .\dragncards_dev

# Move frontend to phoenix
mv $RootDir\frontend\build .\priv\static
mkdir .\priv\static\images\cards
cd $ReleaseDir