import React, {ChangeEvent} from "react";
import * as zip from "@zip.js/zip.js";
import {
    IResourceComponentsProps, useNotification, useNavigation,
} from "@pankod/refine-core";
import {Button, Create, Icons} from "@pankod/refine-antd";
import {useLocation} from "react-router-dom";
import axios from "axios";
import {API_ROOT} from "../../constants";
import axiosInstance from "../../setup";
import {humanFileSize} from "../../utils";
import {ZipReaderGetEntriesOptions} from "@zip.js/zip.js";

export const DicomsCreate: React.FC<IResourceComponentsProps> = () => {
    const notifications = useNotification();
    const navigation = useNavigation();

    const fileInputRef = React.useRef<HTMLInputElement | null>(null);
    const [isLoading, setLoading] = React.useState<boolean>(false);
    const [currentFiles, setCurrentFiles] = React.useState<Array<File>>([]);

    const search = useLocation().search;
    const researchIdParam = new URLSearchParams(search).get('researchId');

    const modelGetEntries = async (file: File, options?: ZipReaderGetEntriesOptions) => {
        return new zip.ZipReader(new zip.BlobReader(file)).getEntries(options)
    }

    const handleFileChange = async (evt: ChangeEvent<HTMLInputElement>) => {
        const files = evt.target.files;
        if (files) {
            if (files[0].type === 'application/x-zip-compressed' || files[0].type === 'application/zip') {
                const archive = files[0];
                const entries = await modelGetEntries(archive);
                const filesFromEntries = await Promise.all(entries.map(async (entry) => {
                    const data = await entry.getData(new zip.BlobWriter());
                    const {filename, rawLastModDate} = entry
                    return new File([data], filename, {
                        lastModified: rawLastModDate as number
                    })
                }));
                setCurrentFiles(filesFromEntries);
            } else {
                const formattedFiles = Array.from(files)
                setCurrentFiles(formattedFiles);
            }
        }
    }

    const handleUploadButtonClick = () => {
        if (fileInputRef.current) {
            fileInputRef.current.click();
        }
    }

    const handleClearFile = (fileName: string) => {
        const newCurrentFiles = currentFiles?.filter(cFile => cFile.name !== fileName);
        setCurrentFiles(newCurrentFiles);
        if (fileInputRef.current) {
            fileInputRef.current.value = ""
        }
    }

    const handleClearAllFiles = () => {
        setCurrentFiles([]);
        if (fileInputRef.current) {
            fileInputRef.current.value = ""
        }
    }

    const uploadFile = async (file: File, researchId: string) => {
        const createResponse = await axiosInstance.post(`${API_ROOT}/dicoms`, {
            name: file.name,
            researchId,
            dicomType: 'original',
            description: 'Test description'
        });

        const dicomId = createResponse.data.id;

        const uploadingUrl = createResponse.data.uploadingUrl;

        if (uploadingUrl) {
            let options = {
                headers: {
                    'Content-Type': file.type
                }
            };

            try {
                await axios.put(uploadingUrl, file, options);

                await axiosInstance.patch(`${API_ROOT}/dicoms/${dicomId}`, {
                    "isUploaded": true
                })

                return true
            } catch (err) {
                return false
            }
        } else {
            return false
        }
    }

    const onSubmitClick = async () => {
        setLoading(true);

        if (!researchIdParam || currentFiles.length === 0) {
            notifications.open?.({
                type: 'error',
                message: 'Ошибка создания файла',
                description: 'Ошибка валидации'
            })
        } else {
            try {
                const uploadResponses = await Promise.all(currentFiles.map(currentFile => uploadFile(currentFile, researchIdParam)));
                if (uploadResponses.includes(false)) {
                    notifications.open?.({
                        type: 'error',
                        message: "Ошибка загрузки файлов"
                    })
                } else {
                    navigation.goBack();
                }
            } catch (err) {
                notifications.open?.({
                    type: 'error',
                    message: "Ошибка загрузки файлов"
                })
            } finally {
                setLoading(false);
            }
        }
    }

    return (
        <Create
            title={<div style={{display: 'flex', alignItems: 'center'}}>
                <Button
                    style={{marginRight: '8px'}}
                    onClick={navigation.goBack}
                    type="text"
                    icon={
                        <Icons.ArrowLeftOutlined/>}/>
                <span>Загрузить файлы для исследования</span>
            </div>}
            footerButtons={() => <Button
                disabled={isLoading || currentFiles.length === 0}
                loading={isLoading}
                icon={<Icons.SaveOutlined/>}
                onClick={onSubmitClick}
                type="primary"
            >Сохранить
            </Button>}>
            <input multiple onChange={handleFileChange} style={{display: 'none'}} ref={fileInputRef} type="file"
                   accept=".dcm,.dicom, .zip"/>
            {currentFiles.length === 0 &&
                <Button type="primary" onClick={handleUploadButtonClick} icon={<Icons.UploadOutlined/>}>Загрузить
                    файл(ы)</Button>}
            {currentFiles.length > 0 &&
                <>
                    {currentFiles.length > 1 &&
                        <Button style={{marginBottom: "8px"}} icon={<Icons.DeleteOutlined/>} danger type="primary"
                                onClick={handleClearAllFiles}>Удалить
                            все</Button>}
                    {currentFiles.map(currentFile => <div key={currentFile.name}>
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
                            onClick={() => handleClearFile(currentFile.name)}
                            icon={<Icons.CloseOutlined/>}
                        />
                    </div>)}</>}
        </Create>
    );
};