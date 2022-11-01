import React from "react";
import {
    IResourceComponentsProps, useCustom, useNavigation,
} from "@pankod/refine-core";
import DicomViewer from "../../components/DicomViewer";
import {IDicom} from "../../interfaces";
import {useLocation} from "react-router-dom";
import {API_ROOT} from "../../constants";
import {Button, Icons, Spin} from "@pankod/refine-antd";
import axios from "axios";
import Error from "../../components/Error";

export const DicomsShow: React.FC<IResourceComponentsProps> = () => {
    const location = useLocation();
    const navigation = useNavigation();
    const pathArray = location.pathname.split("/");
    const dicomId = pathArray[pathArray.length - 1];

    const [dicomFileLoading, setDicomFileLoading] = React.useState(true);
    const [dicomFileError, setDicomFileError] = React.useState<undefined | string>(undefined);
    const [dicomFile, setDicomFile] = React.useState<File | null>(null);

    const {data, isLoading, error} = useCustom<IDicom>({
        url: `${API_ROOT}/dicoms/${dicomId}`,
        method: "get",
    });

    const isContentLoading = dicomFileLoading || isLoading;
    const isContentError = dicomFileError || error;

    const isViewerShowed = !isContentLoading && !isContentError && dicomFile;

    React.useEffect(() => {
        const downloadDicomFile = async () => {
            if (data) {
                setDicomFileLoading(true);
                setDicomFileError(undefined);
                try {
                    const response = await axios.get(data.data.downloadingUrl, {
                        responseType: 'blob'
                    });
                    setDicomFile(response.data);
                } catch (err: any) {
                    console.error(err.response.statusText);
                    setDicomFileError(err.response.statusText);
                } finally {
                    setDicomFileLoading(false)
                }
            }
        }
        downloadDicomFile()
    }, [data]);

    return <div style={{
        height: '100%',
        backgroundColor: 'white',
        padding: '12px 24px 16px 24px',
        borderRadius: '6px'
    }}>
        <div style={{display: 'flex', alignItems: 'center', paddingBottom: '8px', height: '5%'}}>
            <Button
                onClick={navigation.goBack}
                style={{marginRight: '16px'}}
                type="text"
                icon={<Icons.ArrowLeftOutlined/>}
            />
            <h3 style={{padding: "0", margin: "0"}}>Просмотр исследования</h3>
        </div>
        {isContentLoading && <div
            style={{width: '100%', height: '95%', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
            <Spin size="large"/></div>}
        {isContentError && <div
            style={{width: '100%', height: '95%', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
            <Error textError={dicomFileError}/>
        </div>}
        {isViewerShowed && <DicomViewer dicomFiles={[dicomFile]}/>}
    </div>
}