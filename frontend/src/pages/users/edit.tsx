import { useState } from "react";
import { useTranslate, IResourceComponentsProps, usePermissions } from "@pankod/refine-core";
import {
  Checkbox,
  Edit,
  Form,
  Input,
  Select,
  useForm,
  // useSelect,
} from "@pankod/refine-antd";

import "react-mde/lib/styles/css/react-mde-all.css";

import { IUser } from "interfaces"; //IFactory
import ReactMarkdown from "react-markdown";
import ReactMde from "react-mde";

export const UsersEdit: React.FC<IResourceComponentsProps> = () => {
  const [selectedTab, setSelectedTab] = useState<"write" | "preview">("write");

  const t = useTranslate();

  const { formProps, saveButtonProps } = useForm<IUser>();
  const { data } = usePermissions<string>();

  // const { selectProps: factoriesSelectProps } = useSelect<IFactory>({
  //   resource: "factories",
  //   optionLabel: "name",
  //   optionValue: "id",
  // });

  return (
    <Edit saveButtonProps={saveButtonProps}
      canDelete={data === "admin"}
    >
      <Form {...formProps}
        initialValues={{
          id: formProps.initialValues?.id,
          ...formProps.initialValues,
        }}
        layout="vertical">
        <Form.Item
          style={{ display: 'none' }}
          label={t("users.fields.id")}
          name="id"
          rules={[
            {
              required: true,
            },
            {
              min: 5,
            }
          ]}
        >
          <Input />
        </Form.Item>
        <Form.Item
          label={t("users.fields.email")}
          name="email"
          rules={[
            {
              required: true,
            },
            {
              min: 5,
            }
          ]}
        >
          <Input />
        </Form.Item>
        <Form.Item
          label={t("users.fields.firstName")}
          name="firstName"
          rules={[
            {
              required: true,
            },
          ]}
        >
          <Input />
        </Form.Item>
        <Form.Item
          label={t("users.fields.lastName")}
          name="lastName"
          rules={[
            {
              required: true,
            },
          ]}
        >
          <Input />
        </Form.Item>
        <Form.Item
          label={t("users.fields.password")}
          name="password"
          rules={[
            {
              min: 6,
            }
          ]}
        >
          <Input.Password />
        </Form.Item>
        <Form.Item
          label={t("users.fields.passwordConfirmation")}
          name="password_confirmation"
          rules={[
            {
              min: 6,
            }
          ]}
        >
          <Input.Password />
        </Form.Item>
        {/* <Form.Item
          label={t("users.fields.factory")}
          name="factories"

          rules={[
              {
                required: true,
              },
          ]}
        >
          <Select mode="multiple" {...factoriesSelectProps} />
        </Form.Item> */}
        <Form.Item
          label={t("users.fields.role")}
          name="role"
          rules={[
            {
              required: true,
            },
          ]}
        >
          <Select
            options={[
              {
                label: t("users.fields.roles.admin"),
                value: "admin",
              },
              {
                label: t("users.fields.roles.operator"),
                value: "operator",
              },
              {
                label: t("users.fields.roles.partner"),
                value: "partner",
              }
            ]}
          />
        </Form.Item>
        <Form.Item label={t("users.fields.isActive")} name="isActive" valuePropName="checked">
          <Checkbox>Active</Checkbox>
        </Form.Item>
        <Form.Item
          label={t("projects.fields.description")}
          name="description"
        >
          <ReactMde
            selectedTab={selectedTab}
            onTabChange={setSelectedTab}
            generateMarkdownPreview={(markdown) =>
              Promise.resolve(
                <ReactMarkdown>{markdown}</ReactMarkdown>,
              )
            }
          />
        </Form.Item>
      </Form>
    </Edit>
  );
};
