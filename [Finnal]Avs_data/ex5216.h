/*
 * libavs - Avantes interface for Avantes spectrometer library
 *
 *
 */

#ifndef _EXLIBAVS_H_
#define _EXLIBAVS_H_

#include <libavs/as5216.h>
#include <libavs/type.h>

#ifdef __cplusplus
extern "C" {
#endif

#define         SECURE_VERSION_LEN      4
#define         SECURE_SERIAL_LEN       9
#define         SECURE_TIMESTAMP_LEN    4
#define         SECURE_CUSTOMER_LEN     64
#define         SECURE_APPL_LEN         64

#define         SECURE_RESERVED_LEN     (2044 - (SECURE_VERSION_LEN + SECURE_SERIAL_LEN + SECURE_TIMESTAMP_LEN + SECURE_CUSTOMER_LEN + SECURE_APPL_LEN))


#pragma pack(push,1)

typedef struct
{
    uint8           m_aSwVersion[SECURE_VERSION_LEN];
    uint8           m_aSerialId[SECURE_SERIAL_LEN];
    uint8           m_aTimeStamp[SECURE_TIMESTAMP_LEN];
    uint8           m_aCustomerID[SECURE_CUSTOMER_LEN];
    uint8           m_aAppl[SECURE_APPL_LEN];
    uint8           m_aReserved[SECURE_RESERVED_LEN];
} SecureType;

//----------------------------------------------------------------------------
//
// Name         : AVS_GetRawScopeData
//
// Description  : Returns the values for each pixel
//
// Parameters   : a_hDevice     : device handle
//                a_pTimeLabel  : ticks count last pixel of spectrum is received
//                                by microcontroller, ticks in 10 mS units since
//                                spectrometer started
//                a_pSpectrum   : pointer to array of unsigned int.
//
// Returns      : integer       : 0, successfully started
//                                error code on error
//
// Remark(s)    : array size not checked
//
//----------------------------------------------------------------------------
DLL_INT AVS_GetRawScopeData( AvsHandle a_hDevice, unsigned int* a_pTimeLabel, unsigned short* a_pAvg, uint32* a_pSpectrum );

//----------------------------------------------------------------------------
//
// Name         : AVS_GetMeasPixels
//
// Description  : Returns the number of measuered pixels including dark
//
// Parameters   : a_hDevice     : device handle
//                a_pMeasPixels : pointer to unsigned int.
//
// Returns      : integer       : 0, successfully started
//                                error code on error
//
// Remark(s)    : 
//
//----------------------------------------------------------------------------
DLL_INT AVS_GetMeasPixels( AvsHandle a_hDevice , uint32* a_pMeasPixels );

//----------------------------------------------------------------------------
//
// Name         : AVS_GetVersionNumbers
//
// Description  : Returns the version numbers
//
// Parameters   : AvsIdentityType*  a_pDeviceId
//                a_pFPGAVersion, pointer to buffer to store version (32bit)
//                a_pFirmwareVersion, pointer to buffer to store version (32bit)
//            	  a_pDLLVersion pointer to buffer to store version (32bit)
//
// Returns      : integer         : 0, ok
//                                  <0 on error
//
// Remark(s)    : Does not check the size of the buffers allocated by the caller.
//
//----------------------------------------------------------------------------
DLL_INT AVS_GetVersionNumbers
(
    AvsIdentityType*  a_pDeviceId,
    unsigned int*     a_pFPGAVersion,
    unsigned int*     a_pFirmwareVersion,
    unsigned int*     a_pDLLVersion
);

//----------------------------------------------------------------------------
//
// Name         : AVS_GetSecureConfig
//
// Description  : Returns the Secure config
//
// Parameters   : AvsIdentityType*  a_pDeviceId
//            	  a_Data pointer to buffer to store Secure data
//
// Returns      : integer         : 0, ok
//                                  <0 on error
//
// Remark(s)    : Does not check the size of the buffers allocated by the caller.
//
//----------------------------------------------------------------------------
DLL_INT AVS_GetSecureConfig( AvsIdentityType* a_pDeviceId, SecureType *a_Data );

//----------------------------------------------------------------------------
//
// Name         : AVS_ForceStopMeas
//
// Description  : Send a stop message to the device not checking its state.
//
// Parameters   : AvsIdentityType*  a_pDeviceId
//
// Returns      : integer         : 0, ok
//                                  <0 on error
//
// Remark(s)    : 
//
//----------------------------------------------------------------------------
DLL_INT AVS_ForceStopMeas( AvsIdentityType*  a_pDeviceId );


//----------------------------------------------------------------------------
#pragma pack(pop)

#ifdef __cplusplus
} /* extern "C" */
#endif


#endif

