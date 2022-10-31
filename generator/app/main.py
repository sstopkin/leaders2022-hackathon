import logging

from core import usecases as core_usecases

logger = logging.getLogger(__name__)

if __name__ == '__main__':
    core_usecases.prepare_app()
    logger.info('Starting Pathologies Generator service')
    core_usecases.init_and_start_services()
