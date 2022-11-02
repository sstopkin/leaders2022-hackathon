import {
    useTranslate,
    IResourceComponentsProps,
    useNavigation,
} from "@pankod/refine-core";
import { Button, Create, Form, Icons, Input, Select, useForm, useSelect } from "@pankod/refine-antd";
import { IResearch } from "interfaces";
import ReactMde from "react-mde";
import ReactMarkdown from "react-markdown";
import { useState } from "react";

export const ResearchesGenerate: React.FC<IResourceComponentsProps> = () => {
    const [selectedTab, setSelectedTab] = useState<"write" | "preview">("write");
    const t = useTranslate();
    const navigation = useNavigation();

    const { formProps, saveButtonProps } = useForm<IResearch>();

    const { selectProps: researchesSelectProps } = useSelect<IResearch>({
        resource: "researches",
        optionLabel: "name",
        optionValue: "id",
    });

    return (
        <Create saveButtonProps={saveButtonProps} title={<div style={{display: 'flex', alignItems: 'center'}} >
            <Button style={{marginRight: '8px'}} onClick={navigation.goBack} type="text" icon={<Icons.ArrowLeftOutlined/>}/><span>Генерация исследования</span></div>}>
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
                    name="segments"
                    rules={[
                        {
                            required: true,
                        },
                    ]}
                >
                    <Select
                        mode="multiple"
                        options={[
                            {
                                label: t("researches.fields.segments.rightUp"),
                                value: "rightUp",
                            },
                            {
                                label: t("researches.fields.segments.rightMiddle"),
                                value: "rightMiddle",
                            },
                            {
                                label: t("researches.fields.segments.rightDown"),
                                value: "rightDown",
                            },
                            {
                                label: t("researches.fields.segments.leftUp"),
                                value: "leftUp",
                            },
                            {
                                label: t("researches.fields.segments.leftDown"),
                                value: "leftDown",
                            }
                        ]}
                    />
                </Form.Item>
                <Form.Item
                    label={t("researches.fields.pathology")}
                    name="pathology"
                    rules={[
                        {
                            required: true,
                        },
                    ]}
                >
                    <Select
                        options={[
                            {
                                label: t("researches.fields.pathologies.covid19"),
                                value: "covid19",
                            },
                            {
                                label: t("researches.fields.pathologies.cancer"),
                                value: "cancer",
                            },
                            {
                                label: t("researches.fields.pathologies.metastasis"),
                                value: "metastasis",
                            }
                        ]}
                    />
                </Form.Item>
                <Form.Item
                    label={t("researches.fields.diseasesCount")}
                    name="diseasesCount"
                    rules={[
                        {
                            required: true,
                        },
                    ]}
                >
                    <Select
                        options={[
                            {
                                label: t("researches.fields.diseases.single"),
                                value: "single",
                            },
                            {
                                label: t("researches.fields.diseases.small"),
                                value: "small",
                            },
                            {
                                label: t("researches.fields.diseases.high"),
                                value: "high",
                            }
                        ]}
                    />
                </Form.Item>
                <Form.Item
                    label={t("researches.fields.diseaseSize")}
                    name="diseaseSize"
                    rules={[
                        {
                            required: true,
                        },
                    ]}
                >
                    <Select
                        options={[
                            {
                                label: t("researches.fields.diseasesSize.extraSmall"),
                                value: "extraSmall",
                            },
                            {
                                label: t("researches.fields.diseasesSize.small"),
                                value: "small",
                            },
                            {
                                label: t("researches.fields.diseasesSize.medium"),
                                value: "medium",
                            },
                            {
                                label: t("researches.fields.diseasesSize.high"),
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