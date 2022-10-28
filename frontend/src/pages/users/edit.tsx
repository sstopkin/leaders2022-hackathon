import { useState } from "react";
import { useTranslate, IResourceComponentsProps, usePermissions } from "@pankod/refine-core";
import {
  Checkbox,
  Edit,
  Form,
  Input,
  Select,
  useForm,
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
              type: "email"
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
            {
              min: 1,
              max: 50
            },
            {
              pattern: new RegExp('^[a-zA-Z-]*$')
            }
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
            {
              min: 1,
              max: 50
            },
            {
              pattern: new RegExp('^[a-zA-Z-]*$')
            }
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
                label: t("users.fields.roles.user"),
                value: "user",
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
