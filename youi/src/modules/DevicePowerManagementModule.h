#ifndef _DEVICE_POWER_MANAGEMENT_MODULE_H_
#define _DEVICE_POWER_MANAGEMENT_MODULE_H_

#include <youireact/NativeModule.h>

class YI_RN_MODULE(DevicePowerManagementModule)
{
public:
    DevicePowerManagementModule();
    virtual ~DevicePowerManagementModule() final;

    YI_RN_EXPORT_NAME(DevicePowerManagement);

    YI_RN_EXPORT_METHOD(keepDeviceScreenOn)
    (bool keepOn);
};

#endif // _DEVICE_POWER_MANAGEMENT_MODULE_H_
