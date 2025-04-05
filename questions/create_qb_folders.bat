@echo off
setlocal enabledelayedexpansion

:: List of all course codes (space-separated)
set courses=AIS-1101 AIS-1102 AIS-1103 AIS-1104 AIS-1105 AIS-1201 AIS-1202 AIS-1203 AIS-1204 AIS-1205 AIS-1206 AIS-2101 AIS-2102 AIS-2103 AIS-2104 AIS-2105 AIS-2201 AIS-2202 AIS-2203 AIS-2204 AIS-2205 AIS-2206 AIS-3101 AIS-3102 AIS-3103 AIS-3104 AIS-3105 AIS-3106 AIS-3201 AIS-3202 AIS-3203 AIS-3204 AIS-3205 AIS-3206 AIS-4101 AIS-4102 AIS-4103 AIS-4104 AIS-4105 AIS-4201 AIS-4202 AIS-4203 AIS-4204 AIS-4205 AIS-4206

:: Create folders and files
for %%c in (%courses%) do (
    mkdir "%%c" 2>nul
    echo Creating folder: %%c
    cd "%%c"
    
    :: Generate question.html
    echo ^<!DOCTYPE html^> > question.html
    echo ^<html lang="en"^> >> question.html
    echo ^<head^> >> question.html
    echo     ^<meta charset="UTF-8"^> >> question.html
    echo     ^<title^>%%c - Questions^</title^> >> question.html
    echo ^</head^> >> question.html
    echo ^<body^> >> question.html
    echo     ^<h1^>%%c Questions^</h1^> >> question.html
    echo     ^<p^>Past exam questions will go here.^</p^> >> question.html
    echo ^</body^> >> question.html
    echo ^</html^> >> question.html
    
    :: Generate solution.html
    echo ^<!DOCTYPE html^> > solution.html
    echo ^<html lang="en"^> >> solution.html
    echo ^<head^> >> solution.html
    echo     ^<meta charset="UTF-8"^> >> solution.html
    echo     ^<title^>%%c - Solutions^</title^> >> solution.html
    echo ^</head^> >> solution.html
    echo ^<body^> >> solution.html
    echo     ^<h1^>%%c Solutions^</h1^> >> solution.html
    echo     ^<p^>Solutions will be added here.^</p^> >> solution.html
    echo ^</body^> >> solution.html
    echo ^</html^> >> solution.html
    
    cd ..
)

echo All folders and HTML files created successfully!
pause