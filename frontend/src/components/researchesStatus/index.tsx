import { useTranslate } from "@pankod/refine-core";

import { Tag } from "@pankod/refine-antd";

type StatusProps = {
    status: string;
};

export enum ResearchStatuses {
    CREATED = 'created',
    UPLOADING = 'uploading',
    UPLOADED = 'uploaded',
    GENERATING = 'generating',
    GENERATED = 'generated',
    IN_MARKUP = 'in_markup',
    MARKUP_DONE = 'markup_done',
    ERROR = 'error'
}

export const ResearchProcessingStatus: React.FC<StatusProps> = ({ status }) => {
    const t = useTranslate();
    let color;

    switch (status) {
        case ResearchStatuses.CREATED:
            color = "gray";
            break;
        case ResearchStatuses.UPLOADING:
            color = "orange";
            break;
        case ResearchStatuses.UPLOADED:
            color = "green";
            break;
        case ResearchStatuses.GENERATING:
            color = "yellow";
            break;
        case ResearchStatuses.GENERATED:
            color = "volcano";
            break;
        case ResearchStatuses.IN_MARKUP:
            color = "magenta";
            break;
        case ResearchStatuses.MARKUP_DONE:
            color = "cyan";
            break;
        case ResearchStatuses.ERROR:
            color = "red";
            break;
    }

    return <Tag color={color}>{t(`enum.orderStatuses.${status}`)}</Tag>;
};
