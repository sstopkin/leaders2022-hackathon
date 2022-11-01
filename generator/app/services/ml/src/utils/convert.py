from io import BytesIO
from typing import List

import pydicom
from pydicom.dataset import FileDataset


def pydicom_to_bytes(dicoms: List[FileDataset]):
    dicom_bytes = []
    for dcm in dicoms:
        with BytesIO() as bio:
            dcm.save_as(bio)
            dicom_bytes.append(bio.getvalue())

    return dicom_bytes


def dicom_bytes_to_pydicom(dicom_bytes_list: List[bytes]):
    return [pydicom.dcmread(BytesIO(dicom_bytes), force=True) for dicom_bytes in dicom_bytes_list]
