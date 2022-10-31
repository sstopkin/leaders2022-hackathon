import datetime
import logging.config
import time

from communicators.backend_client import BackendClient
from core.settings import settings
from services.core.main_generator_loop import MainGeneratorLoop

LOGGING_CONFIG_INI = 'logging.ini'


def prepare_app():
    _configure_logger()


def init_and_start_services():
    backend_client = BackendClient(
        backend_api_base_url=settings.BACKEND_API_BASE_URL,
        backend_api_key=settings.BACKEND_API_KEY,
    )

    main_generator_loop = MainGeneratorLoop(
        period=datetime.timedelta(seconds=settings.RESEARCHES_FETCHING_PERIOD_SECONDS),
        backend_client=backend_client,
    )
    main_generator_loop()


def _configure_logger():
    logging.config.fileConfig(LOGGING_CONFIG_INI, disable_existing_loggers=False)
    logging.Formatter.converter = time.gmtime


def _init_dependencies(self):
    pass
