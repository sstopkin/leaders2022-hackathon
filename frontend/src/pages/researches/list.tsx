import {
    IResourceComponentsProps, useNavigation,
    usePermissions,
    useTranslate,
} from "@pankod/refine-core";
import {
    List,
    Table,
    TextField,
    useTable,
    DateField,
    Space,
    DeleteButton,
    ShowButton,
    Button, EditButton, Icons,
} from "@pankod/refine-antd";
import {IResearch} from "interfaces";
import {Roles} from "interfaces/roles";
import {DATE_FORMAT} from "../../constants";
import { ResearchProcessingStatus } from "components/researchesStatus";


export const ResearchesList: React.FC<IResourceComponentsProps> = () => {
    const navigate = useNavigation();
    const t = useTranslate();

    const {tableProps} = useTable<IResearch>({
        initialSorter: [
            {
                field: "id",
                order: "desc",
            },
        ],
    });

    const {data: permissionsData} = usePermissions();

    return (
        <List headerButtons={({defaultButtons}) => <><Button
            onClick={() => navigate.push("/researches/generate")}
            type="default"
            icon={
                <Icons.PlusSquareOutlined />}>
            Сгенерировать
        </Button>{defaultButtons}</>}>
            <Table {...tableProps} rowKey="id">
                <Table.Column
                    dataIndex="name"
                    key="name"
                    title={t("researches.fields.name")}
                    render={(value) => <TextField value={value}/>}
                />
                <Table.Column
                    dataIndex="status"
                    key="status"
                    title={t("researches.fields.status")}
                    render={(value) => {
                        return <ResearchProcessingStatus status={value} />;
                    }}
                />
                <Table.Column
                    dataIndex="parentResearchId"
                    title={t("researches.fields.researchType")}
                    render={(value) => (value) ? <TextField value={"Сгенерированное"}/> : <TextField value={t("Исходное")}/>}
                />
                <Table.Column
                    dataIndex="createdAt"
                    key="createdAt"
                    title={t("researches.fields.createdAt")}
                    render={(value) => (value) ? <DateField value={(value) ? value : ''} format={DATE_FORMAT}/> : '-'}
                />
                <Table.Column
                    dataIndex="updatedAt"
                    key="updatedAt"
                    title={t("researches.fields.updatedAt")}
                    render={(value) => (value) ? <DateField value={(value) ? value : ''} format={DATE_FORMAT}/> : '-'}
                />
                <Table.Column<IResearch>
                    title={t("table.actions")}
                    dataIndex="actions"
                    render={(_, record) => (
                        <Space>
                            <ShowButton hideText size="small" recordItemId={record.id}/>
                            {(permissionsData?.includes(Roles.ADMIN)) && (
                                <EditButton
                                    hideText
                                    size="small"
                                    recordItemId={record.id}
                                />
                            )}
                            {permissionsData?.includes(Roles.ADMIN) && (
                                <DeleteButton hideText size="small" recordItemId={record.id}/>
                            )}
                        </Space>
                    )}
                />
            </Table>
        </List>
    );
};
