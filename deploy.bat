@echo off
echo Starting deployment...
git add .
git commit -m "Update from Medivision locally"
git remote add origin https://github.com/TarrushSaxena/medivision-buddy-ai.git
git remote set-url origin https://github.com/TarrushSaxena/medivision-buddy-ai.git
git branch -M main
git push -u origin main
echo Deployment completed!
