from copy import deepcopy

import cv2 as cv
import numpy as np
import torch
from lungmask import mask as lungmask

from services.ml.src.preprocess import get_dicom_images


def get_part_of_lung(image, segmentation, lung_label):
    lung_seg_part = (segmentation == lung_label) * 255
    lung_seg_part = lung_seg_part.astype(np.uint8)

    contours, hierarchy = cv.findContours(image=lung_seg_part, mode=cv.RETR_TREE, method=cv.CHAIN_APPROX_NONE)
    x_min, y_min, x_max, y_max = get_bbox_from_contour(contours[0])
    segmentation_part = segmentation[y_min:y_max, x_min:x_max] == lung_label
    part_bbox = [x_min, y_min, x_max, y_max]
    return image[y_min:y_max, x_min:x_max], segmentation_part, part_bbox


def get_bbox_from_contour(contour):
    x_min, x_max = contour[:, 0, 0].min(), contour[:, 0, 0].max()
    y_min, y_max = contour[:, 0, 1].min(), contour[:, 0, 1].max()

    return [x_min, y_min, x_max, y_max]


def generate_desease(G):
    noise = torch.randn(1, 100, 1, 1)
    with torch.no_grad():
        desease = G(noise)[0][0].numpy()

    return desease


def generate_2d_gaussian(desease_h, desease_w, ):
    x, y = np.meshgrid(np.linspace(-1, 1, desease_w), np.linspace(-1, 1, desease_h))
    d = np.sqrt(x * x + y * y)
    sigma, mu = 0.5, 0.0
    g = np.exp(-((d - mu) ** 2 / (2.0 * sigma ** 2)))
    return g


def prepocess_desease(desease, lung_mask, desease_h, desease_w, bpx=5):
    img = cv.resize(desease, (desease_w, desease_h), None, interpolation=cv.INTER_LINEAR)
    img = img * 0.5 + 0.5

    img[:bpx] = 0
    img[-bpx:] = 0
    img[:, 0:bpx] = 0
    img[:, -bpx:] = 0

    img[lung_mask == False] = 0
    img = cv.GaussianBlur(img, (7, 7), -1)
    g = generate_2d_gaussian(desease_h, desease_w, )
    img = (g * img).astype(np.float32)

    return img


def get_random_desease(G, lung_mask, desease_h, desease_w, ):
    desease = generate_desease(G)
    desease = prepocess_desease(desease=desease, lung_mask=lung_mask, desease_h=desease_h, desease_w=desease_w, )

    return desease


def add_disease_to_part_of_image(part, disease, lung_mask):
    global_min_val = np.min(part)
    global_max_val = np.max(part)

    image_part = (part.copy() - global_min_val) / (global_max_val - global_min_val)
    image_part = image_part.astype(np.float32)

    max_val = np.max(image_part)

    disease = max_val * disease.copy()
    combo = image_part.copy()

    combo[lung_mask] = combo[lung_mask] * 0.5 + disease[lung_mask] * 0.5
    combo[lung_mask] = np.maximum(image_part[lung_mask], combo[lung_mask])

    combo = cv.GaussianBlur(combo, (3, 3), -1)
    combo = np.maximum(image_part, combo)

    combo = combo * (global_max_val - global_min_val) + global_min_val
    combo = combo.astype(np.int32)

    return combo


def damage_image(image, segmentation, lung_segment_id):
    G = torch.load("lastG.pt", map_location=torch.device("cpu"))

    image_part, mask_part, bbox_part = get_part_of_lung(image, segmentation, lung_segment_id)
    disease_h, disease_w = image_part.shape
    disease_original = get_random_desease(G=G, lung_mask=mask_part, desease_h=disease_h, desease_w=disease_w)
    combo = add_disease_to_part_of_image(image_part, disease_original, mask_part)

    img_changed = image.copy()

    img_changed[bbox_part[1]:bbox_part[3], bbox_part[0]:bbox_part[2]] = combo
    img_changed = img_changed - img_changed.min()
    img_changed = img_changed.astype(np.uint16)

    return img_changed


def add_disease_to_dicoms(dicoms: list, lung_part: int):
    model_input = get_dicom_images(dicoms)

    model = lungmask.get_model('unet', 'LTRCLobes')
    segs = lungmask.apply(model_input, model)

    new_dicoms = []

    for idx in range(len(dicoms)):
        new_dcm = deepcopy(dicoms[idx])

        if lung_part in np.unique(segs[idx]):
            img_changed = damage_image(model_input[idx], segs[idx], lung_part)
            new_dcm.PixelData = img_changed.tobytes()
            new_dcm._pixel_array = img_changed

        new_dicoms.append(new_dcm)
    return new_dicoms
