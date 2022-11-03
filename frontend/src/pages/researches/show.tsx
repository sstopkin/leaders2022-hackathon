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
    Tooltip,
} from "@pankod/refine-antd";

import {IDicom, IResearch, IUser} from "interfaces";
import {API_ROOT, DATE_FORMAT} from "../../constants";
import FileOutlined from "@ant-design/icons/lib/icons/FileOutlined";
import React from "react";
import {Roles} from "interfaces/roles";
import {ResearchProcessingStatus} from "components";
import Truncate from "react-truncate";
import axios from "axios";
import * as zip from "@zip.js/zip.js";
import { returnFullNameFromUserObject } from "utils";

const {Title} = Typography;

const model = (() => {
    let zipWriter: any;
    return {
        addFile(file: any, options?: any) {
            if (!zipWriter) {
                zipWriter = new zip.ZipWriter(new zip.BlobWriter("application/zip"), {bufferedWrite: true});
            }
            return zipWriter.add(file.name, new zip.BlobReader(file), options);
        },
        async getBlobURL() {
            if (zipWriter) {
                const blobURL = URL.createObjectURL(await zipWriter.close());
                zipWriter = null;
                return blobURL;
            } else {
                throw new Error("Zip file closed");
            }
        }
    };
})();

export const ResearchesShow: React.FC<IResourceComponentsProps> = () => {
    const t = useTranslate();
    const navigate = useNavigation();

    const [isUploading, setUploading] = React.useState(false);

    const {data: permissionsData} = usePermissions();

    const {queryResult} = useShow<IResearch>();
    const {data, isLoading} = queryResult;
    const record = data?.data;

    const {data: createdByInfo} = useOne<IUser>({
        resource: "users",
        id: (record?.createdByUserId as any) ?? "",
    });

    const {data: assigneeUser} = useOne<IUser>({
        resource: "users",
        id: (record?.assigneeUserId as any) ?? "",
    });

    const {data: researchDicoms, refetch} = useCustom<Array<IDicom>>({
        url: `${API_ROOT}/dicoms`,
        method: "get",
        config: {
            query: {
                researchId: record?.id,
            },
        },
    });


    const files = researchDicoms?.data || [];

    const uploadResearchFiles = async () => {
        setUploading(true);
        const filesBlob = await Promise.all(files.map(async file => {
            const response = await axios.get(file.downloadingUrl, {
                responseType: 'blob'
            });
            return new File([response.data], file.name)
        }));

        await Promise.all(filesBlob.map(async file => {
            return await model.addFile(file);
        }));

        const blobUrl = await model.getBlobURL();

        const anchor = document.createElement("a");
        anchor.href = blobUrl;
        anchor.download = record?.name || 'research'
        anchor.click();
        anchor.remove();
        setUploading(false);
    }

    return (
        <>
            <Show
                isLoading={isLoading}
                canEdit={permissionsData?.includes(Roles.ADMIN)}
                headerButtons={({defaultButtons}) => (
                    <>
                        {defaultButtons}
                        <Button
                            loading={isUploading}
                            disabled={isUploading}
                            onClick={uploadResearchFiles}
                            type="primary"
                            icon={<Icons.UploadOutlined/>}
                        >
                            Загрузить исследование
                        </Button>
                        <Button
                            type="primary"
                            onClick={() => navigate.push(`/dicom/show?researchId=${record?.id}`)}
                            icon={<Icons.EditOutlined/>}>
                            Разметить исследование
                        </Button>
                        <Button type="primary" onClick={() => navigate.push(`/dicom/create?researchId=${record?.id}`)}
                                icon={<Icons.PlusOutlined/>}>Добавить файл(ы)</Button>
                    </>
                )}
            >
                <Row gutter={[16, 16]}>
                    <Col xl={5} lg={24} xs={24}>
                        <Title level={4}>{t("researches.fields.name")}</Title>
                        <Typography.Text>{record?.name}</Typography.Text>

                        <Title level={5}>{t("researches.fields.status")}</Title>
                        <Typography.Text>
                            <ResearchProcessingStatus
                                status={record?.status || ""}
                            />
                        </Typography.Text>

                        <Title level={5}>{t("researches.fields.createdBy")}</Title>
                        <Typography.Text>
                            {returnFullNameFromUserObject(createdByInfo?.data)}
                        </Typography.Text>

                        <Title level={5}>{t("researches.fields.assigneeUser")}</Title>
                        <Typography.Text>
                            {(record?.assigneeUserId) ? returnFullNameFromUserObject(assigneeUser?.data) : 'не назначено'}
                        </Typography.Text>

                        {(record?.parentResearchId) && (
                            <>
                                <Title level={5}>{t("researches.fields.parentResearch")}</Title>
                                <Typography.Text>
                                    <UrlField value={record?.parentResearchId}/>
                                </Typography.Text>
                            </>
                        )}
                        <Title level={5}>{t("researches.fields.description")}</Title>
                        <Typography.Text>
                            <MarkdownField value={(record?.description) ? record?.description : '< отсутствует >'}/>
                        </Typography.Text>
                    </Col>
                    <Col xl={19} xs={24}>
                        <Title level={5}>{t("researches.fields.files")}</Title>
                        <Table
                            pagination={{
                                showSizeChanger: true,
                            }}
                            dataSource={files}
                        >
                            <Table.Column
                                dataIndex="name"
                                key="name"
                                title={t("dicoms.fields.name")}
                                render={(value) => <Tooltip title={value}><Truncate width={210} lines={1}>{value}</Truncate></Tooltip>}
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
