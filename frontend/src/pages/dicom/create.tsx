import {
  useTranslate,
  IResourceComponentsProps,
} from "@pankod/refine-core";
import { Create, Form, getValueFromEvent, Input, Upload, useForm } from "@pankod/refine-antd";
import { IDicom } from "interfaces";
import { useLocation } from "react-router-dom";

export const DicomsCreate: React.FC<IResourceComponentsProps> = () => {
  const t = useTranslate();

  const { formProps, saveButtonProps } = useForm<IDicom>({ action: "create", resource: "dicoms", redirect: false });

  const search = useLocation().search;
  const researchIdParam = new URLSearchParams(search).get('researchId');
  console.log(researchIdParam)

  return (
    <Create saveButtonProps={saveButtonProps}>
      <Form {...formProps}
        initialValues={{
          researchId: researchIdParam,
          ...formProps.initialValues,
        }}
        layout="vertical">
        <Form.Item
          label={t("researches.fields.researchId")}
          name="researchId"
          rules={[
            {
              required: true,
              type: "string",
            }
          ]}
        >
          <Input />
        </Form.Item>
        <Form.Item
          label={t("dicoms.fields.filename")}
          name="name"
          rules={[
            {
              required: true,
              type: "string",
            },
            {
              min: 5,
            },
          ]}
        >
          <Input />
        </Form.Item>
        <Form.Item
          label={t("researches.fields.file")}
          name="file"
          valuePropName="fileList"
          getValueFromEvent={getValueFromEvent}
          noStyle
          rules={[
            {
              required: true,
            },
          ]}
        >
          <Upload.Dragger name="file" accept=".jpg" listType="picture-card" maxCount={1}>
            <p className="ant-upload-text">Перетащите файл для загрузки</p>
          </Upload.Dragger>
        </Form.Item>
      </Form>
    </Create>
  );
};