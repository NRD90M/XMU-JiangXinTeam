# @configure_input@

package = @PACKAGE_NAME@
version = @PACKAGE_VERSION@
tarname = @PACKAGE_TARNAME@
distdir = $(tarname)-$(version)

prefix		= @prefix@
exec_prefix	= @exec_prefix@
libdir		= @libdir@

CXX            = g++

INCPATH  = -I/usr/local/include/libusb-1.0 -I. -I/usr/local/include/libavs -lwiringPi  -L/usr/local/lib

CFLAGS        = -Wall
TESTSRC       = testavs.cpp
TESTAPP       = testavs
TESTOBJ       = testavs.o 

all:
	$(CXX) $(CFLAGS) $(INCPATH) -L. $(TESTSRC) -o $(TESTAPP) -lavs

clean:
	-rm $(TESTOBJ)


.PHONY: all clean
