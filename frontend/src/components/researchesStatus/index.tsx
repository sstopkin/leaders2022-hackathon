import { useTranslate } from "@pankod/refine-core";

import { Tag } from "@pankod/refine-antd";

type StatusProps = {
    status: string;
};

export enum ResearchStatuses {
    CREATED = 'created',
    READY_TO_MARK = 'ready_to_mark',
    GENERATING = 'generating',
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
        case ResearchStatuses.READY_TO_MARK:
            color = "orange";
            break;
        case ResearchStatuses.GENERATING:
            color = "yellow";
            break;
        case ResearchStatuses.IN_MARKUP:
            color = "magenta";
            break;
        case ResearchStatuses.MARKUP_DONE:
            color = "green";
            break;
        case ResearchStatuses.ERROR:
            color = "red";
            break;
    }

    return <Tag color={color}>{t(`researchStatuses.${status}`)}</Tag>;
};
