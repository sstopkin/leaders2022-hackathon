from typing import List

from pydicom.dataset import FileDataset

from entities.research_entities import ResearchGeneratingParams, segmets_lung_parts, GeneratingPathology
from services.ml.src.cancer_generation import add_cancer_to_dicoms
from services.ml.src.covid_generation import add_covid_to_dicoms
from services.ml.src.utils.convert import pydicom_to_bytes, dicom_bytes_to_pydicom


def remove_broken_dicoms(dicoms: List[FileDataset]):
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


def order_dicoms(dicoms):
    new_dicoms = [(idx, dcm) for idx, dcm in enumerate(dicoms)]
    slices = sorted(new_dicoms, key=lambda s: s[1].SliceLocation)

    original_idx = [par[0] for par in slices]
    ordered_dicoms = [par[1] for par in slices]

    return ordered_dicoms, original_idx


def generate_pathologies(
        original_dicoms_bytes: List[bytes],
        generatingParams: ResearchGeneratingParams,
) -> List[bytes]:
    dicoms = dicom_bytes_to_pydicom(dicom_bytes_list=original_dicoms_bytes)
    dicoms, broken_dicoms = remove_broken_dicoms(dicoms)

    ordered_dicoms, original_idx = order_dicoms(dicoms)

    lung_part_list = list({segmets_lung_parts[segment] for segment in generatingParams.segments})

    if generatingParams.pathology == GeneratingPathology.COVID19:
        new_dicoms = add_covid_to_dicoms(ordered_dicoms, lung_part_list=lung_part_list)
    elif generatingParams.pathology == GeneratingPathology.CANCER:
        new_dicoms = add_cancer_to_dicoms(ordered_dicoms, lung_part_list=lung_part_list)

    original_ordered_dicoms = []
    for idx in range(len(ordered_dicoms)):
        for order_number, dicom in zip(original_idx, new_dicoms):
            if idx == order_number:
                original_ordered_dicoms.append(dicom)

    for idx, broken_dcm in broken_dicoms:
        original_ordered_dicoms.insert(idx, broken_dcm)

    dicom_bytes = pydicom_to_bytes(original_ordered_dicoms)

    return dicom_bytes
