import uuid
from typing import Dict, Optional, List
from uuid import UUID

import requests

from entities.dicom_entities import Dicom, NewDicom, CreatedDicom
from entities.research_entities import ResearchStatus, GetResearchesResponse, GeneratingResearch


class BackendClient:
    researches_endpoint = 'researches'
    dicoms_endpoint = 'dicoms'

    def __init__(self, backend_api_base_url: str, backend_api_key):
        self._backend_api_base_url = backend_api_base_url
        self._backend_api_key = backend_api_key
        self._headers = {
            'X-API-KEY': self._backend_api_key
        }

    def get_research_to_generate(self) -> Optional[GeneratingResearch]:
        url = f'{self._backend_api_base_url}/{self.researches_endpoint}'
        params = {
            'filter': 'status||$eq||generating',
            'page': 1,
            'limit': 1,
        }
        resp = requests.request('GET', url, params=params, headers=self._headers)
        self._validate_response_status(resp)

        parsed_response: GetResearchesResponse = self._try_parse_response(
            response=resp.json(),
            result_class=GetResearchesResponse,
        )
        research = parsed_response.data[0] if parsed_response.data else None

        return research

    def get_research_uploaded_dicoms(
            self,
            research_id: uuid.UUID,
    ) -> List[Dicom]:
        url = f'{self._backend_api_base_url}/{self.dicoms_endpoint}'
        params = {
            'researchId': research_id,
            'filter': 'isUploaded||$eq||true',
        }

        resp = requests.request('GET', url, params=params, headers=self._headers)
        self._validate_response_status(resp)

        dicoms: List[Dicom] = [
            self._try_parse_response(
                response=dicom_json,
                result_class=Dicom,
            ) for dicom_json in resp.json()
        ]

        return dicoms

    def update_research_status(self, research_id: UUID, status: ResearchStatus):
        url = f'{self._backend_api_base_url}/{self.researches_endpoint}/{research_id}'
        json = {
            'status': status.value,
        }
        resp = requests.request('PATCH', url, json=json, headers=self._headers)
        self._validate_response_status(resp)

    def create_dicom(self, dicom: NewDicom) -> CreatedDicom:
        url = f'{self._backend_api_base_url}/{self.dicoms_endpoint}'
        json = dicom.dict()
        resp = requests.request('POST', url, json=json, headers=self._headers)
        self._validate_response_status(resp, 201)

        return self._try_parse_response(response=resp.json(), result_class=CreatedDicom)

    def set_dicom_uploaded(self, dicom_id: uuid.UUID, is_uploaded: bool = True):
        url = f'{self._backend_api_base_url}/{self.dicoms_endpoint}/{dicom_id}'
        json = {
            'isUploaded': is_uploaded,
        }
        resp = requests.request('PATCH', url, json=json, headers=self._headers)
        self._validate_response_status(resp)

    def _validate_response_status(self, resp, valid_status_code: int = 200):
        if resp.status_code != valid_status_code:
            raise Exception(f'Failed request: {resp.status_code} - {resp.text}')

    def _try_parse_response(self, response: Dict, result_class):
        try:
            result = result_class.parse_obj(response)
        except Exception as ex:
            raise Exception(f'Error during parsing {response}: {ex}')

        return result
