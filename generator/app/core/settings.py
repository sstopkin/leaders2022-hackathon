from pydantic import BaseSettings


class Settings(BaseSettings):
    BACKEND_API_BASE_URL: str
    BACKEND_API_KEY: str
    RESEARCHES_FETCHING_PERIOD_SECONDS: int


settings = Settings('.env')
