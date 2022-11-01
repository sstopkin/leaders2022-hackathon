import dicomParser from 'dicom-parser';
import * as cornerstone from '@cornerstonejs/core';
import cornerstoneWADOImageLoader from 'cornerstone-wado-image-loader';
import {init as csRenderInit} from "@cornerstonejs/core";
import {init as csToolsInit} from "@cornerstonejs/tools";

export function debounce(func, timeout = 300) {
    let timer;
    return (...args) => {
        clearTimeout(timer);
        timer = setTimeout(() => {
            func.apply(this, args);
        }, timeout);
    };
}

export function humanFileSize(bytes, si=false, dp=1) {
  const thresh = si ? 1000 : 1024;

  if (Math.abs(bytes) < thresh) {
    return bytes + ' B';
  }

  const units = si
      ? ['kB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB']
      : ['KiB', 'MiB', 'GiB', 'TiB', 'PiB', 'EiB', 'ZiB', 'YiB'];
  let u = -1;
  const r = 10**dp;

  do {
    bytes /= thresh;
    ++u;
  } while (Math.round(Math.abs(bytes) * r) / r >= thresh && u < units.length - 1);


  return bytes.toFixed(dp) + ' ' + units[u];
}

function initWADOImageLoader() {
    cornerstoneWADOImageLoader.external.cornerstone = cornerstone;
    cornerstoneWADOImageLoader.external.dicomParser = dicomParser;
    cornerstoneWADOImageLoader.configure({
        useWebWorkers: true,
        decodeConfig: {
            convertFloatPixelDataToInt: false,
        },
    });

    let maxWebWorkers = 1;

    if (navigator.hardwareConcurrency) {
        maxWebWorkers = Math.min(navigator.hardwareConcurrency, 7);
    }

    const config = {
        maxWebWorkers,
        startWebWorkersOnDemand: false,
        taskConfiguration: {
            decodeTask: {
                initializeCodecsOnStartup: false,
                strict: false,
            },
        },
    };

    cornerstoneWADOImageLoader.webWorkerManager.initialize(config);
}

export default async function initCornerstone() {
    initWADOImageLoader();
    await csRenderInit();
    await csToolsInit();
}

export const DICOM_DICTIONARY = {
    'x00100010': 'patientName',
    'x00100020': 'patientID',
    'x00100030': 'patientBirthdate',
    'x00100040': 'patientSex',
    'x00080080': 'institutionName',
    'x00200010': 'studyID',
    'x00081030': 'studyDescription',
    'x0008103e': 'seriesDescription',
    'x00080021': 'seriesDate',
    'x00080031': 'seriesTime',
    'x00200013': 'instance',
    'x00200011': 'series'
}

const parseDateString = (date) => {
    const year = date.substring(0, 4);
    const month = date.substring(4, 6);
    const day = date.substring(6, 8);
    return `${day}.${month}.${year}`
}

const parseTimeString = (time) => {
    const cleanTime = time.split(".")[0];

    const hour = cleanTime.substring(0, 2);
    const minutes = cleanTime.substring(2, 4);
    const seconds = cleanTime.substring(4, 6);

    return `${hour}:${minutes}:${seconds}`
}

export const formatDicomValues = (value, key) => {
    if (value) {
        if (key === 'patientBirthdate' || key === 'seriesDate') {
            return parseDateString(value)
        }
        if (key === 'seriesTime') {
            return parseTimeString(value)
        } else {
            return value
        }
    }
    return ""
}
