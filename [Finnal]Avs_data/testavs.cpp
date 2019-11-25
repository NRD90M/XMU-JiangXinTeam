/*
 *   Test application for the AS5216 library.
 *
 */
#include <stdio.h>
#include </home/pi/avs_data/type.h>
#include </home/pi/avs_data/as5216.h>
#include <time.h>

#include <termios.h>
#include <unistd.h>
#include <fcntl.h>
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <wiringSerial.h>

void delay_ms(float seconds)
{
    clock_t endwait;
    endwait = clock() + seconds * CLOCKS_PER_SEC;
    while (clock() < endwait)
    {
    }
}
 
void delay(int seconds)
 
{
   clock_t start = clock();
   clock_t lay = (clock_t)seconds * CLOCKS_PER_SEC;
   while ((clock()-start) < lay);
}

int serial_init()
{
    int fd = serialOpen ("/dev/deviceMOTO", 9600);
    return fd;
}

void set_moto_speed(int fd ,unsigned char sp)
{
    serialPutchar (fd, 0X55);
    serialPutchar (fd, 0X08);
    serialPutchar (fd, 0X01);
    serialPutchar (fd, (sp >> 8) & 0xFF);
    serialPutchar (fd, sp & 0xFF);
    serialPutchar (fd, 0X07);
    serialPutchar (fd, 0X66);   
}
void set_moto_time(int fd ,unsigned char tm)
{
    serialPutchar (fd, 0X55);
    serialPutchar (fd, 0X08);
    serialPutchar (fd, 0X02);
    serialPutchar (fd, (tm >> 8) & 0xFF);
    serialPutchar (fd, tm & 0xFF);
    serialPutchar (fd, 0X07);
    serialPutchar (fd, 0X66);   
}
void moto_start_stop(int fd ,unsigned char on)
{
    serialPutchar (fd, 0X55);
    serialPutchar (fd, 0X08);
    serialPutchar (fd, 0X03);
    serialPutchar (fd, on);
    serialPutchar (fd, 0X00);
    serialPutchar (fd, 0X07);
    serialPutchar (fd, 0X66);   
}
void moto_white(int fd)
{
    serialPutchar (fd, 0X55);
    serialPutchar (fd, 0X08);
    serialPutchar (fd, 0X05);
    serialPutchar (fd, 0X00);
    serialPutchar (fd, 0X00);
    serialPutchar (fd, 0X07);
    serialPutchar (fd, 0X66);   
}

void moto_step(int fd)
{
    serialPutchar (fd, 0X55);
    serialPutchar (fd, 0X08);
    serialPutchar (fd, 0X07);
    serialPutchar (fd, 0X00);
    serialPutchar (fd, 0X00);
    serialPutchar (fd, 0X07);
    serialPutchar (fd, 0X66);   
}
void moto_eleven_step(int fd)
{
    serialPutchar (fd, 0X55);
    serialPutchar (fd, 0X08);
    serialPutchar (fd, 0X06);
    serialPutchar (fd, 0X00);
    serialPutchar (fd, 0X00);
    serialPutchar (fd, 0X07);
    serialPutchar (fd, 0X66);   
}
void serial_close(int fd)
{
    serialClose (fd);
}
void serial_read_buff(int fd,void * buf,size_t count)
{
    int num = serialDataAvail (fd);
    if (num != -1 && size_t(num) == count)
    {
	read(fd,buf,count);
    }
}

    //AVS_SetDigOut(handle,3,0)   close

   // AVS_SetDigOut(handle,3,1)  open

 /* int fd = serial_init();
  printf ("serialOpen: %d\n",fd);
  moto_eleven_step(fd);*/
 
 

int main(void)
{

    unsigned int ByteSet;
    double mLambda[2070];
    unsigned int ltime = 0;
    double mydata[2048];
    int t;
    FILE *fp1;
    FILE *fp2;
    fp2  =  fopen("fuzhi.txt","w");
    fp1  =  fopen("bochang.txt","w");
    
    

    MeasConfigType l_PrepareMeasData;
    l_PrepareMeasData.m_StartPixel = 0;
    l_PrepareMeasData.m_StopPixel = 2047;
    l_PrepareMeasData.m_IntegrationTime = 2;
    l_PrepareMeasData.m_IntegrationDelay = 0;
    l_PrepareMeasData.m_NrAverages = 150;
    l_PrepareMeasData.m_CorDynDark.m_Enable = 0;
    l_PrepareMeasData.m_CorDynDark.m_ForgetPercentage = 0;
    l_PrepareMeasData.m_Smoothing.m_SmoothPix = 20;
    l_PrepareMeasData.m_Smoothing.m_SmoothModel = 0;
    l_PrepareMeasData.m_SaturationDetection = 0;
    l_PrepareMeasData.m_Trigger.m_Mode = 1;
    l_PrepareMeasData.m_Trigger.m_Source = 0;
    l_PrepareMeasData.m_Trigger.m_SourceType = 0;
    l_PrepareMeasData.m_Control.m_StrobeControl = 0;
    l_PrepareMeasData.m_Control.m_LaserDelay = 0;
    l_PrepareMeasData.m_Control.m_LaserWidth = 0;
    l_PrepareMeasData.m_Control.m_LaserWaveLength = 0;
    l_PrepareMeasData.m_Control.m_StoreToRam = 0;

    int fd = serial_init();
    printf ("serialOpen: %d\n",fd);


    AvsIdentityType a_pList[5];
    int n = AVS_Init(0);
    printf("USB spectrometers found: %d\n", AVS_GetNrOfDevices());
    n = AVS_GetList( sizeof(a_pList), &ByteSet, a_pList );
    printf ("Test spectrometer: %d\n", n );
    AvsHandle handle;
    for (int i = 0; i < n; i++)
    {
	handle = AVS_Activate( &a_pList[i] );
	printf ("Test spectrometer: %s\n", a_pList[i].SerialNumber );
    }
    delay_ms(0.1);
    AVS_GetLambda(handle,mLambda);
    for(int i=0;i<2048;i++)
    {
	fprintf(fp1,"%.1f\n",mLambda[i]);
    }
    
    AVS_SetDigOut(handle,3,1);  //open shutter
    
    int l_Res = AVS_PrepareMeasure(handle,&l_PrepareMeasData);
    printf ("AVS_PrepareMeasure: %d\n",l_Res);
    l_Res = AVS_Measure(handle,0,1);
    moto_eleven_step(fd);
    for(int i=0;i<11;i++)
    {
	t = AVS_PollScan(handle);
	while(t==0)
	{
            delay_ms(0.01);
	    t = AVS_PollScan(handle);
	}
	AVS_GetScopeData(handle,&ltime,mydata);
	for(int i=0;i<2048;i++)
	{
	    fprintf(fp2,"%.1f\n",mydata[i]);
	}
	t=0;
        l_Res = AVS_Measure(handle,0,1);
    }
AVS_SetDigOut(handle,3,0);  //close shutter
serial_close(fd);
AVS_Deactivate( handle );
AVS_StopMeasure(handle);
AVS_Done();
}

