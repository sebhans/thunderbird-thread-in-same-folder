#!/bin/sh

NAME=thunderbird-thread-in-same-folder
VERSION=1.00

ZIPFILE=${NAME}-${VERSION}.xpi

rm -f ${ZIPFILE}

(cd src && zip -r - .) > ${ZIPFILE}
