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
    EditButton,
    DeleteButton,
    ShowButton,
    TagField,
    Button, Icons,
} from "@pankod/refine-antd";
import {IResearch} from "interfaces";
import {Roles} from "interfaces/roles";
import {DATE_FORMAT} from "../../constants";

function formatBytes(bytes: number, decimals = 2) {
    if (!+bytes) return '0 Bytes'

    const k = 1024
    const dm = decimals < 0 ? 0 : decimals
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB']

    const i = Math.floor(Math.log(bytes) / Math.log(k))

    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`
}

export const ResearchesList: React.FC<IResourceComponentsProps> = () => {
    const t = useTranslate();
    const navigate = useNavigation();

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
        <List headerButtons={() => <Button type="primary" onClick={() => navigate.push('/researches/create')}
                                           icon={<Icons.UploadOutlined/>}>Загрузить исследование</Button>}>
            <Table {...tableProps} rowKey="id">
                <Table.Column
                    dataIndex="id"
                    key="id"
                    title={t("researches.fields.id")}
                    render={(value) => <TextField value={value}/>}
                />
                <Table.Column
                    dataIndex="fileName"
                    key="fileName"
                    title={t("researches.fields.name")}
                    render={(value) => <TextField value={value}/>}
                />
                <Table.Column
                    dataIndex="fileName"
                    key="fileName"
                    title={t("researches.fields.name")}
                    render={(value) => <TextField value={value}/>}
                />
                <Table.Column
                    dataIndex="size"
                    key="size"
                    title={t("researches.fields.size")}
                    render={(value) => <TextField value={formatBytes(value)}/>}
                />
                <Table.Column
                    dataIndex="status"
                    key="status"
                    title={t("researches.fields.status")}
                    render={(value) => <TagField value={t(`enum.researchStatuses.${value}`)}/>}
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
                            <Button onClick={() => navigate.push(`/researches/show/${record.id}`)} type="primary"
                                    size="small">Разметить</Button>
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
