import React, {ChangeEvent} from "react";
import * as cornerstone from "@cornerstonejs/core";
import {RenderingEngine} from "@cornerstonejs/core";
import {Button, Icons, Spin, Tooltip, Select} from "@pankod/refine-antd";
import cornerstoneWADOImageLoader from 'cornerstone-wado-image-loader';
import {useNotification, useTranslate} from "@pankod/refine-core";
import * as cornerstoneTools from "@cornerstonejs/tools";
import {ViewportType} from "@cornerstonejs/core/dist/esm/enums";
import {IStackViewport, VOIRange} from "@cornerstonejs/core/dist/esm/types";
import {Annotation} from "@cornerstonejs/tools/dist/esm/types";
import {MouseBindings} from "@cornerstonejs/tools/dist/esm/enums";
import dicomParser from "dicom-parser";
import {DICOM_DICTIONARY, formatDicomValues} from "../../utils";
import {ReactComponent as RulerIcon} from "../../assets/icons/ruler.svg";
import {ReactComponent as RectangleROI} from "../../assets/icons/rectangleROI.svg";
import {ReactComponent as CircleROI} from "../../assets/icons/circleROI.svg";
import {ReactComponent as PencilIcon} from "../../assets/icons/pencil.svg";
import {ReactComponent as WindowLevelIcon} from "../../assets/icons/windowLevel.svg";
import {ReactComponent as BidirectionalToolIcon} from "../../assets/icons/bidirectionalRuler.svg";
import {ReactComponent as AngleIcon} from "../../assets/icons/angle.svg";
import styles from "./DicomViewer.module.css";
import {MouseWheelEventType} from "@cornerstonejs/tools/dist/esm/types/EventTypes";
import AnnotationsList from "../AnnotationsList";
import axiosInstance from "../../setup";
import {API_ROOT} from "../../constants";
import {RawMarkup} from "../../interfaces";

const {
    MagnifyTool,
    LengthTool,
    RectangleROITool,
    EllipticalROITool,
    BidirectionalTool,
    AngleTool,
    PanTool,
    WindowLevelTool,
    PlanarFreehandROITool,
    ToolGroupManager,
    StackScrollMouseWheelTool
} = cornerstoneTools;

const toolGroupId = 'STACK_TOOL_GROUP_1';
const renderingEngineId = "RENDER_ENGINE_1";
const viewportId = 'VIEWPORT_1';

const toolsIcons = {
    [LengthTool.toolName]: <RulerIcon/>,
    [RectangleROITool.toolName]: <RectangleROI/>,
    [EllipticalROITool.toolName]: <CircleROI/>,
    [BidirectionalTool.toolName]: <BidirectionalToolIcon/>,
    [AngleTool.toolName]: <AngleIcon/>,
    [PlanarFreehandROITool.toolName]: <PencilIcon/>,
    [PanTool.toolName]: <Icons.DragOutlined/>,
    [WindowLevelTool.toolName]: <WindowLevelIcon/>,
    [MagnifyTool.toolName]: <Icons.SearchOutlined/>
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
    MagnifyTool.toolName,
];

interface DicomViewerProps {
    dicomFiles: Array<File>,
    currentUserName: string,
    currentUserId: string,
    currentResearchId: string,
    markup?: null | RawMarkup
}

interface AnnotationsState {
    [userId: string]: {
        username: string
        info: Array<{
            uuid: string,
            toolName: string,
            imageIdx: number,
            isVisible: boolean,
        }>
    }
}

type VoiModes =
    'BRAIN'
    | 'SUBDURAL'
    | 'TEMPORAL_BONES'
    | 'HEAD_SOFT_TISSUES'
    | 'LUNGS'
    | 'ABDOMEN_SOFT_TISSUES'
    | 'LIVER'
    | 'SPINE_SOFT_TISSUES'
    | 'SPINE_BONES' | 'DEFAULT';

const VoiModesLabels = ['DEFAULT', 'BRAIN', 'SUBDURAL', 'TEMPORAL_BONES', 'HEAD_SOFT_TISSUES', 'LUNGS', 'ABDOMEN_SOFT_TISSUES', 'LIVER', 'SPINE_SOFT_TISSUES', 'SPINE_BONES']

const VoiModesValues: { [key in VoiModes]: VOIRange } = {
    DEFAULT: {
        upper: 0,
        lower: 0
    },
    BRAIN: {
        upper: 80,
        lower: 40
    },
    SUBDURAL: {
        upper: 300,
        lower: 100
    },
    TEMPORAL_BONES: {
        upper: 2800,
        lower: 600
    },
    HEAD_SOFT_TISSUES: {
        upper: 400,
        lower: 60
    },
    LUNGS: {
        upper: 1500,
        lower: 600
    },
    ABDOMEN_SOFT_TISSUES: {
        upper: 400,
        lower: 50
    },
    LIVER: {
        upper: 150,
        lower: 30
    },
    SPINE_SOFT_TISSUES: {
        upper: 250,
        lower: 50
    },
    SPINE_BONES: {
        upper: 1800,
        lower: 400
    }
}

const DicomViewer: React.FC<DicomViewerProps> = ({
                                                     dicomFiles,
                                                     currentUserId,
                                                     currentResearchId,
                                                     currentUserName,
                                                     markup
                                                 }) => {
    const CustomLevel = React.useRef(class CustomLevel extends WindowLevelTool {
        getNewRange({
                        viewport,
                        deltaPointsCanvas,
                        volumeId,
                        lower,
                        upper
                    }: { viewport: any; deltaPointsCanvas: any; volumeId: any; lower: any; upper: any }): { lower: number; upper: number } {
            setVoiRange({upper, lower});
            return super.getNewRange({viewport, deltaPointsCanvas, volumeId, lower, upper});
        }
    })

    const CustomStackWheel = React.useRef(class CustomStackWheel extends StackScrollMouseWheelTool {
        mouseWheelCallback(evt: MouseWheelEventType) {
            super.mouseWheelCallback(evt);
            const viewport = viewportRef.current;
            if (viewport) {
                const untypedViewport = viewport as any;
                const fileIndex = untypedViewport.getTargetImageIdIndex();
                if (fileIndex !== undefined) {
                    setCurrentImageIndex(fileIndex);
                    parseDicomFile(dicomFiles[fileIndex]);
                }
            }
        }
    })

    const t = useTranslate();
    const notification = useNotification();

    const imageZoneRef = React.useRef<null | HTMLDivElement>(null)
    const hiddenImportAnnotationInputRef = React.useRef<null | HTMLInputElement>(null)
    const toolGroupRef = React.useRef(ToolGroupManager)
    const renderingEngineRef = React.useRef<RenderingEngine | null>(null)
    const viewportRef = React.useRef<IStackViewport | null>(null)
    const defaultVOIRef = React.useRef<undefined | VOIRange>(undefined);

    const [fileLoaded, setFileLoaded] = React.useState<boolean>(false);
    const [activeTool, setActiveTool] = React.useState<undefined | string>(undefined);
    const [dicomInfo, setDicomInfo] = React.useState<undefined | { [key: string]: string }>(undefined);
    const [annotationsState, setAnnotationsState] = React.useState<AnnotationsState>({
        [currentUserId]: {
            info: [],
            username: currentUserName
        }
    });
    const [isStateSaving, setStateSaving] = React.useState<boolean>(false);
    const [currentImageIndex, setCurrentImageIndex] = React.useState<number>(0);
    const [voiRange, setVoiRange] = React.useState<undefined | VOIRange>(undefined);
    const [voiMode, setVoiMode] = React.useState<VoiModes>('DEFAULT');

    React.useEffect(() => {
        if (viewportRef.current) {
            const voiValues = voiMode === 'DEFAULT' ? defaultVOIRef.current : VoiModesValues[voiMode];
            viewportRef.current.setProperties({voiRange: voiValues});
            setVoiRange(voiValues);

            viewportRef.current.render();
        }
    }, [voiMode])

    React.useEffect(() => {
        let ignore = false;
        cornerstoneTools.addTool(LengthTool)
        cornerstoneTools.addTool(PanTool)
        cornerstoneTools.addTool(MagnifyTool)
        cornerstoneTools.addTool(RectangleROITool)
        cornerstoneTools.addTool(EllipticalROITool)
        cornerstoneTools.addTool(BidirectionalTool)
        cornerstoneTools.addTool(AngleTool)
        cornerstoneTools.addTool(PlanarFreehandROITool)
        return () => {
            if (!ignore) {
                cornerstoneTools.removeTool(LengthTool)
                cornerstoneTools.removeTool(PanTool)
                cornerstoneTools.removeTool(MagnifyTool)
                cornerstoneTools.removeTool(RectangleROITool)
                cornerstoneTools.removeTool(EllipticalROITool)
                cornerstoneTools.removeTool(BidirectionalTool)
                cornerstoneTools.removeTool(AngleTool)
                cornerstoneTools.removeTool(PlanarFreehandROITool)
                ignore = true;
            }
        }
    }, [])

    React.useEffect(() => {
        const element = imageZoneRef.current;
        const CustomWheelTool = CustomStackWheel.current
        const CustomLevelTool = CustomLevel.current
        let ignore = false;
        if (!ignore) {
            cornerstoneTools.addTool(CustomWheelTool)
            cornerstoneTools.addTool(CustomLevelTool);
            parseDicomFile(dicomFiles[0]);

            const displayDicomFile = async () => {
                if (dicomFiles && dicomFiles.length > 0) {
                    const imageIds: Array<string> = [];
                    const annotations: Array<Annotation> = [];
                    const newAnnotationsState: AnnotationsState = {}

                    dicomFiles.forEach(file => {
                        imageIds.push(cornerstoneWADOImageLoader.wadouri.fileManager.add(file))
                    })

                    if (element) {
                        await initializeCornerstone(imageIds, element)
                        if (viewportRef.current) {
                            cornerstoneTools.annotation.state.removeAllAnnotations(element)

                            if (markup) {
                                const userIds = Object.keys(markup);
                                userIds.forEach((userId) => {
                                    annotations.push(...markup[userId].markup.map(annotation => ({
                                        ...annotation,
                                        isLocked: userId !== currentUserId
                                    })));

                                    newAnnotationsState[userId] = {
                                        username: markup[userId].username,
                                        info: markup[userId].markup.map(annotation => {
                                            const imageIdx = annotation.metadata.referencedImageId?.split(":")[1];
                                            return {
                                                uuid: annotation.annotationUID || "-1",
                                                toolName: annotation.metadata.toolName,
                                                isVisible: annotation.isVisible === undefined ? false : annotation.isVisible,
                                                imageIdx: imageIdx ? Number.parseInt(imageIdx) : 0
                                            }
                                        })
                                    }

                                    if (!userIds.find((userId) => userId === currentUserId)) {
                                        newAnnotationsState[currentUserId] = {
                                            username: currentUserName,
                                            info: []
                                        }
                                    }
                                });
                            }

                            if (annotations.length > 0) {
                                annotations.forEach(annotation => {
                                    cornerstoneTools.annotation.state.addAnnotation(element, annotation)
                                });
                                setAnnotationsState(newAnnotationsState);
                            }
                        }
                    }
                }
            }
            displayDicomFile()
        }

        return () => {
            cornerstoneTools.removeTool(CustomLevelTool);
            cornerstoneTools.removeTool(CustomWheelTool);
            cornerstoneWADOImageLoader.wadouri.fileManager.purge();
            cornerstoneTools.ToolGroupManager.destroy();
            ignore = true
        }
    }, [dicomFiles, currentUserId, markup, currentUserName])

    const handleImportClick = () => {
        if (hiddenImportAnnotationInputRef.current) {
            hiddenImportAnnotationInputRef.current.click();
        }
    }

    const getActiveAnnotationsState: () => { [userId: string]: { username: string, markup: Array<Annotation> } } = () => {
        const state: { [userId: string]: { username: string, markup: Array<Annotation> } } = {};

        const userIds = Object.keys(annotationsState);

        userIds.forEach(userId => {
            state[userId] = {
                username: annotationsState[userId].username,
                markup: annotationsState[userId].info.map(annotation => cornerstoneTools.annotation.state.getAnnotation(annotation.uuid))
            }
        })

        return state
    }

    const exportAnnotationStateToJSON = () => {
        const currentAnnotationState = getActiveAnnotationsState();
        const a = document.createElement("a");
        const file = new Blob([JSON.stringify(currentAnnotationState)], {type: "application/json"});
        a.href = URL.createObjectURL(file);
        a.download = `Markup-${currentUserId}-${Date.now()}`;
        a.click();
        URL.revokeObjectURL(a.href);
        notification.open?.({
            type: 'success',
            message: t("dicom.annotations.notifications.export.title"),
            description: t("dicom.annotations.notifications.export.description"),
            key: Date.now().toString()
        })
    }

    const saveAnnotationState = async () => {
        setStateSaving(true);
        try {
            const currentAnnotationState = getActiveAnnotationsState();

            await axiosInstance.patch(`${API_ROOT}/researches/${currentResearchId}`, JSON.stringify({markup: currentAnnotationState}), {
                headers: {
                    "Content-Type": "application/json"
                }
            });

            notification.open?.({
                type: 'success',
                message: t("dicom.annotations.notifications.save.title"),
                description: t("dicom.annotations.notifications.save.description"),
                key: Date.now().toString()
            })
        } catch (err) {
            notification.open?.({
                type: 'error',
                message: t("dicom.annotations.notifications.saveError.title"),
                description: t("dicom.annotations.notifications.saveError.description"),
                key: Date.now().toString()
            })
        } finally {
            setStateSaving(false);
        }
    }

    const importAnnotationsState = (importedState: { [userId: string]: { username: string, markup: Array<Annotation> } }) => {
        if (imageZoneRef.current) {
            try {
                const newState: AnnotationsState = {};

                const element = imageZoneRef.current;
                cornerstoneTools.annotation.state.removeAllAnnotations(element);

                const userIds = Object.keys(importedState);

                userIds.forEach(userId => {
                    newState[userId] = {
                        username: importedState[userId].username,
                        info: importedState[userId].markup.map(annotation => {
                            cornerstoneTools.annotation.state.addAnnotation(element, {
                                ...annotation,
                                isLocked: userId !== currentUserId
                            })
                            //Грязный хак, мы всегда считаем, что imageId формата "dicom:{number}"
                            const imageIdx = annotation.metadata.referencedImageId?.split(":")[1];
                            return {
                                uuid: annotation.annotationUID || "",
                                toolName: annotation.metadata.toolName,
                                isVisible: annotation.isVisible === undefined ? false : annotation.isVisible,
                                imageIdx: imageIdx ? Number.parseInt(imageIdx) : 0
                            }
                        })
                    }
                });

                if (!userIds.find((userId) => userId === currentUserId)) {
                    newState[currentUserId] = {
                        username: currentUserName,
                        info: []
                    }
                }

                setAnnotationsState(newState);

                if (viewportRef.current) {
                    viewportRef.current.render();
                }

                notification.open?.({
                    type: 'success',
                    message: t("dicom.annotations.notifications.import.title"),
                    description: t("dicom.annotations.notifications.import.description"),
                    key: Date.now().toString()
                })
            } catch (e) {
                console.log(e);
                console.error('ERROR')
            }
        }
    }

    const handleAnnotationDraw = () => {
        if (imageZoneRef.current && activeTool) {
            const element = imageZoneRef.current;
            const currentAnnotationToolState = cornerstoneTools.annotation.state.getAnnotations(element, activeTool);
            if (currentAnnotationToolState) {
                const lastStateItem = currentAnnotationToolState[currentAnnotationToolState.length - 1];

                if (!annotationsState[currentUserId].info.find(annotation => annotation.uuid === lastStateItem.annotationUID)) {
                    const convertedStateItem = {
                        uuid: lastStateItem.annotationUID || "",
                        toolName: lastStateItem.metadata.toolName,
                        isVisible: true,
                        username: 'Вы',
                        imageIdx: currentImageIndex
                    }
                    setAnnotationsState({
                        ...annotationsState,
                        [currentUserId]: {
                            ...annotationsState[currentUserId],
                            info: [convertedStateItem, ...annotationsState[currentUserId].info]
                        }
                    });
                }
            }
        }
    }

    const toggleGroupAnnotationsVisibility = (userId: string, status: boolean) => {
        const annotationsUuids = annotationsState[userId].info.map(annotation => annotation.uuid);
        annotationsUuids.forEach(uuid => {
            cornerstoneTools.annotation.visibility.setAnnotationVisibility(uuid, status);
        })
        const newAnnotationsInfo = annotationsState[userId].info.map(infoObj => ({
            ...infoObj,
            isVisible: status
        }));
        setAnnotationsState({
            ...annotationsState,
            [userId]: {...annotationsState[userId], info: [...newAnnotationsInfo]}
        })
        if (viewportRef.current) {
            viewportRef.current.render();
        }
    }

    const groupAnnotationsDelete = (userId: string) => {
        const annotationsUuids = annotationsState[userId].info.map(annotation => annotation.uuid);
        annotationsUuids.forEach(uuid => {
            cornerstoneTools.annotation.state.removeAnnotation(uuid);
        })
        setAnnotationsState({...annotationsState, [userId]: {...annotationsState[userId], info: []}})
        if (viewportRef.current) {
            viewportRef.current.render();
        }
    }

    const toggleAnnotationVisibility = (uuid: string, userId: string) => {
        const annotationIndex = annotationsState[userId].info.findIndex(annotation => annotation.uuid === uuid);

        if (annotationIndex !== -1) {
            const annotationObject = annotationsState[userId].info[annotationIndex];
            const visibleStatus = annotationObject.isVisible;
            cornerstoneTools.annotation.visibility.setAnnotationVisibility(annotationObject.uuid, !visibleStatus)
            const newAnnotationStatus = {
                ...annotationObject,
                isVisible: !annotationObject.isVisible
            }
            const currentState = annotationsState[userId].info;
            currentState.splice(annotationIndex, 1, newAnnotationStatus);
            setAnnotationsState({
                ...annotationsState,
                [userId]: {...annotationsState[userId], info: [...currentState]}
            });

            if (viewportRef.current) {
                viewportRef.current.render();
            }
        }
    }

    const deleteAnnotation = (uuid: string) => {
        const annotationIndex = annotationsState[currentUserId].info.findIndex(annotation => annotation.uuid === uuid);

        if (annotationIndex !== -1) {
            cornerstoneTools.annotation.state.removeAnnotation(uuid)
            const currentState = annotationsState[currentUserId].info.filter(annotation => annotation.uuid !== uuid);
            setAnnotationsState({
                ...annotationsState,
                [currentUserId]: {...annotationsState[currentUserId], info: currentState}
            });

            if (viewportRef.current) {
                viewportRef.current.render();
            }
        }
    }

    const handleToolButton = (toolName: string) => {
        const previousTool = activeTool;
        const canvas = viewportRef.current?.getCanvas();

        if (canvas) {
            if (toolName === PlanarFreehandROITool.toolName) {
                canvas.style.cursor = 'crosshair';
            } else {
                canvas.style.cursor = '';
            }
        }

        if (previousTool === toolName) {
            setActiveTool(undefined);
            toolGroupRef.current.getToolGroup(toolGroupId)?.setToolPassive(previousTool);
        } else {
            setActiveTool(toolName);
            toolGroupRef.current.getToolGroup(toolGroupId)?.setToolActive(toolName, {
                bindings: [{
                    mouseButton: MouseBindings.Primary
                }]
            });
            if (previousTool) {
                toolGroupRef.current.getToolGroup(toolGroupId)?.setToolPassive(previousTool);
            }
        }
    }

    const getButtonType = (toolName: any) => {
        if (toolName === activeTool) {
            return 'primary'
        }
        return undefined
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

    const initializeCornerstone = async (imageIds: Array<string>, element: HTMLDivElement) => {
        toolGroupRef.current.createToolGroup(toolGroupId);
        renderingEngineRef.current = new cornerstone.RenderingEngine(renderingEngineId);

        if (toolGroupRef.current) {
            toolsNames.forEach((toolName) => {
                toolGroupRef.current.getToolGroup(toolGroupId)?.addTool(toolName);
                toolGroupRef.current.getToolGroup(toolGroupId)?.setToolPassive(toolName);
            })
            toolGroupRef.current.getToolGroup(toolGroupId)?.addTool(CustomStackWheel.current.toolName);
            toolGroupRef.current.getToolGroup(toolGroupId)?.setToolActive(CustomStackWheel.current.toolName);
        }

        const viewportInput = {
            viewportId,
            type: ViewportType.STACK,
            element
        }

        toolGroupRef.current.getToolGroup(toolGroupId)?.addViewport(viewportId, renderingEngineId)

        renderingEngineRef.current.enableElement(viewportInput);

        viewportRef.current = renderingEngineRef.current.getViewport(viewportId) as IStackViewport;

        await viewportRef.current.setStack(imageIds);

        viewportRef.current.render();

        const viewportProperties = viewportRef.current?.getProperties();
        const currentVoiRange = viewportProperties.voiRange;
        defaultVOIRef.current = currentVoiRange;
        setVoiRange(currentVoiRange);

        viewportRef.current.canvas.oncontextmenu = (event) => event.preventDefault()

        setFileLoaded(true);
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

    const handleZoomIn = () => {
        const viewport = renderingEngineRef.current?.getViewport(viewportId) as IStackViewport;

        const {parallelScale} = viewport.getCamera();
        viewport.setCamera({parallelScale: (parallelScale || 0) - 20})
        viewportRef.current?.render();
    }

    const handleZoomOut = () => {
        const viewport = renderingEngineRef.current?.getViewport(viewportId) as IStackViewport;

        const {parallelScale} = viewport.getCamera();
        viewport.setCamera({parallelScale: (parallelScale || 0) + 20})
        viewportRef.current?.render();
    }

    const handleNextImage = () => {
        if (viewportRef.current) {
            const currentImageIdIndex = viewportRef.current.getCurrentImageIdIndex();
            const numImages = viewportRef.current.getImageIds().length;

            let newImageIdIndex = currentImageIdIndex + 1;

            newImageIdIndex = Math.min(newImageIdIndex, numImages - 1);
            setCurrentImageIndex(newImageIdIndex);

            viewportRef.current.setImageIdIndex(newImageIdIndex);
        }
    }

    const handlePreviousImage = () => {
        if (viewportRef.current) {
            const currentImageIdIndex = viewportRef.current.getCurrentImageIdIndex();

            let newImageIdIndex = currentImageIdIndex - 1;

            newImageIdIndex = Math.max(newImageIdIndex, 0);
            setCurrentImageIndex(newImageIdIndex);

            viewportRef.current.setImageIdIndex(newImageIdIndex);
        }
    }

    const handleRotate = () => {
        const viewport = renderingEngineRef.current?.getViewport(viewportId) as IStackViewport;

        const {rotation} = viewport.getProperties();
        let currentRotation = rotation || 0;
        if (currentRotation === 360) {
            currentRotation = 0;
        }
        const newRotation = (currentRotation) + 90;
        viewport.setProperties({rotation: newRotation})
        viewportRef.current?.render();
    }

    const handleModeChange = (value: string) => {
        const mode = value as VoiModes;
        setVoiMode(mode);
    }

    return (
        <div className={styles.mainContainer}>
            <div className={styles.leftSidePanel} style={{position: 'relative'}}>
                <div className={styles.dicomInfoBlock}>
                    <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between'}}>
                        <h3>{t("dicom.info.title")}</h3>
                        <h3>{currentImageIndex + 1}/{dicomFiles.length}</h3>
                    </div>
                    <ul className={styles.dicomInfoList}>
                        {Object.keys(dicomInfo || {}).map((info, index) => <li
                            className={styles.dicomInfoListItem}
                            key={index}>
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
                    <AnnotationsList
                        currentUserId={currentUserId}
                        annotations={annotationsState}
                        handleVisibility={toggleAnnotationVisibility}
                        handleDelete={deleteAnnotation}
                        handleGroupVisibility={toggleGroupAnnotationsVisibility}
                        handleGroupDelete={groupAnnotationsDelete}
                    />
                </div>
                <div style={{
                    position: 'absolute',
                    top: 0,
                    left: '100%',
                    zIndex: 99,
                    display: 'flex',
                    flexDirection: 'column',
                    padding: '8px',
                    backgroundColor: '#D9D9D9'
                }}>
                    <h4>Режим просмотра</h4>
                    <Select
                        defaultValue={'DEFAULT'}
                        style={{width: 160}}
                        options={VoiModesLabels.map(voiMode => ({
                            value: voiMode,
                            label: t(`dicom.voiModes.${voiMode}`)
                        }))}
                        onChange={handleModeChange}
                    />
                </div>
            </div>
            <div
                onMouseUp={handleAnnotationDraw}
                ref={imageZoneRef} className={styles.imageContainer}>
                {voiRange &&
                    <div style={{
                        position: 'absolute',
                        bottom: 0,
                        left: 0,
                        color: 'white',
                        fontWeight: 'bold',
                        padding: '4px'
                    }}>WW {voiRange.upper.toFixed(3)} / WL {voiRange.lower.toFixed(3)}</div>}
            </div>
            <div className={styles.rightSidePanel}>
                <div style={{display: 'flex', flexWrap: 'wrap', justifyContent: "space-around"}}>
                    {toolsNames.filter(toolName => toolName !== StackScrollMouseWheelTool.toolName).map(toolName =>
                        <Tooltip
                            style={{flexBasis: '50%'}}
                            key={toolName}
                            placement="left"
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
                                disabled={!fileLoaded || isStateSaving}
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
                            disabled={!fileLoaded || isStateSaving}
                            size="large"
                            onClick={handleRotate}
                            icon={<Icons.RotateRightOutlined/>}
                        />
                    </Tooltip>
                </div>
                <div style={{display: 'flex', justifyContent: 'space-around', marginTop: '36px'}}>
                    <div style={{display: 'flex', justifyContent: 'space-around', flexDirection: 'column'}}>
                        <Tooltip
                            placement="left"
                            color="green"
                            title={t("dicom.annotations.tool.ZoomIn")}
                        >
                            <Button
                                disabled={!fileLoaded || isStateSaving}
                                size="large"
                                onClick={handleZoomIn}
                                icon={<Icons.ZoomInOutlined/>}
                            />
                        </Tooltip>
                        <Tooltip
                            placement="left"
                            color="green"
                            title={t("dicom.annotations.tool.ZoomOut")}
                        >
                            <Button
                                style={{marginTop: '8px'}}
                                disabled={!fileLoaded || isStateSaving}
                                size="large"
                                onClick={handleZoomOut}
                                icon={<Icons.ZoomOutOutlined/>}
                            />
                        </Tooltip>
                    </div>
                    <div style={{display: 'flex', justifyContent: 'space-around', flexDirection: 'column'}}>
                        <Tooltip
                            placement="left"
                            color="green"
                            title={t("dicom.annotations.tool.NextImage")}
                        >
                            <Button
                                disabled={!fileLoaded || isStateSaving || currentImageIndex >= dicomFiles.length - 1}
                                size="large"
                                onClick={handleNextImage}
                                icon={<Icons.CaretUpOutlined/>}
                            />
                        </Tooltip>
                        <Tooltip
                            placement="left"
                            color="green"
                            title={t("dicom.annotations.tool.PreviousImage")}
                        >
                            <Button
                                style={{marginTop: '8px'}}
                                disabled={!fileLoaded || isStateSaving || currentImageIndex === 0}
                                size="large"
                                onClick={handlePreviousImage}
                                icon={<Icons.CaretDownOutlined/>}
                            />
                        </Tooltip>
                    </div>
                </div>
                <div style={{marginTop: 'auto', display: 'flex', justifyContent: 'space-around'}}>
                    <Tooltip
                        placement="left"
                        color="green"
                        title={t("dicom.annotations.tool.Export")}
                    >
                        <Button style={{marginBottom: '8px'}} disabled={!fileLoaded || isStateSaving} size="large"
                                icon={<Icons.ExportOutlined/>}
                                onClick={exportAnnotationStateToJSON}/>
                    </Tooltip>
                    <Tooltip
                        placement="left"
                        color="green"
                        title={t("dicom.annotations.tool.Save")}
                    >
                        <Button disabled={!fileLoaded || isStateSaving} size="large"
                                icon={isStateSaving ? <Spin/> : <Icons.SaveOutlined/>}
                                onClick={saveAnnotationState}/>
                    </Tooltip>
                </div>
            </div>
        </div>
    );
}

export default DicomViewer;