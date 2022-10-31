import datetime
import logging
from time import sleep

logger = logging.getLogger(__name__)


class AbstractLoopService:
    def __init__(self, period: datetime.timedelta):
        self._period = period

    def __call__(self):
        while True:
            current_step_start_time = datetime.datetime.now()
            try:
                logger.debug(f"Running a new step of {self.__class__.__name__}")
                self.run_step()
            except Exception as ex:
                logger.error(f"Error during execution {self.__class__.__name__} step: ", str(ex))
            finally:
                delay = self._define_delay(current_step_start_time, self._period)
                logger.debug(f"Awaiting for a new step of {self.__class__.__name__}")
                sleep(delay.total_seconds())

    def run_step(self):
        raise NotImplemented

    def _define_delay(
            self,
            current_step_start_time: datetime.datetime,
            period: datetime.timedelta
    ) -> datetime.timedelta:
        current_datetime = datetime.datetime.now()
        next_step_start_time = current_step_start_time + period

        if next_step_start_time < current_datetime:
            step_running_time = current_datetime - current_step_start_time
            logger.debug(
                f"{self.__class__.__name__} running step took {step_running_time} but the step period is {period}"
            )
            next_step_start_time = current_datetime

        delay = next_step_start_time - current_datetime

        return delay
