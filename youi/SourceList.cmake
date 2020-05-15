# =============================================================================
# © You i Labs Inc. 2000-2020. All rights reserved.

set(SOURCE_TIZEN-NACL
    src/logging/YiTizenNaClRemoteLoggerSink.cpp
    src/player/YiVideojsVideoPlayer.cpp
    src/player/YiVideojsVideoSurface.cpp
)

set(HEADERS_TIZEN-NACL
    src/logging/YiTizenNaClRemoteLoggerSink.h
    src/player/YiVideojsVideoPlayer.h
    src/player/YiVideojsVideoPlayerPriv.h
    src/player/YiVideojsVideoSurface.h
)

set (YI_PROJECT_SOURCE
    src/App.cpp
    src/AppFactory.cpp
    src/modules/DevicePowerManagementModule.cpp
    ${SOURCE_${YI_PLATFORM_UPPER}}
)

set (YI_PROJECT_HEADERS
    src/App.h
    src/modules/DevicePowerManagementModule.h
    ${HEADERS_${YI_PLATFORM_UPPER}}
)
