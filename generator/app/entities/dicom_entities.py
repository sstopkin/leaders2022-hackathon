import uuid
from enum import Enum
from typing import Dict, Optional

from pydantic import BaseModel


class DicomType(str, Enum):
    ORIGINAL = 'original',
    GENERATED = 'generated',


class DicomStatus(str, Enum):
    NOT_MARKED = 'not_marked',
    IN_MARKUP = 'in_markup',
    MARKUP_DONE = 'markup_done',


class Dicom(BaseModel):
    id: uuid.UUID
    name: str
    description: Optional[str]
    dicomType: DicomType
    isUploaded: bool
    researchId: uuid.UUID
    downloadingUrl: str
    markup: Optional[Dict]
    status: DicomStatus


class NewDicom(BaseModel):
    name: str
    description: Optional[str]
    dicomType: DicomType
    researchId: str


class CreatedDicom(BaseModel):
    id: uuid.UUID
    name: str
    description: Optional[str]
    dicomType: DicomType
    researchId: uuid.UUID
    uploadingUrl: str
