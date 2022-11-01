import React, {ChangeEvent} from "react";
import * as cornerstone from "@cornerstonejs/core";
import {RenderingEngine} from "@cornerstonejs/core";
import {Button, Icons, Tooltip} from "@pankod/refine-antd";
import cornerstoneWADOImageLoader from 'cornerstone-wado-image-loader';
import {useNotification, useTranslate} from "@pankod/refine-core";
import * as cornerstoneTools from "@cornerstonejs/tools";
import {ViewportType} from "@cornerstonejs/core/dist/esm/enums";
import {IStackViewport} from "@cornerstonejs/core/dist/esm/types";
import {Annotation, IToolGroup} from "@cornerstonejs/tools/dist/esm/types";
import {MouseBindings} from "@cornerstonejs/tools/dist/esm/enums";
import dicomParser from "dicom-parser";
import {DICOM_DICTIONARY, formatDicomValues} from "../../utils";
import {ReactComponent as RulerIcon} from "../../assets/icons/ruler.svg";
import {ReactComponent as RectangleROI} from "../../assets/icons/rectangleROI.svg";
import {ReactComponent as CircleROI} from "../../assets/icons/circleROI.svg";
import {ReactComponent as PencilIcon} from "../../assets/icons/pencil.svg";
import {ReactComponent as WindowLevelIcon} from "../../assets/icons/windowLevel.svg";
import styles from "./DicomViewer.module.css";

const {
    LengthTool,
    RectangleROITool,
    EllipticalROITool,
    BidirectionalTool,
    AngleTool,
    PanTool,
    WindowLevelTool,
    ZoomTool,
    PlanarFreehandROITool,
    ToolGroupManager,
} = cornerstoneTools;

const toolGroupId = 'STACK_TOOL_GROUP_1';
const renderingEngineId = "RENDER_ENGINE_1";
const viewportId = 'VIEWPORT_1';

const toolsIcons = {
    [LengthTool.toolName]: <RulerIcon/>,
    [RectangleROITool.toolName]: <RectangleROI/>,
    [EllipticalROITool.toolName]: <CircleROI/>,
    [BidirectionalTool.toolName]: <Icons.QuestionCircleOutlined/>,
    [AngleTool.toolName]: <Icons.QuestionCircleOutlined/>,
    [PlanarFreehandROITool.toolName]: <PencilIcon/>,
    [PanTool.toolName]: <Icons.DragOutlined/>,
    [WindowLevelTool.toolName]: <WindowLevelIcon/>,
    [ZoomTool.toolName]: <Icons.SearchOutlined/>
}

const toolsNames = [
    LengthTool.toolName,
    RectangleROITool.toolName,
    EllipticalROITool.toolName,
    BidirectionalTool.toolName,
    AngleTool.toolName,
    PlanarFreehandROITool.toolName,
    PanTool.toolName,
    WindowLevelTool.toolName,
    ZoomTool.toolName,
];

cornerstoneTools.addTool(LengthTool)
cornerstoneTools.addTool(PanTool)
cornerstoneTools.addTool(WindowLevelTool)
cornerstoneTools.addTool(ZoomTool)
cornerstoneTools.addTool(RectangleROITool)
cornerstoneTools.addTool(EllipticalROITool)
cornerstoneTools.addTool(BidirectionalTool)
cornerstoneTools.addTool(AngleTool)
cornerstoneTools.addTool(PlanarFreehandROITool)

const DicomViewer: React.FC = () => {
    const t = useTranslate();
    const notification = useNotification();

    const imageZoneRef = React.useRef<null | HTMLDivElement>(null)
    const hiddenImportAnnotationInputRef = React.useRef<null | HTMLInputElement>(null)
    const hiddenFileInputRef = React.useRef<null | HTMLInputElement>(null)
    const toolGroupRef = React.useRef<IToolGroup | undefined>(undefined)
    const renderingEngineRef = React.useRef<RenderingEngine | null>(null)
    const viewportRef = React.useRef<IStackViewport | null>(null)

    const [fileLoaded, setFileLoaded] = React.useState<boolean>(false);
    const [activeTool, setActiveTool] = React.useState<undefined | string>(undefined);
    const [dicomInfo, setDicomInfo] = React.useState<undefined | { [key: string]: string }>(undefined);
    const [annotationsState, setAnnotationsState] = React.useState<Array<{
        uuid: string,
        toolName: string,
        isVisible: boolean
    }>>([]);

    //TODO Remove with upload button
    const handleUploadClick = () => {
        if (hiddenFileInputRef.current) {
            hiddenFileInputRef.current.click();
        }
    }

    const handleImportClick = () => {
        if (hiddenImportAnnotationInputRef.current) {
            hiddenImportAnnotationInputRef.current.click();
        }
    }

    const getActiveAnnotationsState: () => Array<Annotation> = () => {
        return annotationsState.map(annotation => cornerstoneTools.annotation.state.getAnnotation(annotation.uuid));
    }

    const exportAnnotationStateToJSON = () => {
        const currentAnnotationState = getActiveAnnotationsState();
        const a = document.createElement("a");
        const file = new Blob([JSON.stringify({data: currentAnnotationState})], {type: "application/json"});
        a.href = URL.createObjectURL(file);
        a.download = `Export-${Date.now()}`;
        a.click();
        URL.revokeObjectURL(a.href);
        notification.open?.({
            type: 'success',
            message: t("dicom.annotations.notifications.export.title"),
            description: t("dicom.annotations.notifications.export.description"),
            key: Date.now().toString()
        })
    }

    const saveAnnotationState = () => {
        const currentAnnotationState = getActiveAnnotationsState();
        console.log(currentAnnotationState);
        notification.open?.({
            type: 'success',
            message: t("dicom.annotations.notifications.save.title"),
            description: t("dicom.annotations.notifications.save.description"),
            key: Date.now().toString()
        })
    }

    const importAnnotationsState = (newState: { data: Array<Annotation> }) => {
        if (imageZoneRef.current) {
            const element = imageZoneRef.current;
            cornerstoneTools.annotation.state.removeAllAnnotations(element);
            const formattedAnnotationsInfo = newState.data.map(annotation => {
                cornerstoneTools.annotation.state.addAnnotation(element, annotation)
                return {
                    uuid: annotation.annotationUID || "",
                    toolName: annotation.metadata.toolName,
                    isVisible: true
                }
            });
            setAnnotationsState(formattedAnnotationsInfo);

            if (viewportRef.current) {
                viewportRef.current.render();
            }

            notification.open?.({
                type: 'success',
                message: t("dicom.annotations.notifications.import.title"),
                description: t("dicom.annotations.notifications.import.description"),
                key: Date.now().toString()
            })
        }
    }

    const handleAnnotationDraw = () => {
        if (imageZoneRef.current && activeTool) {
            const element = imageZoneRef.current;
            const currentAnnotationToolState = cornerstoneTools.annotation.state.getAnnotations(element, activeTool);
            const lastStateItem = currentAnnotationToolState[currentAnnotationToolState.length - 1];
            if (!annotationsState.find(annotation => annotation.uuid === lastStateItem.annotationUID)) {
                const convertedStateItem = {
                    uuid: lastStateItem.annotationUID || "",
                    toolName: lastStateItem.metadata.toolName,
                    isVisible: true
                }
                setAnnotationsState([convertedStateItem, ...annotationsState]);
            }
        }
    }

    const toggleAnnotationVisibility = (uuid: string) => {
        const annotationIndex = annotationsState.findIndex(annotation => annotation.uuid === uuid);

        if (annotationIndex !== -1) {
            const annotationObject = annotationsState[annotationIndex];
            const visibleStatus = annotationObject.isVisible;
            cornerstoneTools.annotation.visibility.setAnnotationVisibility(annotationObject.uuid, !visibleStatus)
            const newAnnotationStatus = {
                ...annotationObject,
                isVisible: !annotationObject.isVisible
            }
            const currentState = annotationsState
            currentState.splice(annotationIndex, 1, newAnnotationStatus);
            setAnnotationsState([...currentState]);

            if (viewportRef.current) {
                viewportRef.current.render();
            }
        }
    }

    const deleteAnnotation = (uuid: string) => {
        const annotationIndex = annotationsState.findIndex(annotation => annotation.uuid === uuid);

        if (annotationIndex !== -1) {
            cornerstoneTools.annotation.state.removeAnnotation(uuid)
            const currentState = annotationsState.filter(annotation => annotation.uuid !== uuid);
            setAnnotationsState(currentState);

            if (viewportRef.current) {
                viewportRef.current.render();
            }
        }
    }

    const handleToolButton = (toolName: string) => {
        const previousTool = activeTool;
        if (previousTool === toolName) {
            setActiveTool(undefined);
            toolGroupRef.current?.setToolPassive(previousTool);
        } else {
            setActiveTool(toolName);
            toolGroupRef.current?.setToolActive(toolName, {
                bindings: [{
                    mouseButton: MouseBindings.Primary
                }]
            });
            if (previousTool) {
                toolGroupRef.current?.setToolPassive(previousTool);
            }
        }
    }

    const getButtonType = (toolName: any) => {
        if (toolName === activeTool) {
            return 'primary'
        }
        return undefined
    }


    const handleRotate = () => {
        if (viewportRef.current) {
            const currentProperties = viewportRef.current.getProperties();
            const currentRotation = currentProperties.rotation;
            viewportRef.current.setProperties({rotation: (currentRotation || 0) + 90});
            viewportRef.current.render();
        }
    }

    const parseDicomFile = (file: File) => {
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
            setDicomInfo(outputObject);
        }
        reader.readAsArrayBuffer(file);
    }

    const initializeCornerstone = async (imageId: string, element: HTMLDivElement) => {
        toolGroupRef.current = ToolGroupManager.createToolGroup(toolGroupId);
        renderingEngineRef.current = new cornerstone.RenderingEngine(renderingEngineId);

        if (toolGroupRef.current) {
            toolsNames.forEach((toolName) => {
                toolGroupRef.current?.addTool(toolName);
                toolGroupRef.current?.setToolPassive(toolName);
            })
        }

        toolGroupRef.current?.addViewport(viewportId, renderingEngineId)

        const viewportInput = {
            viewportId,
            type: ViewportType.STACK,
            element
        }

        renderingEngineRef.current.enableElement(viewportInput);

        viewportRef.current = renderingEngineRef.current.getViewport(viewportId) as IStackViewport;
        const stack = [imageId];


        await viewportRef.current.setStack(stack);

        viewportRef.current.render();

        viewportRef.current.canvas.oncontextmenu = (event) => event.preventDefault()

        setFileLoaded(true);
    }

    const handleFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];

        if (file) {
            parseDicomFile(file);
            const imageId = cornerstoneWADOImageLoader.wadouri.fileManager.add(file);

            if (imageZoneRef.current) {
                await initializeCornerstone(imageId, imageZoneRef.current)
            }
        }
    }

    const handleImportFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];

        if (file) {
            const fileReader = new FileReader();
            fileReader.onload = (evt) => {
                const result = evt.target?.result as string;
                if (result) {
                    const importedObject = JSON.parse(result);
                    importAnnotationsState(importedObject);
                }
            }
            fileReader.readAsText(file);
        }
    }

    return (
        <div className={styles.mainContainer}>
            <div className={styles.leftSidePanel}>
                <div className={styles.dicomInfoBlock}>
                    <h3>{t("dicom.info.title")}</h3>
                    <ul className={styles.dicomInfoList}>
                        {Object.keys(dicomInfo || {}).map(info => <li
                            className={styles.dicomInfoListItem}
                            key={info}>
                            <h4>{t(`dicom.info.${info}`)}:</h4>
                            <span>{formatDicomValues(dicomInfo?.[info], info)}</span>
                        </li>)}</ul>
                </div>
                <div className={styles.annotationsInfoBlock}>
                    <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginBottom: '4px'
                    }}>
                        <h3 style={{padding: 0}}>{t('dicom.annotations.title')}</h3>
                        <input
                            accept="application/JSON"
                            ref={hiddenImportAnnotationInputRef}
                            type="file"
                            style={{display: 'none'}}
                            onChange={handleImportFileChange}
                        />
                        <Tooltip placement="right" color="green" title={t("dicom.annotations.tool.Import")}>
                            <Button onClick={handleImportClick} disabled={!fileLoaded} icon={<Icons.ImportOutlined/>}/>
                        </Tooltip>
                    </div>
                    <ul className={styles.annotationsInfoList}>
                        {annotationsState.map((annotation) => <li
                                key={annotation.uuid}
                                className={styles.annotationsInfoListItem}>
                                <div>
                                    <span>{t(`dicom.annotations.tool.${annotation.toolName}`)}</span>
                                </div>
                                <div>
                                    <Tooltip
                                        placement="top"
                                        color="green"
                                        title={annotation.isVisible ? t("dicom.annotations.tool.Hide") : t("dicom.annotations.tool.Show")}
                                    >
                                        <Button
                                            style={{marginRight: '8px'}}
                                            type={annotation.isVisible ? "primary" : 'default'}
                                            icon={annotation.isVisible ? <Icons.EyeOutlined/> :
                                                <Icons.EyeInvisibleOutlined/>}
                                            onClick={() => toggleAnnotationVisibility(annotation.uuid)}
                                        />
                                    </Tooltip>
                                    <Tooltip
                                        placement="top"
                                        color="green"
                                        title={t("dicom.annotations.tool.Delete")}
                                    >
                                        <Button
                                            type="primary"
                                            icon={<Icons.CloseOutlined/>}
                                            danger
                                            onClick={() => deleteAnnotation(annotation.uuid)}
                                        />
                                    </Tooltip>
                                </div>
                            </li>
                        )}
                    </ul>
                </div>
            </div>
            <div
                onMouseUp={handleAnnotationDraw}
                ref={imageZoneRef} className={styles.imageContainer}/>
            <div className={styles.rightSidePanel}>
                <input
                    accept=".dcm"
                    ref={hiddenFileInputRef}
                    type="file"
                    style={{display: 'none'}}
                    onChange={handleFileChange}
                />
                <Button
                    style={{marginBottom: '32px'}}
                    size="large"
                    onClick={handleUploadClick}
                    icon={<Icons.UploadOutlined/>}
                />
                <div>
                    {toolsNames.map(toolName => <Tooltip placement="left"
                                                         color="green"
                                                         title={t(`dicom.annotations.tool.${toolName}`)}>
                        <Button
                            style={{
                                marginBottom: toolName === PlanarFreehandROITool.toolName ? '32px' : '8px',
                                display: 'flex',
                                justifyContent: 'center',
                                alignItems: 'center'
                            }}
                            size="large"
                            disabled={!fileLoaded}
                            key={toolName}
                            type={getButtonType(toolName)}
                            icon={toolsIcons[toolName]}
                            onClick={() => handleToolButton(toolName)}/>
                    </Tooltip>)}
                    <Tooltip
                        placement="left"
                        color="green"
                        title={t("dicom.annotations.tool.Rotate")}
                    >
                        <Button
                            disabled={!fileLoaded}
                            size="large"
                            onClick={handleRotate}
                            icon={<Icons.RotateRightOutlined/>}
                        />
                    </Tooltip>
                </div>
                <div style={{marginTop: 'auto', display: 'flex', flexDirection: 'column'}}>
                    <Tooltip
                        placement="left"
                        color="green"
                        title={t("dicom.annotations.tool.Export")}
                    >
                        <Button style={{marginBottom: '8px'}} disabled={!fileLoaded} size="large"
                                icon={<Icons.ExportOutlined/>}
                                onClick={exportAnnotationStateToJSON}/>
                    </Tooltip>
                    <Tooltip
                        placement="left"
                        color="green"
                        title={t("dicom.annotations.tool.Save")}
                    >
                        <Button disabled={!fileLoaded} size="large" icon={<Icons.SaveOutlined/>}
                                onClick={saveAnnotationState}/>
                    </Tooltip>
                </div>
            </div>
        </div>
    );
}

export default DicomViewer;