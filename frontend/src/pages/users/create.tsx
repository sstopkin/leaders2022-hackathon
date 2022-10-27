import { useTranslate, IResourceComponentsProps } from "@pankod/refine-core";
import {
  Create,
  Form,
  Input,
  Select,
  useForm,
} from "@pankod/refine-antd";

import "react-mde/lib/styles/css/react-mde-all.css";

import { IUser } from "interfaces"; //IFactory
import ReactMde from "react-mde";
import ReactMarkdown from "react-markdown";
import { useState } from "react";

export const UsersCreate: React.FC<IResourceComponentsProps> = () => {
  const [selectedTab, setSelectedTab] = useState<"write" | "preview">("write");

  const t = useTranslate();

  const { formProps, saveButtonProps } = useForm<IUser>();

  return (
    <Create saveButtonProps={saveButtonProps}>
      <Form {...formProps} layout="vertical">
        <Form.Item
          label={t("users.fields.email")}
          name="email"
          rules={[
            {
              required: true,
              type: "email",
            },
            {
              min: 5,
            },
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
              required: true,
            },
            {
              min: 6,
            }
          ]}
        >
          <Input.Password />
        </Form.Item>
        <Form.Item
          label={t("users.fields.passwordConfirmation")}
          name="passwordConfirmation"
          rules={[
            {
              required: true,
            },
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
        <Form.Item
          label={t("users.fields.description")}
          name="description"
          rules={[
            {
              required: false,
            },
          ]}
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
    </Create >
  );
};
