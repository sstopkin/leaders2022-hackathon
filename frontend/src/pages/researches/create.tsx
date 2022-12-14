import {
    useTranslate,
    IResourceComponentsProps,
} from "@pankod/refine-core";
import {Create, Form, Input, useForm} from "@pankod/refine-antd";
import {IResearch} from "interfaces";
import ReactMde from "react-mde";
import ReactMarkdown from "react-markdown";
import { useState } from "react";

export const ResearchesCreate: React.FC<IResourceComponentsProps> = () => {
    const [selectedTab, setSelectedTab] = useState<"write" | "preview">("write");
    const t = useTranslate();

    const {formProps, saveButtonProps} = useForm<IResearch>();

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
                    label={t("researches.fields.description")}
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
        </Create>
    );
};