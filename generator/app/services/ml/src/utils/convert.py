from io import BytesIO

import pydicom


def pydicom_to_bytes(dicom):
    with BytesIO() as bi:
        dicom.save_as(bi)
        return bi.getvalue()


def dicom_bytes_to_pydicom(dicom_bytes_list: list[bytes]):
    return [pydicom.dcmread(BytesIO(dicom_bytes), force=True) for dicom_bytes in dicom_bytes_list]
