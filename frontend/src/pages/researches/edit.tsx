import {
    useTranslate,
    IResourceComponentsProps,
    useList,
} from "@pankod/refine-core";
import { Edit, Form, Input, Select, useForm } from "@pankod/refine-antd";
import { IResearch, IUser } from "interfaces";
import ReactMde from "react-mde";
import ReactMarkdown from "react-markdown";
import { useState } from "react";
import { returnFullNameFromUserObject } from "utils";

export const ResearchesEdit: React.FC<IResourceComponentsProps> = () => {
    const [selectedTab, setSelectedTab] = useState<"write" | "preview">("write");
    const t = useTranslate();

    const { formProps, saveButtonProps } = useForm<IResearch>();

    const users = useList<IUser>({
        resource: "users"
    });

    return (
        <Edit saveButtonProps={saveButtonProps}>
            <Form {...formProps}
                initialValues={{
                    ...formProps.initialValues,
                }}
                layout="vertical">
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
                    label={t("researches.fields.status")}
                    name="status"
                    rules={[
                        {
                            required: true,
                        },
                    ]}
                >
                    <Select
                        options={[
                            {
                                label: t("researchStatuses.created"),
                                value: "created",
                            },
                            {
                                label: t("researchStatuses.ready_to_mark"),
                                value: "ready_to_mark",
                            },
                            {
                                label: t("researchStatuses.in_markup"),
                                value: "in_markup",
                            },
                            {
                                label: t("researchStatuses.markup_done"),
                                value: "markup_done",
                            }
                        ]}
                    />
                </Form.Item>
                <Form.Item
                    label={t("researches.fields.assigneeUser")}
                    name="assigneeUserId"
                >
                    <Select
                        allowClear
                        options={users?.data?.data.map(user => ({
                            value: user.id,
                            label: returnFullNameFromUserObject(user)
                        }))} />
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
        </Edit>
    );
};