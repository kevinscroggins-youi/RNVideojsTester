#include "DevicePowerManagementModule.h"

#include <platform/YiDeviceBridgeLocator.h>
#include <platform/YiDevicePowerManagementBridge.h>
#include <youireact/IBridge.h>
#include <youireact/NativeModuleRegistry.h>

using namespace yi::react;

YI_RN_INSTANTIATE_MODULE(DevicePowerManagementModule);
YI_RN_REGISTER_MODULE(DevicePowerManagementModule);

DevicePowerManagementModule::DevicePowerManagementModule() = default;

DevicePowerManagementModule::~DevicePowerManagementModule() = default;

YI_RN_DEFINE_EXPORT_METHOD(DevicePowerManagementModule, keepDeviceScreenOn)
(bool keepOn)
{
    if (auto pBridge = CYIDeviceBridgeLocator::GetDevicePowerManagementBridge())
    {
        pBridge->KeepDeviceScreenOn(keepOn);
    }
}
