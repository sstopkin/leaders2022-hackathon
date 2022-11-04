import uuid
from enum import Enum
from typing import List, Optional

from pydantic import BaseModel


class ResearchStatus(str, Enum):
    CREATED = 'created'
    READY_TO_MARK = 'ready_to_mark'
    GENERATING = 'generating'
    IN_MARKUP = 'in_markup'
    MARKUP_DONE = 'markup_done'
    ERROR = 'error'


class GeneratingSegment(str, Enum):
    RIGHT_DOWN = 'rightDown'
    RIGHT_MIDDLE = 'rightMiddle'
    RIGHT_UP = 'rightUp'
    LEFT_DOWN = 'leftDown'
    LEFT_UP = 'leftUp'


segmets_lung_parts = {
    GeneratingSegment.RIGHT_DOWN: 5,
    GeneratingSegment.RIGHT_MIDDLE: 4,
    GeneratingSegment.RIGHT_UP: 3,
    GeneratingSegment.LEFT_DOWN: 2,
    GeneratingSegment.LEFT_UP: 1,
}


class GeneratingPathology(str, Enum):
    COVID19 = 'covid19'
    CANCER = 'cancer'
    METASTASIS = 'metastasis'


class GeneratingDiseasesCount(str, Enum):
    SINGLE = 'single'
    SMALL = 'small'
    HIGH = 'high'


class GeneratingDiseasesSize(str, Enum):
    EXTRA_SMALL = 'extraSmall'
    SMALL = 'small'
    MEDIUM = 'medium'
    HIGH = 'high'


class ResearchGeneratingParams(BaseModel):
    segments: List[GeneratingSegment]
    pathology: GeneratingPathology
    diseasesCount: GeneratingDiseasesCount
    diseaseSize: GeneratingDiseasesSize
    autoMarkup: bool


class GeneratingResearch(BaseModel):
    id: uuid.UUID
    name: str
    description: Optional[str]
    status: ResearchStatus
    createdByUserId: uuid.UUID
    parentResearchId: uuid.UUID
    generatingParams: ResearchGeneratingParams


class GetResearchesResponse(BaseModel):
    data: List[GeneratingResearch]
