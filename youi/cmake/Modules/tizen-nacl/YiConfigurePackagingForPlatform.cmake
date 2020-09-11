# =============================================================================
# © You i Labs Inc. 2000-2020. All rights reserved.
cmake_minimum_required(VERSION 3.5 FATAL_ERROR)

if(__yi_configure_packaging_for_platform_included)
    return()
endif()
set(__yi_configure_packaging_for_platform_included 1)

# Tizen-NaCl cannot be used with spaces in the project's absolute build path.
# The Tizen tools, paired with CMake path escape handling will result in the Tizen tools not outputting to the
# correct paths. It ends up placing some of the temporary files within folders that look similar in name, but
# the "off" directory will contain a backslash (\) in front of every space, whereas the correct directory
# will only contain a space with no backslash.
#
if(CMAKE_CURRENT_BINARY_DIR MATCHES "(\ )")
    message(FATAL_ERROR "The Tizen Studio tools do not properly support spaces or escaping of spaces within the working directory when packaging. Generate the project into a path that does not contain spaces.")
endif()

if(NOT DEFINED YI_SIGNING_IDENTITY)
    if(DEFINED ENV{TIZEN_SIGNING_IDENTITY})
        set(YI_SIGNING_IDENTITY "$ENV{TIZEN_SIGNING_IDENTITY}")
    endif()
endif()

option(YI_PACKAGE_APP_IN_ALL "Enables packaging of the application in the ALL target. When disabled the Package target must be specified manually to create an application package." ON)

# The filename of the package that will be created.
if(NOT YI_OUTPUT_FILENAME)
    set(YI_OUTPUT_FILENAME "${YI_PROJECT_NAME}")
endif()

set(YI_SIGNING_IDENTITY "${YI_SIGNING_IDENTITY}" CACHE STRING "Specifies the signing identity to use when packaging the wgt (If not specified the active identity in Tizen Studio will be used.)")
set(YI_AUTHOR_NAME "You.i TV" CACHE STRING "The name of the company that is publishing the widget.")
set(YI_COMPANY_URL "http://your_domain" CACHE STRING "The company URL that will be inserted into the 'config.xml' file.")
set(YI_DESCRIPTION "Description of your widget" CACHE STRING "The description of the widget.")
set(YI_PACKAGE_ID "FmHXPQSBwZ" CACHE STRING "The ID value of the package. This gets combined in 'config.xml' with the YI_APP_NAME to make the application ID.")
set(YI_SMART_HUB_PREVIEW_URL "" CACHE STRING "Set the remote JSON file URL for Smart Hub public preview.")
set(YI_PERMISSIONS "PPB_FileIO,PPB_NetworkMonitor,PPB_File_IO_Private,PPB_FileRef,PPB_FileSystem,PPB_RemovableStorage_Dev" CACHE STRING "The permissions that should be added to the generated .nmf file during packaging.")

# Function for formatting Tizen JS / CSS file lists
function(yi_format_tizen_files OUT_LIST)
    set(SINGLE_VALUE_ARGS FILE_PREFIX)
    set(MULTI_VALUE_ARGS FILE_LIST)
    set(REQUIRED_ARGS FILE_LIST FILE_PREFIX)

    cmake_parse_arguments(_ARGS
        ""
        "${SINGLE_VALUE_ARGS}"
        "${MULTI_VALUE_ARGS}"
        ${ARGN}
    )

    foreach(_ARG IN LISTS REQUIRED_ARGS)
        if(NOT _ARGS_${_ARG})
            message(FATAL_ERROR "Missing required argument: ${_ARG}")
        endif()
    endforeach(_ARG IN LISTS REQUIRED_ARGS)

    if(_ARGS_UNUSED_ARGUMENTS)
        message(FATAL_ERROR "Encountered unknown arguments: ${_ARGS_UNUSED_ARGUMENTS}")
    endif()

    foreach(_FILE IN LISTS ${_ARGS_FILE_LIST})
        string(REGEX MATCH "^([a-z][a-z0-9+.-]*):\\/\\/" _HAS_SCHEME ${_FILE})

        if(_HAS_SCHEME)
            set(_PREFIX "")
        else()
            set(_PREFIX ${_ARGS_FILE_PREFIX})
        endif()

        list(APPEND _FORMATTED_FILE_LIST "${_PREFIX}${_FILE}")
    endforeach()

    list(REMOVE_DUPLICATES _FORMATTED_FILE_LIST)

    set(${OUT_LIST} ${_FORMATTED_FILE_LIST} PARENT_SCOPE)
endfunction()

# Configure Tizen stylesheet list
list(APPEND YI_TIZEN_BASE_CSS_FILES "styles.css")
list(APPEND YI_TIZEN_BASE_CSS_FILES "error.css")
list(APPEND YI_TIZEN_BASE_CSS_FILES "subtitles.css")

set(_TIZEN_CSS_FILES_PREFIX "assets/stylesheets/")

list(APPEND _TIZEN_UNFORMATTED_BASE_CSS_FILES YI_TIZEN_BASE_CSS_FILES)
yi_format_tizen_files(
    _TIZEN_BASE_CSS_FILES
    FILE_LIST ${_TIZEN_UNFORMATTED_BASE_CSS_FILES}
    FILE_PREFIX ${_TIZEN_CSS_FILES_PREFIX}
)

list(APPEND _TIZEN_UNFORMATTED_CSS_FILES YI_TIZEN_CSS_FILES YI_MSE_TIZEN_CSS_FILES YI_USER_TIZEN_CSS_FILES)
yi_format_tizen_files(
    _TIZEN_CSS_FILES
    FILE_LIST ${_TIZEN_UNFORMATTED_CSS_FILES}
    FILE_PREFIX ${_TIZEN_CSS_FILES_PREFIX}
)

# Configure Tizen JavaScript source file list
list(APPEND YI_TIZEN_BASE_JS_FILES "babel.polyfill.min.js")
list(APPEND YI_TIZEN_BASE_JS_FILES "async-2.6.3.min.js")
list(APPEND YI_TIZEN_BASE_JS_FILES "stacktrace-with-promises-and-json-polyfills.js")
list(APPEND YI_TIZEN_BASE_JS_FILES "YiDebug.js")
list(APPEND YI_TIZEN_BASE_JS_FILES "YiUtilities.js")
list(APPEND YI_TIZEN_BASE_JS_FILES "YiSplashScreen.js")
list(APPEND YI_TIZEN_BASE_JS_FILES "YiErrorOverlay.js")
list(APPEND YI_TIZEN_BASE_JS_FILES "YiWebFileLoader.js")
list(APPEND YI_TIZEN_BASE_JS_FILES "YiMain.js")

list(APPEND YI_TIZEN_JS_FILES "moment.min.js")
list(APPEND YI_TIZEN_JS_FILES "YiLogger.js")
list(APPEND YI_TIZEN_JS_FILES "YiMessaging.js")
list(APPEND YI_TIZEN_JS_FILES "YiApplication.js")
list(APPEND YI_TIZEN_JS_FILES "YiAudioVolumeBridge.js")
list(APPEND YI_TIZEN_JS_FILES "YiClosedCaptionsStatusBridge.js")
list(APPEND YI_TIZEN_JS_FILES "YiSubtitleStyleManager.js")
list(APPEND YI_TIZEN_JS_FILES "YiDeviceInformationBridge.js")
list(APPEND YI_TIZEN_JS_FILES "YiDevicePowerManagementBridge.js")
list(APPEND YI_TIZEN_JS_FILES "YiKeyboardInputBridge.js")
list(APPEND YI_TIZEN_JS_FILES "YiLocaleBridge.js")
list(APPEND YI_TIZEN_JS_FILES "YiSpeechSynthesizerBridge.js")
list(APPEND YI_TIZEN_JS_FILES "YiScreenReaderStatusBridge.js")
list(APPEND YI_TIZEN_JS_FILES "YiNetworkInformationBridge.js")
list(APPEND YI_TIZEN_JS_FILES "YiReactNativeExecutor.js")
list(APPEND YI_TIZEN_JS_FILES "YiVideoPlayer.js")
list(APPEND YI_TIZEN_JS_FILES "YiDeepLinkBridge.js")
list(APPEND YI_TIZEN_JS_FILES "YiDeviceMetricsBridge.js")
list(APPEND YI_TIZEN_JS_FILES "YiTimeZoneBridge.js")

set(_TIZEN_JS_FILES_PREFIX "assets/scripts/")

list(APPEND _TIZEN_UNFORMATTED_BASE_JS_FILES YI_TIZEN_BASE_JS_FILES)
yi_format_tizen_files(
    _TIZEN_BASE_JS_FILES
    FILE_LIST ${_TIZEN_UNFORMATTED_BASE_JS_FILES}
    FILE_PREFIX ${_TIZEN_JS_FILES_PREFIX}
)

list(APPEND _TIZEN_UNFORMATTED_JS_FILES YI_TIZEN_JS_FILES YI_MSE_TIZEN_JS_FILES YI_USER_TIZEN_JS_FILES)
yi_format_tizen_files(
    _TIZEN_JS_FILES
    FILE_LIST ${_TIZEN_UNFORMATTED_JS_FILES}
    FILE_PREFIX ${_TIZEN_JS_FILES_PREFIX}
)

mark_as_advanced(YI_OUTPUT_FILENAME
    YI_AUTHOR_NAME
    YI_COMPANY_URL
    YI_DESCRIPTION
    YI_PACKAGE_ID
    YI_SMART_HUB_PREVIEW_URL
    YI_PERMISSIONS
)

find_program(RUBY_EXECUTABLE
    NAMES ruby
    DOC "The pathname to the Ruby executable."
)
mark_as_advanced(RUBY_EXECUTABLE)

if ("${RUBY_EXECUTABLE}" MATCHES "NOTFOUND")
    message(FATAL_ERROR "Could not locate an installation of Ruby on host machine.")
endif()

# The project's CMakeLists.txt should use YI_PACKAGE_IN_ALL when adding the Package target to enable packaging in the ALL target.
# i.e add_custom_target(Package ${YI_PACKAGE_IN_ALL})
if (YI_PACKAGE_APP_IN_ALL)
    set(YI_PACKAGE_IN_ALL ALL)
else()
    unset(YI_PACKAGE_IN_ALL)
endif()

function(yi_configure_packaging_for_platform)
    set(SINGLE_VALUE_ARGS PROJECT_TARGET PACKAGE_TARGET)
    set(REQUIRED_SINGLE_VALUE_ARGS PROJECT_TARGET PACKAGE_TARGET)

    cmake_parse_arguments(_ARGS
        ""
        "${SINGLE_VALUE_ARGS}"
        ""
        ${ARGN}
    )

    foreach(_ARG IN LISTS REQUIRED_SINGLE_VALUE_ARGS)
        if(NOT _ARGS_${_ARG})
            message(FATAL_ERROR "Missing required argument: ${_ARG}")
        endif()
    endforeach(_ARG IN LISTS REQUIRED_SINGLE_VALUE_ARGS)

    if(_ARGS_UNUSED_ARGUMENTS)
        message(FATAL_ERROR "Encountered unknown arguments: ${_ARGS_UNUSED_ARGUMENTS}")
    endif()

    # Check whether the project has custom WidgetFiles under <project>/Resources/tizen-nacl
    set(_WIDGET_FILES_PATH "${CMAKE_CURRENT_SOURCE_DIR}/Resources/tizen-nacl/WidgetFiles")
    if(NOT IS_DIRECTORY "${_WIDGET_FILES_PATH}")
        message(STATUS "The project does not have a 'Resources/tizen-nacl/WidgetFiles' folder. Using the WidgetFiles from '${YouiEngine_DIR}/templates/mains/Resources/tizen-nacl'.")
        set(_WIDGET_FILES_PATH "${YouiEngine_DIR}/templates/mains/Resources/tizen-nacl/WidgetFiles")
    endif()

    set(_DEBUG_SCRIPT_PATH_BASE "Resources/tizen-nacl/web/scripts/YiDebug.js.in")
    set(_DEBUG_SCRIPT_PATH "${CMAKE_CURRENT_SOURCE_DIR}/${_DEBUG_SCRIPT_PATH_BASE}")
    if(NOT EXISTS "${_DEBUG_SCRIPT_PATH}")
        set(_DEBUG_SCRIPT_PATH "${YouiEngine_DIR}/templates/mains/${_DEBUG_SCRIPT_PATH_BASE}")
        message(STATUS "The project does not have a '${_DEBUG_SCRIPT_PATH_BASE}' file. Using default: '${_DEBUG_SCRIPT_PATH}'.")
    endif()

    set(_MAIN_SCRIPT_PATH_BASE "Resources/tizen-nacl/web/scripts/YiMain.js.in")
    set(_MAIN_SCRIPT_PATH "${CMAKE_CURRENT_SOURCE_DIR}/${_MAIN_SCRIPT_PATH_BASE}")
    if(NOT EXISTS "${_MAIN_SCRIPT_PATH}")
        set(_MAIN_SCRIPT_PATH "${YouiEngine_DIR}/templates/mains/${_MAIN_SCRIPT_PATH_BASE}")
        message(STATUS "The project does not have a '${_MAIN_SCRIPT_PATH_BASE}' file. Using default: '${_MAIN_SCRIPT_PATH}'.")
    endif()

    set(_MAIN_APPLICATION_SCRIPT_PATH_BASE "Resources/tizen-nacl/web/scripts/YiApplication.js.in")
    set(_MAIN_APPLICATION_SCRIPT_PATH "${CMAKE_CURRENT_SOURCE_DIR}/${_MAIN_APPLICATION_SCRIPT_PATH_BASE}")
    if(NOT EXISTS "${_MAIN_APPLICATION_SCRIPT_PATH}")
        set(_MAIN_APPLICATION_SCRIPT_PATH "${YouiEngine_DIR}/templates/mains/${_MAIN_APPLICATION_SCRIPT_PATH_BASE}")
        message(STATUS "The project does not have a '${_MAIN_APPLICATION_SCRIPT_PATH_BASE}' file. Using default: '${_MAIN_APPLICATION_SCRIPT_PATH}'.")
    endif()

    set(_TIZEN_COMMAND "${TIZEN_SDK_HOME}/tools/ide/bin/tizen${TIZEN_NACL_TOOLCHAIN_SUFFIX}")
    if(NOT EXISTS "${_TIZEN_COMMAND}")
        message(WARNING "Tizen SDK tools not found. Without the Tizen SDK tools, the ${_ARGS_PACKAGE_TARGET} target cannot be built. Make sure your Tizen SDK is stored at ${TIZEN_SDK_HOME} or set the environment variable TIZEN_SDK_HOME.")
    endif()

    set(_STAGING_DIR "${CMAKE_CURRENT_BINARY_DIR}/Staging")

    # Stringify Tizen file lists
    set(YI_TIZEN_CSS_FILES_HTML "")
    set(YI_TIZEN_JS_FILES_HTML "")

    foreach(CSS IN LISTS _TIZEN_BASE_CSS_FILES)
        string(APPEND YI_TIZEN_CSS_FILES_HTML "<link href=\"${CSS}\" rel=\"stylesheet\" type=\"text/css\">")
    endforeach()

    foreach(JS IN LISTS _TIZEN_BASE_JS_FILES)
        string(APPEND YI_TIZEN_JS_FILES_HTML "<script src=\"${JS}\" type=\"text/javascript\"></script>")
    endforeach()

    foreach(FILE IN LISTS _TIZEN_CSS_FILES _TIZEN_JS_FILES)
        string(APPEND YI_TIZEN_FILES "\"${FILE}\", ")
    endforeach()

    add_custom_command(TARGET ${_ARGS_PACKAGE_TARGET}
        COMMAND ${CMAKE_COMMAND} -E make_directory "${_STAGING_DIR}/Temp"
    )

    include(Modules/YiCopyIfDifferent)
    yi_copy_if_different(TARGET ${_ARGS_PACKAGE_TARGET}
        SRC_DIRECTORY "${_WIDGET_FILES_PATH}"
        DEST_DIRECTORY "${_STAGING_DIR}/Temp"
        EXCLUDED_EXTENSIONS ".in"
    )


    # The default config.xml sets the application id to <YI_PACKAGE_ID>.<YI_PROJECT_NAME_LOWER> invalid values will prevent the app from being deploy/launched on a TV.
    # Here we are validating the values are within the contraints of the config.xml.
    include(Modules/YiRegexExtension)
    yi_regex_interval_expression(REGEX "[a-zA-Z0-9]"
        INPUT ${YI_PACKAGE_ID}
        MIN_TIMES_TO_MATCH 10
        MAX_TIMES_TO_MATCH 10
        MATCHES _VALID_PACKAGE_NAME)
    if (NOT ${_VALID_PACKAGE_NAME})
        message(FATAL_ERROR "Invalid value for YI_PACKAGE_ID <${YI_PACKAGE_ID}>. For Tizen-NaCl YI_PACKAGE_ID must be 10 characters limited to numbers and letters (a-z, A-Z,  0-9).")
    endif()

    yi_regex_interval_expression(REGEX "[a-zA-Z0-9]"
        INPUT ${YI_PROJECT_NAME}
        MIN_TIMES_TO_MATCH 1
        MAX_TIMES_TO_MATCH 52
        MATCHES _VALID_PROJECT_NAME)
    if (NOT ${_VALID_PROJECT_NAME})
        message(FATAL_ERROR "Invalid value for YI_PROJECT_NAME <${YI_PROJECT_NAME}>. For Tizen-NaCl YI_PROJECT_NAME must be between 1 and 52 characters limited to numbers and letters (a-z, A-Z, 0-9).")
    endif()

    include(Modules/YiStringUtilities)
    # Encode the variables which may have special characters for XML.
    yi_encode_string_for_xml(INPUT ${YI_AUTHOR_NAME} OUTPUT _AUTHOR_NAME_SANITIZED)
    yi_encode_string_for_xml(INPUT ${YI_DESCRIPTION} OUTPUT _DESCRIPTION_SANITIZED)
    yi_encode_string_for_xml(INPUT ${YI_DISPLAY_NAME} OUTPUT _DISPLAY_NAME_SANITIZED)
    # The encoded variables will contain ; within the encoded special characters, they need to be escaped for the add_custom_command to function correctly.
    string(REPLACE ";" "\\;" _AUTHOR_NAME_SANITIZED "${_AUTHOR_NAME_SANITIZED}")
    string(REPLACE ";" "\\;" _DESCRIPTION_SANITIZED "${_DESCRIPTION_SANITIZED}")
    string(REPLACE ";" "\\;" _DISPLAY_NAME_SANITIZED "${_DISPLAY_NAME_SANITIZED}")
    string(TOLOWER ${YI_PROJECT_NAME} _PROJECT_NAME_LOWER)

    add_custom_command(TARGET ${_ARGS_PACKAGE_TARGET}
        COMMAND ${RUBY_EXECUTABLE} ${YouiEngine_DIR}/tools/workflow/copyAssets.rb 
            --action update
            --source_directory ${CMAKE_CURRENT_BINARY_DIR}/assets 
            --destination_directory ${_STAGING_DIR}/Temp/assets
            --excluded_file_extensions \\.in
        COMMAND ${CMAKE_COMMAND} -D_STAGING_DIR=${_STAGING_DIR}
            -DCMAKE_BUILD_TYPE=${CMAKE_BUILD_TYPE}
            -D_WIDGET_FILES_PATH=${_WIDGET_FILES_PATH}
            -D_DEBUG_SCRIPT_PATH=${_DEBUG_SCRIPT_PATH}
            -D_MAIN_SCRIPT_PATH=${_MAIN_SCRIPT_PATH}
            -D_MAIN_APPLICATION_SCRIPT_PATH=${_MAIN_APPLICATION_SCRIPT_PATH}
            -DYI_AUTHOR_NAME=${_AUTHOR_NAME_SANITIZED}
            -DYI_COMPANY_URL=${YI_COMPANY_URL}
            -DYI_DESCRIPTION=${_DESCRIPTION_SANITIZED}
            -DYI_DISPLAY_NAME=${_DISPLAY_NAME_SANITIZED}
            -DYI_PACKAGE_ID=${YI_PACKAGE_ID}
            -DYI_SMART_HUB_PREVIEW_URL=${YI_SMART_HUB_PREVIEW_URL}
            -DYI_PROJECT_NAME=${YI_PROJECT_NAME}
            -DYI_PROJECT_NAME_LOWER=${_PROJECT_NAME_LOWER}
            -DYI_VERSION_NUMBER=${YI_VERSION_NUMBER}
            -DYI_TIZEN_NACL_STORAGE_QUOTA=${YI_TIZEN_NACL_STORAGE_QUOTA}
            -DYI_TIZEN_CSS_FILES_HTML=${YI_TIZEN_CSS_FILES_HTML}
            -DYI_TIZEN_JS_FILES_HTML=${YI_TIZEN_JS_FILES_HTML}
            -DYI_TIZEN_FILES=${YI_TIZEN_FILES}
            -P "${YouiEngine_DIR}/cmake/Modules/tizen-nacl/YiConfigureFilesInPackaging.cmake"
        VERBATIM
    )

    get_target_property(_RUNTIME_OUTPUT_DIRECTORY ${_ARGS_PROJECT_TARGET} RUNTIME_OUTPUT_DIRECTORY)

    string(REPLACE "[\ ;]" "," _TEMP_PERMISSIONS "${YI_PERMISSIONS}")

    if (YI_ARCH MATCHES "gcc")
        # The release libs are buggy, as `poll` crashes the nacl module, therefore we link against debug ones.
        set(_BUILD_TYPE "Debug")
    else()
        set(_BUILD_TYPE ${CMAKE_BUILD_TYPE})
    endif()

    add_custom_command(TARGET ${_ARGS_PACKAGE_TARGET}
        COMMAND ${CMAKE_COMMAND} -E remove_directory ${_STAGING_DIR}/Temp/CurrentBin
        COMMAND ${CMAKE_COMMAND} -E make_directory ${_STAGING_DIR}/Temp/CurrentBin
        COMMAND ${CMAKE_COMMAND} -E copy "${YI_PROJECT_NAME}" "${YI_PROJECT_NAME}_${YI_ARCH}.nexe"
        # Using python directly here because the NaCl toolchain is expecting it to be in the path.
        COMMAND python2 ${TIZEN_NACL_SDK_ROOT}/tools/create_nmf.py -o ${YI_PROJECT_NAME}_Temp.nmf -s ${_STAGING_DIR}/Temp/CurrentBin/ -v --config ${_BUILD_TYPE} "${YI_PROJECT_NAME}_${YI_ARCH}.nexe"
        COMMAND ${RUBY_EXECUTABLE} ${YouiEngine_DIR}/tools/platforms/tizen-nacl/addTizenPermissions.rb --nmf "${YI_PROJECT_NAME}_Temp.nmf" --permissions "${_TEMP_PERMISSIONS}"
        WORKING_DIRECTORY ${_RUNTIME_OUTPUT_DIRECTORY}
        COMMENT "Creating nmf..."
        VERBATIM
    )

    add_custom_command(TARGET ${_ARGS_PACKAGE_TARGET}
        COMMAND ${CMAKE_COMMAND}
            -D_STAGING_DIR=${_STAGING_DIR}
            -D_OUTPUT_FILE=${_STAGING_DIR}/Temp/CurrentBin/files-to-strip.txt
            -DCMAKE_STRIP=${CMAKE_STRIP}
            -P "${YouiEngine_DIR}/cmake/Modules/tizen-nacl/YiStripFilesInPackaging.cmake"
        # Strip all regardless of the configuration. The non-stripped executable may be selected in TizenStudio to debug.
        COMMAND ${CMAKE_STRIP} -v --strip-all @${_STAGING_DIR}/Temp/CurrentBin/files-to-strip.txt
        COMMAND ${CMAKE_COMMAND} -E remove -f ${_STAGING_DIR}/Temp/CurrentBin/files-to-strip.txt
        COMMENT "Stripping files..."
        VERBATIM
    )

    add_custom_command(TARGET ${_ARGS_PACKAGE_TARGET}
        COMMAND ${CMAKE_COMMAND} -E copy ${YI_PROJECT_NAME}_Temp.nmf ${_STAGING_DIR}/Temp/CurrentBin/${YI_PROJECT_NAME}.nmf
        WORKING_DIRECTORY ${_RUNTIME_OUTPUT_DIRECTORY}
        VERBATIM
    )

    add_custom_command(TARGET ${_ARGS_PACKAGE_TARGET}
        COMMAND ${RUBY_EXECUTABLE} ${YouiEngine_DIR}/tools/workflow/buildAssetManifest.rb -p${_STAGING_DIR}/Temp/assets
        COMMENT "Generating asset manifest..."
        VERBATIM
    )

    if(YI_SIGNING_IDENTITY)
        set(_SIGNING_IDENTITY_COMMAND "--sign ${YI_SIGNING_IDENTITY}")
    else()
        set(_SIGNING_IDENTITY_MESSAGE ${CMAKE_COMMAND} -E echo To use a certificate other than the active certificate in Tizen Studio specify YI_SIGNING_IDENTITY. This will specify --sign to the Tizen package command.)
    endif()

    get_filename_component(_FOLDER_NAME ${CMAKE_CURRENT_BINARY_DIR} NAME)
    set(_WGT_OUTPUT_FILENAME ${CMAKE_CURRENT_BINARY_DIR}/${YI_OUTPUT_FILENAME}-${CMAKE_BUILD_TYPE}.wgt)
    add_custom_command(TARGET ${_ARGS_PACKAGE_TARGET}
        COMMAND ${CMAKE_COMMAND} -E echo Enter your Tizen author certificate if/when prompted.
        COMMAND ${_SIGNING_IDENTITY_MESSAGE}
        COMMAND ${_TIZEN_COMMAND} package -- . --type wgt ${_SIGNING_IDENTITY_COMMAND}
        COMMAND ${CMAKE_COMMAND} -E rename "${YI_DISPLAY_NAME}.wgt" "${_WGT_OUTPUT_FILENAME}"
        COMMAND echo Final Package Location: ${_WGT_OUTPUT_FILENAME}
        WORKING_DIRECTORY ${_STAGING_DIR}/Temp
        USES_TERMINAL # This is required so that the Tizen package command will be able to prompt for certificate password.
        COMMENT "Generating WGT package..."
        VERBATIM
    )
    unset(_PROFILE_PATH_KEY_VALUE_PAIR)
    unset(_SIGNING_IDENTITY_COMMAND)

    add_custom_command(TARGET ${_ARGS_PACKAGE_TARGET}
        COMMAND ${CMAKE_COMMAND} -E remove_directory "${_STAGING_DIR}/Temp"
        VERBATIM
    )

    yi_add_package_target(${_ARGS_PROJECT_TARGET} "${_WGT_OUTPUT_FILENAME}")

    # The project needs to be built before the packaging phase can happen
    add_dependencies(${_ARGS_PACKAGE_TARGET} ${_ARGS_PROJECT_TARGET})

endfunction(yi_configure_packaging_for_platform)
