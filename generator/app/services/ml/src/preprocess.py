import numpy as np
from pydicom.pixel_data_handlers import apply_modality_lut


def get_dicom_images(dicoms):
    return np.concatenate([apply_modality_lut(ds.pixel_array, ds)[None] for ds in dicoms])
