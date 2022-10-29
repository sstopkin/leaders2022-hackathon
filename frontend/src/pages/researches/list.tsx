import {
    IResourceComponentsProps, useCustom, useNavigation,
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
    TagField,
    Button, Icons, EditButton,
} from "@pankod/refine-antd";
import {IResearch} from "interfaces";
import {Roles} from "interfaces/roles";
import {API_ROOT, DATE_FORMAT} from "../../constants";

export const ResearchesList: React.FC<IResourceComponentsProps> = () => {
    const t = useTranslate();

    const {tableProps} = useTable<IResearch>({
        initialSorter: [
            {
                field: "id",
                order: "desc",
            },
        ],
    });

    console.log(tableProps)

    const {data: permissionsData} = usePermissions();

    return (
        <List>
            <Table {...tableProps} rowKey="id">
                <Table.Column
                    dataIndex="id"
                    key="id"
                    title={t("researches.fields.id")}
                    render={(value) => <TextField value={value}/>}
                />
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
                            <ShowButton hideText size="small" recordItemId={record.id} />
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
                            {/* <Button onClick={() => navigate.push(`/researches/show/${record.id}`)} type="primary"
                                    size="small">Разметить</Button>
                            {permissionsData?.includes(Roles.ADMIN) && (
                                <DeleteButton hideText size="small" recordItemId={record.id}/>
                            )} */}
                        </Space>
                    )}
                />
            </Table>
        </List>
    );
};
