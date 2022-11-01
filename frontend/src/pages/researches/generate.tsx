import {
    useTranslate,
    IResourceComponentsProps,
} from "@pankod/refine-core";
import { Create, Form, Input, Select, useForm, useSelect } from "@pankod/refine-antd";
import { IResearch } from "interfaces";
import ReactMde from "react-mde";
import ReactMarkdown from "react-markdown";
import { useState } from "react";

export const ResearchesGenerate: React.FC<IResourceComponentsProps> = () => {
    const [selectedTab, setSelectedTab] = useState<"write" | "preview">("write");
    const t = useTranslate();

    const { formProps, saveButtonProps } = useForm<IResearch>();

    const { selectProps: researchesSelectProps } = useSelect<IResearch>({
        resource: "researches",
        optionLabel: "name",
        optionValue: "id",
    });

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
                    <Input />
                </Form.Item>
                <Form.Item
                    label={t("researches.fields.parentResearch")}
                    name="parentResearchId"
                    rules={[
                        {
                            required: true,
                        },
                    ]}
                >
                    <Select {...researchesSelectProps} />
                </Form.Item>
                <Form.Item
                    label={t("researches.fields.segment")}
                    name="segment"
                    rules={[
                        {
                            required: true,
                        },
                    ]}
                >
                    <Select
                        options={[
                            {
                                label: t("researches.fields.segments.down_right"),
                                value: "down_right",
                            },
                            {
                                label: t("researches.fields.segments.middle_right"),
                                value: "middle_right",
                            },
                            {
                                label: t("researches.fields.segments.up_right"),
                                value: "up_right",
                            },
                            {
                                label: t("researches.fields.segments.down_left"),
                                value: "down_left",
                            },
                            {
                                label: t("researches.fields.segments.up_left"),
                                value: "up_left",
                            }
                        ]}
                    />
                </Form.Item>
                <Form.Item
                    label={t("researches.fields.pathology")}
                    name="segment"
                    rules={[
                        {
                            required: true,
                        },
                    ]}
                >
                    <Select
                        options={[
                            {
                                label: t("researches.fields.pathology.covid19"),
                                value: "covid19",
                            },
                            {
                                label: t("researches.fields.pathology.cancer"),
                                value: "cancer",
                            },
                            {
                                label: t("researches.fields.pathology.metastasis"),
                                value: "metastasis",
                            }
                        ]}
                    />
                </Form.Item>
                <Form.Item
                    label={t("researches.fields.diseases_count")}
                    name="diseases_count"
                    rules={[
                        {
                            required: true,
                        },
                    ]}
                >
                    <Select
                        options={[
                            {
                                label: t("researches.fields.pathology.small"),
                                value: "small",
                            },
                            {
                                label: t("researches.fields.pathology.medium"),
                                value: "medium",
                            },
                            {
                                label: t("researches.fields.pathology.high"),
                                value: "high",
                            }
                        ]}
                    />
                </Form.Item>
                <Form.Item
                    label={t("researches.fields.disease_size")}
                    name="disease_size"
                    rules={[
                        {
                            required: true,
                        },
                    ]}
                >
                    <Select
                        options={[
                            {
                                label: t("researches.fields.pathology.extraSmall"),
                                value: "small",
                            },
                            {
                                label: t("researches.fields.pathology.small"),
                                value: "high",
                            },
                            {
                                label: t("researches.fields.pathology.medium"),
                                value: "medium",
                            },
                            {
                                label: t("researches.fields.pathology.high"),
                                value: "high",
                            }
                        ]}
                    />
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