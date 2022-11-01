import {
    useTranslate,
    IResourceComponentsProps, useNotification, useNavigation,
} from "@pankod/refine-core";
import {Button, Create, Form, Icons, Input, useForm} from "@pankod/refine-antd";
import {IDicom} from "interfaces";
import {useLocation} from "react-router-dom";
import axios from "axios";
import {API_ROOT} from "../../constants";
import axiosInstance from "../../setup";
import React, {ChangeEvent} from "react";
import {humanFileSize} from "../../utils";

export const DicomsCreate: React.FC<IResourceComponentsProps> = () => {
    const t = useTranslate();
    const notifications = useNotification();
    const navigation = useNavigation();

    const fileInputRef = React.useRef<HTMLInputElement | null>(null);

    const {formProps, saveButtonProps, form} = useForm<IDicom>({action: "create", resource: "dicoms", redirect: false});
    const [isLoading, setLoading] = React.useState<boolean>(false);
    const [currentFile, setCurrentFile] = React.useState<File | undefined>(undefined);

    const search = useLocation().search;
    const researchIdParam = new URLSearchParams(search).get('researchId');

    const handleFileChange = (evt: ChangeEvent<HTMLInputElement>) => {
        const files = evt.target.files;
        if (files?.[0]) {
            const uploadedFile = files[0];
            setCurrentFile(uploadedFile);
        }
    }

    const handleUploadButtonClick = () => {
        if (fileInputRef.current) {
            fileInputRef.current.click();
        }
    }

    const handleClearFile = () => {
        setCurrentFile(undefined);
        if (fileInputRef.current) {
            fileInputRef.current.value = ""
        }
    }

    const onSubmitClick = async () => {
        setLoading(true);
        const researchId = form.getFieldValue('researchId');

        if (!researchId || !currentFile) {
            notifications.open?.({
                type: 'error',
                message: 'Ошибка создания файла',
                description: 'Ошибка валидации'
            })
        } else {
            try {
                const createResponse = await axiosInstance.post(`${API_ROOT}/dicoms`, {
                    name: currentFile.name,
                    researchId,
                    dicomType: 'original',
                    description: 'Test description'
                });

                const dicomId = createResponse.data.id;

                const uploadingUrl = createResponse.data.uploadingUrl;

                if (uploadingUrl) {
                    let options = {
                        headers: {
                            'Content-Type': currentFile.type
                        }
                    };
                    await axios.put(uploadingUrl, currentFile, options);

                    await axiosInstance.patch(`${API_ROOT}/dicoms/${dicomId}`, {
                        "isUploaded": true
                    })

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
        <Create
            title={<div style={{display: 'flex', alignItems: 'center'}}><Button style={{marginRight: '8px'}}
                                                                                onClick={navigation.goBack} type="text"
                                                                                icon={
                                                                                    <Icons.ArrowLeftOutlined/>}/><span>Загрузить файл для
            исследования</span></div>} saveButtonProps={saveButtonProps}
            footerButtons={() => <Button disabled={isLoading || !currentFile} loading={isLoading}
                                         icon={<Icons.SaveOutlined/>}
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
            </Form>
            <input onChange={handleFileChange} style={{display: 'none'}} ref={fileInputRef} type="file"
                   accept=".dcm,.dicom"/>
            {currentFile === undefined &&
                <Button type="primary" onClick={handleUploadButtonClick} icon={<Icons.UploadOutlined/>}>Загрузить
                    файл</Button>}
            {currentFile &&
                <div>
                    <Icons.LinkOutlined/>
                    <span
                        style={{
                            fontWeight: 'bold',
                            marginLeft: '8px'
                        }}>
                                {currentFile.name} {humanFileSize(currentFile.size, true)}
                            </span>
                    <Button
                        type="link"
                        danger
                        disabled={isLoading}
                        onClick={handleClearFile}
                        icon={<Icons.CloseOutlined/>}
                    />
                </div>}
        </Create>
    );
};