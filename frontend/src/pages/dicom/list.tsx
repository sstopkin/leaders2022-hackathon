import React from "react";
import {useLocation} from "react-router-dom";
import {useCustom, useGetIdentity, useNavigation, useOne} from "@pankod/refine-core";
import {IDicom, IResearch} from "../../interfaces";
import {API_ROOT} from "../../constants";
import axios from "axios";
import {Button, Icons, Spin} from "@pankod/refine-antd";
import DicomViewer from "../../components/DicomViewer";
import Error from "../../components/Error";
import dicomParser from "dicom-parser";
import {DICOM_DICTIONARY} from "../../utils";

export const DicomsList: React.FC = () => {
    const navigation = useNavigation();
    const search = useLocation().search;
    const researchIdParam = new URLSearchParams(search).get('researchId');

    const {data: currentUserData} = useGetIdentity<{ id: string, name: string }>();

    const [isLoading, setLoading] = React.useState(true);
    const [error, setError] = React.useState(undefined);
    const [dicomFiles, setDicomFiles] = React.useState<Array<File> | null>(null);

    const {data: userData, isLoading: userLoading, isError: userError} = useGetIdentity();

    const userName: string = userData.name

    const {data: researchData, isLoading: researchLoading, error: researchError} = useOne<IResearch>({
        resource: "researches",
        id: researchIdParam || "-1",
    });

    const {data, isLoading: dicomsLoading, error: dicomsError} = useCustom<Array<IDicom>>({
        url: `${API_ROOT}/dicoms`,
        method: "get",
        config: {
            query: {
                researchId: researchIdParam,
                sort: ["name,ASC"]
            },
        },
    });

    const getInstanceInformation = (file: File, origIdx: number): any => {
        return new Promise((res) => {
            const reader = new FileReader();

            reader.onload = () => {
                const arrayBuffer = reader.result as ArrayBuffer;
                const byteArray = new Uint8Array(arrayBuffer);
                const dataSet = dicomParser.parseDicom(byteArray);

                const dictionary = DICOM_DICTIONARY as { [key: string]: string };
                const outputObject: { [key: string]: string } = {}
                const elements = Object.keys(dictionary)
                elements.forEach((address) => {
                    const element = dataSet.elements[address];
                    if (element) {
                        const value = dataSet.string(address);
                        if (value) {
                            outputObject[dictionary[address]] = value;
                        }
                    }
                })
                res({instance: Number.parseInt(outputObject.instance), origIdx});
            }

            reader.readAsArrayBuffer(file);
        })
    }

    React.useEffect(() => {
        const downloadDicomFile = async () => {
            if (data?.data) {
                setLoading(true);
                setError(undefined);
                try {
                    const dicomData: { id: string, url: string }[] = data.data.map(dicomInfo => ({
                        id: dicomInfo.id,
                        url: dicomInfo.downloadingUrl
                    }));

                    const responses = await Promise.all(dicomData.map(data => axios.get(data.url, {
                        responseType: 'blob'
                    })));

                    const files = responses.filter(response => response.statusText === 'OK').map((response) => (
                        response.data
                    ));

                    const sortedOrder: Array<{ origIdx: number, instance: number }> = await Promise.all(files.map((file, index) => getInstanceInformation(file, index)));
                    sortedOrder.sort((a, b) => a.instance - b.instance)
                    const outputFiles = sortedOrder.map(value => files[value.origIdx]);

                    setDicomFiles(outputFiles);
                } catch (err: any) {
                    console.error(err.response.statusText);
                    setError(err.response.statusText);
                } finally {
                    setLoading(false)
                }
            }
        }
        downloadDicomFile()
    }, [data]);

    const isContentLoading = isLoading || dicomsLoading || researchLoading || userLoading;
    const isError = error || dicomsError || researchError || userError;
    const isViewerShowed = !isContentLoading && !isError && dicomFiles && dicomFiles.length > 0;

    return <div style={{
        height: '100%',
        backgroundColor: 'white',
        padding: '12px 24px 16px 24px',
        borderRadius: '6px'
    }}>
        <>
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
            {isError && <Error textError={error}/>}
            {isViewerShowed &&
                <DicomViewer
                    currentUserName={userName}
                    currentResearchId={researchIdParam || "-1"}
                    currentUserId={currentUserData?.id || "-1"}
                    dicomFiles={dicomFiles}
                    markup={researchData?.data.markup}
                    autoMarkup={researchData?.data.autoMarkup || null}
                />}
        </>
    </div>
}
