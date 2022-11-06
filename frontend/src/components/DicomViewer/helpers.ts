import {RawMarkup} from "../../interfaces";
import {VOIRange} from "@cornerstonejs/core/dist/esm/types";
import {Annotation} from "@cornerstonejs/tools/dist/esm/types";
import {v4 as uuidv4} from "uuid";

export interface DicomViewerProps {
    dicomFiles: Array<File>,
    currentUserName: string,
    currentUserId: string,
    currentResearchId: string,
    markup?: null | RawMarkup,
    autoMarkup?: null | Array<Array<Array<{ x: number, y: number }>>>
}

export interface AnnotationsState {
    [userId: string]: {
        username: string
        info: Array<{
            uuid: string,
            toolName: string,
            imageIdx: number,
            isVisible: boolean,
        }>
    }
}

export type VoiModes =
    'BRAIN'
    | 'SUBDURAL'
    | 'TEMPORAL_BONES'
    | 'HEAD_SOFT_TISSUES'
    | 'LUNGS'
    | 'ABDOMEN_SOFT_TISSUES'
    | 'LIVER'
    | 'SPINE_SOFT_TISSUES'
    | 'SPINE_BONES' | 'DEFAULT';

export const VoiModesLabels = ['DEFAULT', 'BRAIN', 'SUBDURAL', 'TEMPORAL_BONES', 'HEAD_SOFT_TISSUES', 'LUNGS', 'ABDOMEN_SOFT_TISSUES', 'LIVER', 'SPINE_SOFT_TISSUES', 'SPINE_BONES']

export const VoiModesValues: { [key in VoiModes]: VOIRange } = {
    DEFAULT: {
        upper: 0,
        lower: 0
    },
    BRAIN: {
        upper: 80,
        lower: 40
    },
    SUBDURAL: {
        upper: 300,
        lower: 100
    },
    TEMPORAL_BONES: {
        upper: 2800,
        lower: 600
    },
    HEAD_SOFT_TISSUES: {
        upper: 400,
        lower: 60
    },
    LUNGS: {
        upper: 1500,
        lower: 600
    },
    ABDOMEN_SOFT_TISSUES: {
        upper: 400,
        lower: 50
    },
    LIVER: {
        upper: 150,
        lower: 30
    },
    SPINE_SOFT_TISSUES: {
        upper: 250,
        lower: 50
    },
    SPINE_BONES: {
        upper: 1800,
        lower: 400
    }
}

export const generatePolygon = (FrameOfReferenceUID: string, index: number, points: Array<Array<number>>): Annotation => {
    return {
        isVisible: true,
        "metadata": {
            "viewPlaneNormal": [
                0,
                0,
                -1
            ],
            "viewUp": [
                0,
                -1,
                0
            ],
            "FrameOfReferenceUID": FrameOfReferenceUID,
            "referencedImageId": `dicomfile:${index}`,
            "toolName": "PlanarFreehandROI"
        },
        "data": {
            "handles": {
                "points": [],
                "activeHandleIndex": null,
                "textBox": {
                    "hasMoved": false,
                    "worldPosition": [
                        0,
                        0,
                        0
                    ],
                    "worldBoundingBox": {
                        "topLeft": [
                            0,
                            0,
                            0
                        ],
                        "topRight": [
                            0,
                            0,
                            0
                        ],
                        "bottomLeft": [
                            0,
                            0,
                            0
                        ],
                        "bottomRight": [
                            0,
                            0,
                            0
                        ]
                    }
                }
            },
            "polyline": points,
            "label": "",
            "isOpenContour": false
        },
        "annotationUID": uuidv4()
    }
}
