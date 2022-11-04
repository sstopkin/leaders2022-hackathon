from copy import deepcopy
from typing import List

import cv2 as cv
import numpy as np
import porespy as ps
from lungmask import mask as lungmask
from pydicom import FileDataset
from skimage.morphology import medial_axis


def min_max_normalization(matrix: np.ndarray, min_val: float = 0, max_val: float = 1):
    new_matrix = (matrix - np.min(matrix)) / (np.max(matrix) - np.min(matrix))
    new_matrix = new_matrix * (max_val - min_val) + min_val
    return new_matrix


def get_bbox_from_contour(contour):
    x_min, x_max = contour[:, 0, 0].min(), contour[:, 0, 0].max()
    y_min, y_max = contour[:, 0, 1].min(), contour[:, 0, 1].max()

    return [x_min, y_min, x_max, y_max]


def get_part_of_lung(ct, segmentation, lung_label):
    lung_seg_part = (segmentation == lung_label) * 255
    lung_seg_part = lung_seg_part.astype(np.uint8)

    contours, hierarchy = cv.findContours(image=lung_seg_part, mode=cv.RETR_TREE, method=cv.CHAIN_APPROX_NONE)
    x_min, y_min, x_max, y_max = get_bbox_from_contour(contours[0])

    segmentation_part = segmentation[y_min:y_max, x_min:x_max] == lung_label
    part_bbox = [x_min, y_min, x_max, y_max]

    return ct[y_min:y_max, x_min:x_max], segmentation_part, part_bbox


def generate_2d_gaussian(desease_h, desease_w, ):
    x, y = np.meshgrid(np.linspace(-1, 1, desease_w), np.linspace(-1, 1, desease_h))
    d = np.sqrt(x * x + y * y)
    sigma, mu = 0.5, 0
    g = np.exp(-((d - mu) ** 2 / (2.0 * sigma ** 2)))
    g = (g - np.min(g)) / (np.max(g) - np.min(g))
    return g


def prepocess_desease(disease, lung_mask, disease_h, disease_w, bpx=5):
    disease = cv.resize(disease.copy(), (disease_w, disease_h), None, interpolation=cv.INTER_LINEAR)

    disease[:bpx] = 0
    disease[-bpx:] = 0
    disease[:, 0:bpx] = 0
    disease[:, -bpx:] = 0

    disease[lung_mask == False] = 0
    disease = cv.GaussianBlur(disease, (3, 3), -1)
    g = generate_2d_gaussian(disease_h, disease_w)

    u = np.random.uniform(low=0.6, high=1, size=(disease_h, disease_w))
    _, distance = medial_axis(lung_mask, return_distance=True)
    distance = min_max_normalization(distance)

    disease = disease * u * g
    disease = min_max_normalization(disease)

    disease[disease > 0.3] = 1
    disease = min_max_normalization(disease)

    return disease.astype(np.float32)


def get_cancer_desease(lung_mask, disease_h, disease_w, ):
    disease = ps.generators.blobs(shape=[disease_h, disease_w], porosity=None, blobiness=4)
    kernel = cv.getStructuringElement(cv.MORPH_ELLIPSE, (7, 7))
    disease = cv.morphologyEx(disease, cv.MORPH_OPEN, kernel)
    disease = min_max_normalization(disease)
    disease = prepocess_desease(disease=disease, lung_mask=lung_mask, disease_h=disease_h, disease_w=disease_w, )
    kernel = cv.getStructuringElement(cv.MORPH_ELLIPSE, (3, 3))
    disease = cv.morphologyEx(disease, cv.MORPH_ERODE, kernel)
    disease = min_max_normalization(disease)
    return disease


def add_desease_to_part_of_image(ct_part, cancer, lung_mask, ct, body_mask):
    global_min_val = np.min(ct_part)
    global_max_val = np.max(ct_part)

    image_part = min_max_normalization(ct_part)

    min_val = np.min(image_part)  # (np.min(ct[body_mask]) - global_min_val) / (global_max_val - global_min_val)
    max_val = np.max(image_part)  # (np.mean(ct[body_mask])- global_min_val) / (global_max_val - global_min_val)

    cancer = min_max_normalization(cancer, min_val, max_val)
    combo = image_part.copy()

    combo = np.maximum(combo, cancer)
    combo = cv.GaussianBlur(combo, (3, 3), -1)

    combo = min_max_normalization(combo, global_min_val, global_max_val)
    combo = np.maximum(ct_part, combo)
    combo = combo.astype(ct_part.dtype)

    return combo


def get_body_part(ct, segmentation, ct_threshold: float = 0.1):
    non_lung_part = segmentation == 0
    all_body_part = min_max_normalization(ct) > ct_threshold
    body = non_lung_part & all_body_part

    return body


def add_cancer_to_ct(ct, lung_mask, lung_segment_id):
    ct_part, part_mask, part_bbox = get_part_of_lung(
        ct=ct,
        segmentation=lung_mask,
        lung_label=lung_segment_id
    )

    body_mask = get_body_part(ct=ct, segmentation=lung_mask)

    cancer_h, cancer_w = ct_part.shape
    if (cancer_h > 10) and (cancer_w > 10):
        cancer = get_cancer_desease(
            lung_mask=part_mask,
            disease_h=cancer_h,
            disease_w=cancer_w
        )
        combo = add_desease_to_part_of_image(
            ct=ct,
            ct_part=ct_part,
            cancer=cancer,
            lung_mask=part_mask,
            body_mask=body_mask
        )

        img_changed = ct.copy()

        img_changed[part_bbox[1]:part_bbox[3], part_bbox[0]:part_bbox[2]] = combo

        return img_changed
    else:
        return ct


def get_covid_images(dicoms):
    return np.concatenate([ds.pixel_array[None] for ds in dicoms])


def get_points_from_contour(contour):
    points = []
    for point in contour:
        points.append([point[0, 0], point[0, 1]])

    return np.array(points, np.int32)


def get_contours(mask):
    mask = mask * 255
    mask = mask.astype(np.uint8)

    contours, hierarchy = cv.findContours(image=mask, mode=cv.RETR_TREE, method=cv.CHAIN_APPROX_TC89_L1)

    new_contours = []
    if hierarchy is not None:
        for cntr, hrch in zip(contours, hierarchy[0]):

            if (len(cntr) > 10) and (hrch[3] == -1):
                new_cntr = get_points_from_contour(cntr)
                new_contours.append(new_cntr)

    return new_contours


def get_disease_contours(original_ct, ct_wtih_disease, disease_threshold=0.1):
    diff = min_max_normalization(ct_wtih_disease - original_ct) > disease_threshold
    return get_contours(diff)


def add_metastasis_to_dicoms(dicoms: List[FileDataset], lung_part_list: List[int]):
    cts = get_covid_images(dicoms)

    model = lungmask.get_model('unet', 'LTRCLobes')
    segs = lungmask.apply(cts, model)

    new_dicoms = []
    dicom_contours = []
    for idx in range(len(dicoms)):

        new_dcm = deepcopy(dicoms[idx])
        ct = cts[idx]
        lung_mask = segs[idx]
        original_ct = ct.copy()

        for lung_seg_id in lung_part_list:
            if lung_seg_id in np.unique(lung_mask):
                ct = add_cancer_to_ct(
                    ct=ct,
                    lung_mask=lung_mask,
                    lung_segment_id=lung_seg_id,
                )

        disease_contours = get_disease_contours(original_ct=original_ct, ct_wtih_disease=ct)
        new_dcm.PixelData = ct.tobytes()
        new_dcm._pixel_array = ct

        new_dicoms.append(new_dcm)
        disease_contours.append(dicom_contours)

    return new_dicoms, dicom_contours
