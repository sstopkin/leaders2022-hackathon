import {
    useTranslate,
    IResourceComponentsProps, useNotification, useNavigation,
} from "@pankod/refine-core";
import {Button, Create, Form, getValueFromEvent, Icons, Input, RcFile, Upload, useForm} from "@pankod/refine-antd";
import {IDicom} from "interfaces";
import {useLocation} from "react-router-dom";
import axios from "axios";
import {API_ROOT} from "../../constants";
import axiosInstance from "../../setup";
import React from "react";

export const DicomsCreate: React.FC<IResourceComponentsProps> = () => {
    const t = useTranslate();
    const notifications = useNotification();
    const navigation = useNavigation();

    const {formProps, saveButtonProps, form} = useForm<IDicom>({action: "create", resource: "dicoms", redirect: false});
    const [isLoading, setLoading] = React.useState<boolean>(false);

    const search = useLocation().search;
    const researchIdParam = new URLSearchParams(search).get('researchId');


    const onSubmitClick = async () => {
        setLoading(true);
        const researchId = form.getFieldValue('researchId');
        const fileName = form.getFieldValue('name');
        const file: Array<RcFile> = form.getFieldValue('file');

        if (!researchId || !fileName || !file) {
            notifications.open?.({
                type: 'error',
                message: 'Ошибка создания файла',
                description: 'Ошибка валидации'
            })
        } else {
            try {
                const createResponse = await axiosInstance.post(`${API_ROOT}/dicoms`, {
                    name: fileName,
                    researchId,
                    dicomType: 'original',
                    description: 'Test description'
                });

                const dicomId = createResponse.data.id;

                const uploadingUrl = createResponse.data.uploadingUrl;

                if (uploadingUrl) {
                    await axios.put(uploadingUrl, file[0]);

                    await axiosInstance.patch(`${API_ROOT}/dicoms/${dicomId}`, {
                        "isUploaded": true
                    })

                    await axiosInstance.patch(`${API_ROOT}/researches/${researchId}`, {
                        "status": "uploaded"
                    });

                    notifications.open?.({
                        type: 'success',
                        message: 'Фаил загружен успешно'
                    });
                    navigation.push(`/researches/show/${researchId}`)
                }
            } catch (err: any) {
                console.error(err.response)
                notifications.open?.({
                    type: 'error',
                    message: "Ошибка загрузки файла"
                })
            }
        }
        setLoading(false);
    }

    return (
        <Create saveButtonProps={saveButtonProps}
                footerButtons={() => <Button disabled={isLoading} loading={isLoading} icon={<Icons.SaveOutlined/>}
                                             onClick={onSubmitClick}
                                             type="primary">Сохранить</Button>}>
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
                            type: "string",
                        }
                    ]}
                >
                    <Input disabled/>
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
                    <Input disabled={isLoading}/>
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
                    <Upload disabled={isLoading} beforeUpload={() => false} name="file" accept=".dcm" maxCount={1}>
                        <Button icon={<Icons.UploadOutlined/>}>Загрузить файл</Button>
                    </Upload>
                </Form.Item>
            </Form>
        </Create>
    );
};