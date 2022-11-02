import datetime
import logging
import uuid
from typing import Optional, List

from communicators import cloud_client
from communicators.backend_client import BackendClient
from entities.dicom_entities import Dicom, NewDicom, CreatedDicom
from entities.research_entities import GeneratingResearch, ResearchStatus
from services.core.abstract_loop_service import AbstractLoopService
from services.ml import generator

logger = logging.getLogger(__name__)


class MainGeneratorLoop(AbstractLoopService):
    def __init__(self, period: datetime.timedelta, backend_client: BackendClient):
        self._backend_client = backend_client
        super().__init__(period)

    def run_step(self):
        logger.debug('Started researches fetching which should be generated')

        research = None
        try:
            research = self._get_research_to_generate()
            if research is None:
                logger.debug('No researches to generate')
                return
            logger.info(f'Found research to generate: {research.id} - {research.name}')
            #
            original_dicoms = self._get_research_original_dicoms(research=research)
            if len(original_dicoms) == 0:
                logger.info(f'No DICOM files to generate from')
                return
            #
            original_dicoms_bytes = self._download_dicoms(original_dicoms=original_dicoms)
            generated_dicoms_bytes = self._generate_dicoms_with_pathologies(
                research=research,
                original_dicoms_bytes=original_dicoms_bytes,
            )
            created_dicoms = self._create_generated_dicoms(
                researchId=research.id,
                original_dicoms=original_dicoms,
            )
            if len(created_dicoms) != len(generated_dicoms_bytes):
                raise Exception(f'Original DICOM files size is not equal to generated DICOM files')
            #
            self._upload_generated_dicoms(created_dicoms=created_dicoms, generated_dicoms_bytes=generated_dicoms_bytes)
        except Exception as ex:
            logger.error(f'Error during generating: {ex}')
            if research:
                self._set_research_status(research=research, status=ResearchStatus.ERROR)
        else:
            self._set_research_status(research=research, status=ResearchStatus.READY_TO_MARK)

    def _get_research_to_generate(self) -> Optional[GeneratingResearch]:
        try:
            research = self._backend_client.get_research_to_generate()
        except Exception as ex:
            raise Exception(f'Error during getting research: {ex}')

        return research

    def _get_research_original_dicoms(self, research: GeneratingResearch) -> List[Dicom]:
        try:
            dicoms = self._backend_client.get_research_uploaded_dicoms(
                research_id=research.parentResearchId,
            )
        except Exception as ex:
            raise Exception(f'Error during getting research DICOM files: {ex}')

        return dicoms

    def _set_research_status(self, research: GeneratingResearch, status: ResearchStatus):
        try:
            self._backend_client.update_research_status(
                research_id=research.id,
                status=status,
            )
        except Exception as ex:
            raise Exception(f'Error during setting status {status} for research {research.id} - {research.name}: {ex}')

        return research

    def _download_dicoms(self, original_dicoms: List[Dicom]) -> List[bytes]:
        original_dicoms_bytes = []
        for original_dicom in original_dicoms:
            try:
                original_dicom_bytes = cloud_client.download_file(original_dicom.downloadingUrl)
                original_dicoms_bytes.append(original_dicom_bytes)
                logger.info(f'Downloaded DICOM file: {original_dicom.id} - {original_dicom.name}')
            except Exception as ex:
                raise Exception(
                    f'Error during downloading DICOM file {original_dicom.id} - {original_dicom.name}: {ex}')

        return original_dicoms_bytes

    def _generate_dicoms_with_pathologies(self, research: GeneratingResearch, original_dicoms_bytes: List[bytes]):
        try:
            generated_dicoms_bytes = generator.generate_pathologies(
                original_dicoms_bytes=original_dicoms_bytes,
                generatingParams=research.generatingParams,
            )
            logger.info(f'Generated DICOM files for research: {research.id} - {research.name}')
        except Exception as ex:
            raise Exception(f'Error during generating DICOM files for research: {research.id} - {research.name}: {ex}')

        return generated_dicoms_bytes

    def _create_generated_dicoms(self, researchId: uuid.UUID, original_dicoms: List[Dicom]) -> List[CreatedDicom]:
        created_dicoms = []
        for original_dicom in original_dicoms:
            new_dicom: NewDicom = NewDicom(
                name=original_dicom.name,
                description=original_dicom.description,
                researchId=str(researchId),
            )
            try:
                created_dicom: CreatedDicom = self._backend_client.create_dicom(dicom=new_dicom)
                created_dicoms.append(created_dicom)
                logger.info(f'Created DICOM file: {created_dicom.id} - {created_dicom.name}')
            except Exception as ex:
                raise Exception(f'Error during creating DICOM file: {ex}')

        return created_dicoms

    def _upload_generated_dicoms(self, created_dicoms: List[CreatedDicom], generated_dicoms_bytes: List[bytes]):
        for index, created_dicom in enumerate(created_dicoms):
            try:
                cloud_client.upload_by_presigned_url(created_dicom.uploadingUrl, data=generated_dicoms_bytes[index])
                logger.info(f'Uploaded DICOM file: {created_dicom.id} - {created_dicom.name}')
            except Exception as ex:
                raise Exception(f'Error during uploading DICOM file: {ex}')
            try:
                self._backend_client.set_dicom_uploaded(created_dicom.id)
                logger.info(f'Marked as uploaded DICOM file: {created_dicom.id} - {created_dicom.name}')
            except Exception as ex:
                raise Exception(f'Error during marking DICOM file as uploaded: {ex}')
