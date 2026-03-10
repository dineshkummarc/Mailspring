; Custom NSIS include for Mailspring Windows installer
; Copies registry helper files and Visual Elements resources alongside the exe

!macro customInstall
  ; Copy mailto registration helper files
  File /oname=$INSTDIR\mailspring-mailto-default.reg "${BUILD_RESOURCES_DIR}\win\mailspring-mailto-default.reg"
  File /oname=$INSTDIR\mailspring-mailto-registration.reg "${BUILD_RESOURCES_DIR}\win\mailspring-mailto-registration.reg"

  ; Copy Visual Elements manifest and tile images
  File /oname=$INSTDIR\mailspring.VisualElementsManifest.xml "${BUILD_RESOURCES_DIR}\win\mailspring.VisualElementsManifest.xml"
  File /oname=$INSTDIR\mailspring-150px.png "${BUILD_RESOURCES_DIR}\win\mailspring-150px.png"
  File /oname=$INSTDIR\mailspring-75px.png "${BUILD_RESOURCES_DIR}\win\mailspring-75px.png"

  ; Copy elevation helpers
  File /oname=$INSTDIR\elevate.cmd "${BUILD_RESOURCES_DIR}\win\elevate.cmd"
  File /oname=$INSTDIR\elevate.vbs "${BUILD_RESOURCES_DIR}\win\elevate.vbs"
!macroend
