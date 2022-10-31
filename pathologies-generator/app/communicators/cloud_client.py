import requests


def upload_by_presigned_url(url: str, data: bytes):
    resp = requests.put(url, data=data)
    _validate_response_status(resp)


def download_file(url: str) -> bytes:
    resp = requests.request('GET', url)
    _validate_response_status(resp)

    return resp.content


def _validate_response_status(resp, valid_status_code: int = 200):
    if resp.status_code != valid_status_code:
        raise Exception(f'Failed request: {resp.status_code} - {resp.text}')
