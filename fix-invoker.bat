@echo off
echo Granting allUsers invoker on all callable Cloud Run services...

set REGION=us-central1
set PROJECT=the-phantom-app-io

for %%F in (
  refineproblemstatement
  extractunfairadvantages
  synthesizepositioning
  extractaudiencelanguage
  findwheretotest
  buildminimumoffer
  generateoutreach
  buildobjectionlibrary
  diagnoseoffer
  suggestiteration
  competitivegapanalysis
  positioningfromdata
  recommendbrandidentity
  buildnotfor
  structuretestimonial
  curateproofpackage
  exportlockinpdf
  createproject
  completeonboarding
  skiponboarding
  admingrantpro
  deleteproject
  completephase
  requestproofuploadurl
  createcheckoutsession
  createbillingportalsession
) do (
  echo Fixing %%F...
  gcloud run services add-iam-policy-binding %%F --region=%REGION% --project=%PROJECT% --member=allUsers --role=roles/run.invoker
)

echo Done! All callable functions now allow unauthenticated invocations.
pause
