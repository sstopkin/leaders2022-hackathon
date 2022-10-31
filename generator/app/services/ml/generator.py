from io import BytesIO

import pydicom

from services.ml.src.generate import damage_dicoms


def pydicom_to_bytes(dicom):
    with BytesIO() as bi:
        dicom.save_as(bi)
        return bi.getvalue()


def generate_pathologies(original_dicom_bytes: bytes, lung_part: int) -> list(bytes):
    ds = pydicom.dcmread(BytesIO(original_dicom_bytes), force=True)
    new_dicoms = damage_dicoms([ds], lung_part=lung_part)
    dicom_bytes = [pydicom_to_bytes(dicom) for dicom in new_dicoms]
    return dicom_bytes
