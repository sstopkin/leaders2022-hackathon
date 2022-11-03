import {
  useTranslate,
  IResourceComponentsProps,
  useShow,
  usePermissions,
} from "@pankod/refine-core";
import { Show, Typography, Tag, MarkdownField, Icons } from "@pankod/refine-antd";

import { Roles } from "interfaces/roles";
import { IUser } from "interfaces";
import { returnFullNameFromUserObject } from "utils";

const { Title } = Typography;

export const UsersShow: React.FC<IResourceComponentsProps> = () => {
  const t = useTranslate();

  const { queryResult } = useShow<IUser>();
  const { data, isLoading } = queryResult;
  const record = data?.data;

  const { data: permissionsData } = usePermissions();

  return (
    <Show
      canEdit={permissionsData?.includes(Roles.ADMIN)}
      isLoading={isLoading}
    >
      <Title level={5}>{t("users.fields.email")}</Title>
      <Typography.Text>
        <Icons.MailOutlined /> {record?.email}
      </Typography.Text>

      <Title level={5}>{t("users.fields.name")}</Title>
      <Typography.Text>
        {returnFullNameFromUserObject(data)}
      </Typography.Text>

      <Title level={5}>{t("users.fields.role")}</Title>
      <Typography.Text>
        <Tag>{record?.role}</Tag>
      </Typography.Text>

      <Title level={5}>{t("users.fields.description")}</Title>
      <Typography.Text>
        <MarkdownField value={record?.description} />
      </Typography.Text>
    </Show>
  );
};
