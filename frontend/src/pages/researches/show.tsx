/* eslint-disable react-hooks/rules-of-hooks */
import {
  useTranslate,
  IResourceComponentsProps,
  useOne,
  useShow,
  useUpdate,
  useCustom,
  usePermissions,
} from "@pankod/refine-core";
import {
  Show,
  Typography,
  MarkdownField,
  Table,
  Button,
  Icons,
  Space,
  ShowButton,
  BooleanField,
  DateField,
  Row,
  Col,
} from "@pankod/refine-antd";

import { IDicom, IResearch, IUser } from "interfaces";
import { API_ROOT, DATE_FORMAT } from "../../constants";
import FileOutlined from "@ant-design/icons/lib/icons/FileOutlined";
import React from "react";
import { Roles } from "interfaces/roles";
import { FileMarkdownOutlined } from "@ant-design/icons";

const { Title } = Typography;

export const ResearchesShow: React.FC<IResourceComponentsProps> = () => {
  const t = useTranslate();

  const { data: permissionsData } = usePermissions();

  const { queryResult } = useShow<IResearch>();
  const { data, isLoading } = queryResult;
  const record = data?.data;

  const { mutate } = useUpdate();

  // const { data: createdByInfo } = useOne<IUser>({
  //   resource: "users",
  //   id: (record?.userId as any) ?? "",
  // });

  const { data: projectDicoms } = useCustom<IDicom>({
    url: `${API_ROOT}/dicoms`,
    method: "get",
    config: {
      query: {
        researchId: record?.id,
      },
    },
  });

  console.log(
    "files:" +
    JSON.stringify(projectDicoms)
  );

  // const filesData = projectDicoms?.data.data.map((files: IDicom) => ({
  //   ...files,
  // }));

  // console.log(
  //   "files:" +
  //   JSON.stringify(projectDicoms) +
  //   " data:" +
  //   JSON.stringify(filesData)
  // );

// function formatBytes(bytes: number, decimals = 2) {
//     if (!+bytes) return '0 Bytes'

//     const k = 1024
//     const dm = decimals < 0 ? 0 : decimals
//     const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB']

//     const i = Math.floor(Math.log(bytes) / Math.log(k))

//     return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`
// }

// <Table.Column
// dataIndex="size"
// key="size"
// title={t("researches.fields.size")}
// render={(value) => <TextField value={formatBytes(value)}/>}
// />

  return (
    <>
      <Show
        isLoading={isLoading}
        canEdit={permissionsData?.includes(Roles.ADMIN)}
      >
        <Row gutter={[16, 16]}>
          <Col xl={5} lg={24} xs={24}>
            <Title level={4}>{t("research.fields.name")}</Title>
            <Typography.Text>{record?.name}</Typography.Text>

            <Title level={5}>{t("research.fields.id")}</Title>
            <Typography.Text>({record?.id})</Typography.Text>
            
            <Title level={5}>{t("research.fields.processingStatus")}</Title>
            <Typography.Text>
              {/* <ProjectProcessingStatus
                status={record?.processingStatus || ""}
              /> */}
            </Typography.Text>

            {/* <Title level={5}>{t("research.fields.createdBy")}</Title>
            <Typography.Text>
              {createdByInfo?.data.firstName} {createdByInfo?.data.lastName}
            </Typography.Text> */}

            <Title level={5}>{t("research.fields.description")}</Title>
            <Typography.Text>
              <MarkdownField value={record?.description} />
            </Typography.Text>

            {/* <ShowButton
                        onClick={() => handleShowDicomViewerModal(record)}
                        hideText
                        size="small"
                        recordItemId={'asd'}
                      /> */}
          </Col>
          <Col xl={19} xs={24}>
            <Title level={5}>{t("research.fields.files")}</Title>
            <Table
              // pagination={{
              //   ...filesData?.pagination,
              //   showSizeChanger: true,
              // }}
              // dataSource={filesData}
            >
              <Table.Column
                dataIndex="fileName"
                key="fileName"
                title={t("files.fields.fileName")}
              />
              <Table.Column
                dataIndex="id"
                key="id"
                title={t("files.fields.id")}
              />
              <Table.Column
                dataIndex="createdAt"
                key="createdAt"
                title={t("files.fields.createdAt")}
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
                title={t("files.fields.isUploaded")}
                render={(value) => {
                  return <BooleanField value={value} />;
                }}
              />
              <Table.Column<IDicom>
                title={t("table.actions")}
                dataIndex="actions"
                render={(_, record) => (
                  <Space>
                    {/* {record.isUploaded && (
                      <ShowButton
                        onClick={() => handleShowDicomViewerModal(record)}
                        hideText
                        size="small"
                        recordItemId={record.id}
                      />
                    )} */}
                  </Space>
                )}
              />
            </Table>
          </Col>
        </Row>
      </Show>
    </>
  );
};
