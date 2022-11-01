/* eslint-disable react-hooks/rules-of-hooks */
import {
    useTranslate,
    IResourceComponentsProps,
    useShow,
    useCustom,
    usePermissions,
    useNavigation,
    useOne,
} from "@pankod/refine-core";
import {
    Show,
    Typography,
    MarkdownField,
    Table,
    Button,
    Icons,
    Space,
    BooleanField,
    DateField,
    Row,
    Col,
    DeleteButton,
    UrlField,
} from "@pankod/refine-antd";

import {IDicom, IResearch, IUser} from "interfaces";
import {API_ROOT, DATE_FORMAT} from "../../constants";
import FileOutlined from "@ant-design/icons/lib/icons/FileOutlined";
import React from "react";
import {Roles} from "interfaces/roles";
import { ResearchProcessingStatus } from "components";

const {Title} = Typography;

export const ResearchesShow: React.FC<IResourceComponentsProps> = () => {
    const t = useTranslate();
    const navigate = useNavigation();

    const {data: permissionsData} = usePermissions();

    const {queryResult} = useShow<IResearch>();
    const {data, isLoading} = queryResult;
    const record = data?.data;

    const {data: createdByInfo} = useOne<IUser>({
        resource: "users",
        id: (record?.createdByUserId as any) ?? "",
    });

    const {data: projectDicoms, refetch} = useCustom<Array<IDicom>>({
        url: `${API_ROOT}/dicoms`,
        method: "get",
        config: {
            query: {
                researchId: record?.id,
            },
        },
    });

    const files = projectDicoms?.data || [];

    return (
        <>
            <Show
                isLoading={isLoading}
                canEdit={permissionsData?.includes(Roles.ADMIN)}
                headerButtons={({ defaultButtons }) => (
                    <>
                        {defaultButtons}
                        <Button type="primary" onClick={() => navigate.push(`/dicom/create?researchId=${record?.id}`)} icon={<Icons.PlusOutlined/>}>Добавить файл</Button>
                    </>
                )}
            >
                <Row gutter={[16, 16]}>
                    <Col xl={5} lg={24} xs={24}>
                        <Title level={4}>{t("researches.fields.name")}</Title>
                        <Typography.Text>{record?.name}</Typography.Text>

                        <Title level={5}>{t("researches.fields.id")}</Title>
                        <Typography.Text>{record?.id}</Typography.Text>

                        <Title level={5}>{t("researches.fields.status")}</Title>
                        <Typography.Text>
                            <ResearchProcessingStatus
                                status={record?.status || ""}
                            />
                        </Typography.Text>

                        <Title level={5}>{t("researches.fields.createdBy")}</Title>
                        <Typography.Text>
                            {createdByInfo?.data.firstName} {createdByInfo?.data.lastName}
                        </Typography.Text>

                        {(record?.parentResearchId) && (
                        <>
                            <Title level={5}>{t("researches.fields.createdBy")}</Title>
                            <Typography.Text>
                                <UrlField value={record?.parentResearchId} />
                            </Typography.Text>
                        </>
                        )}
                        <Title level={5}>{t("researches.fields.description")}</Title>
                        <Typography.Text>
                            <MarkdownField value={record?.description}/>
                        </Typography.Text>
                    </Col>
                    <Col xl={19} xs={24}>
                        <Title level={5}>{t("researches.fields.files")}</Title>
                        <Table
                            // pagination={{
                            //   ...filesData?.pagination,
                            //   showSizeChanger: true,
                            // }}
                            dataSource={files}
                        >
                            <Table.Column
                                dataIndex="name"
                                key="name"
                                title={t("dicoms.fields.name")}
                            />
                            <Table.Column
                                dataIndex="id"
                                key="id"
                                title={t("dicoms.fields.id")}
                            />
                            <Table.Column
                                dataIndex="createdAt"
                                key="createdAt"
                                title={t("dicoms.fields.createdAt")}
                                render={(value) =>
                                    value ? (
                                        <DateField
                                            value={value ? value : ""}
                                            format={DATE_FORMAT}
                                        />
                                    ) : (
                                        "-"
                                    )
                                }
                            />
                            <Table.Column
                                dataIndex="isUploaded"
                                title={t("dicoms.fields.isUploaded")}
                                render={(value) => {
                                    return <BooleanField value={value}/>;
                                }}
                            />
                            <Table.Column<IDicom>
                                title={t("table.actions")}
                                dataIndex="actions"
                                render={(_, record) => <Space>
                                    {record.isUploaded && (
                                        <>
                                            <Button onClick={() => navigate.push(`/dicom/show/${record.id}`)}
                                                    size="small" icon={<Icons.EyeOutlined/>}/>
                                            <a
                                                href={record.downloadingUrl}
                                                download={record.id}
                                                target="_blank"
                                                rel="noreferrer"
                                            >
                                                <Button size="small" icon={<FileOutlined/>}/>
                                            </a>
                                        </>
                                    )}
                                    {permissionsData?.includes(Roles.ADMIN) && (
                                        <DeleteButton
                                            onSuccess={() => refetch()}
                                            hideText size="small"
                                            resourceNameOrRouteName="dicoms"
                                            recordItemId={record.id}/>
                                    )}
                                </Space>
                                }
                            />
                        </Table>
                    </Col>
                </Row>
            </Show>
        </>
    );
};
