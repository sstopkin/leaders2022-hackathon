import {
    useTranslate,
    IResourceComponentsProps,
    useShow,
    usePermissions,
} from "@pankod/refine-core";
import {Show, Typography} from "@pankod/refine-antd";

import {Roles} from "interfaces/roles";
import {IResearch, IUser} from "interfaces";

const {Title} = Typography;

export const ResearchesShow: React.FC<IResourceComponentsProps> = () => {
    const t = useTranslate();

    const {queryResult} = useShow<IResearch>();
    const {data, isLoading} = queryResult;
    const record = data?.data;

    const {data: permissionsData} = usePermissions();

    return (
        <Show isLoading={isLoading}>
            Researches show page.
        </Show>
    );
};