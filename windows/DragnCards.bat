@echo off
cd "%~dp0\lib\dragncards-0.1.0"

if not exist ".\priv\static\images\cards\English\00a0a007-10dd-4a05-bedf-3a4e8ff972dc.jpg" (
	echo Card images not found.
	pause
	exit
)

call "%~dp0\bin\migrate"
call "%~dp0\bin\dragncards" start