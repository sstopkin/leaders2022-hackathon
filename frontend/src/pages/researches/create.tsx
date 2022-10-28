import {
    useTranslate,
    IResourceComponentsProps,
} from "@pankod/refine-core";
import {Create, Form, getValueFromEvent, Input, Upload, useForm} from "@pankod/refine-antd";
import {IUser} from "interfaces";

export const ResearchesCreate: React.FC<IResourceComponentsProps> = () => {
    const t = useTranslate();

    const {formProps, saveButtonProps} = useForm<IUser>();

    return (
        <Create saveButtonProps={saveButtonProps}>
            <Form {...formProps} layout="vertical">
                <Form.Item
                    label={t("researches.fields.name")}
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
                    <Input/>
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
                    <Upload.Dragger name="file" accept="*" listType="picture-card" maxCount={1}>
                        <p className="ant-upload-text">Drag & Drop a file in this area</p>
                    </Upload.Dragger>
                </Form.Item>
            </Form>
        </Create>
    );
};