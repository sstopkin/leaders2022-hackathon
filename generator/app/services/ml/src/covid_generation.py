from copy import deepcopy
from typing import List

import cv2 as cv
import lungmask.mask as lungmask
import numpy as np
import torch
from pydicom.dataset import FileDataset
from skimage.morphology import medial_axis


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


def min_max_normalization(matrix: np.ndarray, min_val: float = 0, max_val: float = 1):
    new_matrix = (matrix - np.min(matrix)) / (np.max(matrix) - np.min(matrix))
    new_matrix = new_matrix * (max_val - min_val) + min_val
    return new_matrix


def generate_covid_with_gan(G):
    noise = torch.randn(1, 100, 1, 1)
    with torch.no_grad():
        covid = G(noise)[0][0].numpy()

    covid = min_max_normalization(covid)

    return covid


def generate_2d_gaussian(desease_h, desease_w, ):
    x, y = np.meshgrid(np.linspace(-1, 1, desease_w), np.linspace(-1, 1, desease_h))
    d = np.sqrt(x * x + y * y)
    sigma, mu = 0.5, 0.0
    g = np.exp(-((d - mu) ** 2 / (2.0 * sigma ** 2)))
    return g


def prepocess_desease(covid, part_mask, covid_h, covid_w, bpx=5):
    disease = cv.resize(
        src=covid.copy(),
        dsize=(covid_w, covid_h),
        interpolation=cv.INTER_LINEAR
    )

    disease[:bpx] = 0
    disease[-bpx:] = 0
    disease[:, 0:bpx] = 0
    disease[:, -bpx:] = 0
    disease[part_mask == False] = 0
    disease = cv.GaussianBlur(disease, (7, 7), -1)

    _, distance = medial_axis(part_mask, return_distance=True)
    distance = min_max_normalization(distance)

    u = np.random.uniform(low=0.7, high=1, size=(covid_h, covid_w))
    g = generate_2d_gaussian(covid_h, covid_w)
    disease = (g * disease * u * distance)

    disease = min_max_normalization(disease)

    return disease


def get_covid(G, part_mask, covid_h, covid_w):
    covid = generate_covid_with_gan(G)
    disease = prepocess_desease(covid=covid, part_mask=part_mask, covid_h=covid_h, covid_w=covid_w)

    return disease


def add_desease_to_part_of_image(ct, lung_mask, ct_part, covid, part_mask):
    global_min_val = np.min(ct_part)
    global_max_val = np.max(ct_part)

    image_part = min_max_normalization(ct_part)

    min_val = (np.min(ct) - global_min_val) / (global_max_val - global_min_val)
    max_val = (np.max(ct) - global_min_val) / (global_max_val - global_min_val)

    covid = max_val * covid.copy()
    combo = image_part.copy()

    combo[part_mask] = combo[part_mask] * 0.5 + covid[part_mask] * 0.5
    combo[part_mask] = np.maximum(image_part[part_mask], combo[part_mask])

    combo = cv.GaussianBlur(combo, (3, 3), -1)
    combo = np.maximum(image_part, combo)

    combo = min_max_normalization(combo, global_min_val, global_max_val)
    combo = np.maximum(ct_part, combo)
    combo = combo.astype(ct_part.dtype)

    return combo


def add_covid_to_ct(ct, lung_mask, lung_segment_id, G):
    ct_part, part_mask, part_bbox = get_part_of_lung(
        ct=ct,
        segmentation=lung_mask,
        lung_label=lung_segment_id
    )

    covid_h, covid_w = ct_part.shape
    if (covid_h > 10) and (covid_w > 10):
        covid = get_covid(
            G=G,
            part_mask=part_mask,
            covid_h=covid_h,
            covid_w=covid_w
        )
        combo = add_desease_to_part_of_image(
            ct=ct,
            lung_mask=lung_mask,
            ct_part=ct_part,
            covid=covid,
            part_mask=part_mask
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


def get_disease_contours(original_ct, ct_wtih_disease, disease_threshold=0.2):
    diff = min_max_normalization(ct_wtih_disease - original_ct) > disease_threshold
    return get_contours(diff)


def add_covid_to_dicoms(dicoms: List[FileDataset], lung_part_list: List[int]):
    cts = get_covid_images(dicoms)

    model = lungmask.get_model('unet', 'LTRCLobes')
    segs = lungmask.apply(cts, model)

    new_dicoms = []
    dicom_contours = []

    G = torch.load("lastG.pt", map_location=torch.device("cpu"))
    for idx in range(len(dicoms)):

        new_dcm = deepcopy(dicoms[idx])
        ct = cts[idx]
        lung_mask = segs[idx]
        original_ct = ct.copy()

        for lung_seg_id in lung_part_list:
            if lung_seg_id in np.unique(lung_mask):
                ct = add_covid_to_ct(
                    ct=ct,
                    lung_mask=lung_mask,
                    lung_segment_id=lung_seg_id,
                    G=G
                )
        disease_contours = get_disease_contours(original_ct=original_ct, ct_wtih_disease=ct)

        new_dcm.PixelData = ct.tobytes()
        new_dcm._pixel_array = ct

        new_dicoms.append(new_dcm)
        dicom_contours.append(disease_contours)

    return new_dicoms, dicom_contours
