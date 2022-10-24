import { useTranslate } from "@pankod/refine-core";

import { Tag } from "@pankod/refine-antd";

type StatusProps = {
    status: string;
};

export enum ProcessingStatus {
    CREATED = 'CREATED',
    UPLOADING = 'UPLOADING',
    UPLOADING_ERROR = 'UPLOADING_ERROR',
    READY_FOR_PROCESSING = 'READY_FOR_PROCESSING',
    PROCESSING = 'PROCESSING',
    PROCESSING_ERROR = 'PROCESSING_ERROR',
    PARTIALLY_PROCESSED = 'PARTIALLY_PROCESSED',
    DONE = 'DONE',
    ERROR = 'ERROR',
}

export const ProjectProcessingStatus: React.FC<StatusProps> = ({ status }) => {
    const t = useTranslate();
    let color;

    switch (status) {
        case ProcessingStatus.CREATED:
            color = "gray";
            break;
        case ProcessingStatus.UPLOADING:
            color = "orange";
            break;
        case ProcessingStatus.PROCESSING:
            color = "green";
            break;
        case ProcessingStatus.PARTIALLY_PROCESSED:
            color = "volcano";
            break;
        case ProcessingStatus.DONE:
            color = "magenta";
            break;
        case ProcessingStatus.READY_FOR_PROCESSING:
            color = "cyan";
            break;
        case ProcessingStatus.ERROR || ProcessingStatus.UPLOADING_ERROR || ProcessingStatus.PROCESSING_ERROR:
            color = "red";
            break;
    }

    return <Tag color={color}>{t(`enum.orderStatuses.${status}`)}</Tag>;
};
