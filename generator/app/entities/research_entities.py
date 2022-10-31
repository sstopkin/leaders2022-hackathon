import uuid
from enum import Enum
from typing import List, Optional

from pydantic import BaseModel


class ResearchStatus(str, Enum):
    CREATED = 'created',
    UPLOADING = 'uploading',
    UPLOADED = 'uploaded',
    GENERATING = 'generating',
    GENERATED = 'generated',


class Research(BaseModel):
    id: uuid.UUID
    name: str
    description: Optional[str]
    status: ResearchStatus
    createdByUserId: uuid.UUID


class GetResearchesResponse(BaseModel):
    data: List[Research]
