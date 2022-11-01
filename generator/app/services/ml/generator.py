from pydicom.dataset import FileDataset

from services.ml.src.generate import add_disease_to_dicoms
from services.ml.src.utils.convert import pydicom_to_bytes, dicom_bytes_to_pydicom


def remove_broken_dicoms(dicoms: list[FileDataset]):
    normal_dicoms = []
    for dcm in dicoms:
        try:
            dcm.pixel_array
            normal_dicoms.append(dcm)
        except Exception as exp:
            print(exp)

    return normal_dicoms


def generate_pathologies(original_dicom_bytes: bytes, lung_part: int = 2) -> bytes:
    dicoms = dicom_bytes_to_pydicom(dicom_bytes_list=[original_dicom_bytes])
    dicoms = remove_broken_dicoms(dicoms)

    dicoms[0].save_as("original.dcm")
    new_dicoms = add_disease_to_dicoms(dicoms, lung_part=lung_part)

    new_dicoms[0].save_as("original.dcm")
    dicom_bytes = [pydicom_to_bytes(dicom) for dicom in new_dicoms]

    return dicom_bytes[0]
