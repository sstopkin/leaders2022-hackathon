from typing import List

from pydicom.dataset import FileDataset

from services.ml.src.generate import add_disease_to_dicoms
from services.ml.src.utils.convert import pydicom_to_bytes, dicom_bytes_to_pydicom


def remove_broken_dicoms(dicoms: list[FileDataset]):
    normal_dicoms = []
    broken_dicoms = []
    for idx, dcm in enumerate(dicoms):
        try:
            dcm.pixel_array
            normal_dicoms.append(dcm)
        except Exception as exp:
            broken_dicoms.append((idx, dcm))
            print(exp)

    return normal_dicoms, broken_dicoms


def generate_pathologies(
        original_dicoms_bytes: List[bytes],
        lung_part_list: List[int] = [1, 2, 3, 4, 5]) -> List[bytes]:
    dicoms = dicom_bytes_to_pydicom(dicom_bytes_list=original_dicoms_bytes)
    dicoms, broken_dicoms = remove_broken_dicoms(dicoms)

    new_dicoms = add_disease_to_dicoms(dicoms, lung_part_list=lung_part_list)

    for idx, broken_dcm in broken_dicoms:
        new_dicoms.insert(idx, broken_dcm)

    dicom_bytes = pydicom_to_bytes(new_dicoms)

    return dicom_bytes
