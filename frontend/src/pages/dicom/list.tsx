import React from "react";
import {useLocation} from "react-router-dom";
import {useCustom, useNavigation} from "@pankod/refine-core";
import {IDicom} from "../../interfaces";
import {API_ROOT} from "../../constants";
import axios from "axios";
import {Button, Icons, Spin} from "@pankod/refine-antd";
import DicomViewer from "../../components/DicomViewer";
import Error from "../../components/Error";

export const DicomsList: React.FC = () => {
    const navigation = useNavigation();
    const search = useLocation().search;
    const researchIdParam = new URLSearchParams(search).get('researchId');

    const [dicomFilesLoading, setDicomFilesLoading] = React.useState(true);
    const [dicomFilesError, setDicomFilesError] = React.useState(undefined);
    const [dicomFiles, setDicomFiles] = React.useState<Array<File> | null>(null);

    const {data, isLoading, error} = useCustom<Array<IDicom>>({
        url: `${API_ROOT}/dicoms`,
        method: "get",
        config: {
            query: {
                researchId: researchIdParam,
            },
        },
    });

    React.useEffect(() => {
        const downloadDicomFile = async () => {
            if (data?.data) {
                setDicomFilesLoading(true);
                setDicomFilesError(undefined);
                try {
                    const urls = data.data.map(dicomInfo => dicomInfo.downloadingUrl);
                    const responses = await Promise.all(urls.map(url => axios.get(url, {
                        responseType: 'blob'
                    })));
                    const files = responses.filter(response => response.statusText === 'OK').map(response => response.data);
                    setDicomFiles(files);
                } catch (err: any) {
                    console.error(err.response.statusText);
                    setDicomFilesError(err.response.statusText);
                } finally {
                    setDicomFilesLoading(false)
                }
            }
        }
        downloadDicomFile()
    }, [data]);

    const isContentLoading = isLoading || dicomFilesLoading;
    const isError = error || dicomFilesError;
    const isViewerShowed = !isContentLoading && !isError && dicomFiles && dicomFiles.length > 0;

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
        {isError && <Error textError={dicomFilesError}/>}
        {isViewerShowed && <DicomViewer dicomFiles={dicomFiles}/>}
    </div>
}