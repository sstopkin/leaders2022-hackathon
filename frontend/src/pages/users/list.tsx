import {
  IResourceComponentsProps,
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
  TagField,
  ShowButton,
  BooleanField,
} from "@pankod/refine-antd";
import { IUser } from "interfaces";
import { Roles } from "interfaces/roles";
import { DATE_FORMAT } from "../../constants";

export const UsersList: React.FC<IResourceComponentsProps> = () => {
  const t = useTranslate();

  const { tableProps } = useTable<IUser>({
    initialSorter: [
      {
        field: "id",
        order: "desc",
      },
    ],
  });

  const { data: permissionsData } = usePermissions();

  return (
    <List canCreate={permissionsData?.includes(Roles.ADMIN)} >
      <Table {...tableProps} rowKey="id">
        {/* <Table.Column dataIndex="id" title="ID" /> */}
        {/* <Table.Column
          dataIndex="id"
          key="id"
          title="ID"
          render={(value) => <TextField value={value} />}
        /> */}
        <Table.Column
          dataIndex="email"
          key="email"
          title={t("users.fields.email")}
          render={(value) => <TextField value={value} />}
        />
        <Table.Column
          dataIndex="firstName"
          key="firstName"
          title={t("users.fields.firstName")}
          render={(value) => <TextField value={value} />}
        />
        <Table.Column
          dataIndex="lastName"
          key="lastName"
          title={t("users.fields.lastName")}
          render={(value) => <TextField value={value} />}
        />
        <Table.Column
          dataIndex="createdAt"
          key="createdAt"
          title={t("users.fields.createdAt")}
          render={(value) => (value) ? <DateField value={(value) ? value : ''} format={DATE_FORMAT} /> : '-'}
        />
        <Table.Column
          dataIndex="updatedAt"
          key="updatedAt"
          title={t("users.fields.updatedAt")}
          render={(value) => (value) ? <DateField value={(value) ? value : ''} format={DATE_FORMAT} /> : '-'}
        />
        <Table.Column
          dataIndex="role"
          key="role"
          title={t("users.fields.role")}
          render={(value) => <TagField value={value} />}
        />
        <Table.Column
          dataIndex="isActive"
          title={t("users.fields.isActive")}
          render={(value) => {
            return <BooleanField value={value} />;
          }}
        />
        <Table.Column<IUser>
          title={t("table.actions")}
          dataIndex="actions"
          render={(_, record) => (
            <Space>
              <ShowButton hideText size="small" recordItemId={record.id} />
              {permissionsData?.includes(Roles.ADMIN) && (
                <EditButton hideText size="small" recordItemId={record.id} />
              )}
              {permissionsData?.includes(Roles.ADMIN) && (
                <DeleteButton hideText size="small" recordItemId={record.id} />
              )}
            </Space>
          )}
        />
      </Table>
    </List >
  );
};
