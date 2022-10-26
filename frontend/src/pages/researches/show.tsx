import {IResourceComponentsProps, usePermissions, useShow, useTranslate,} from "@pankod/refine-core";
import {Button, Typography} from "@pankod/refine-antd";
import {IResearch} from "interfaces";
import React from "react";
import {Circle, Layer, Line, Stage, Text} from "react-konva";
import Konva from "konva";
import KonvaEventObject = Konva.KonvaEventObject;

const {Title} = Typography;

type PointsGroup = Array<Array<{ x: number, y: number }>>;

type Modes = 'POLYGON' | 'BRUSH' | 'RULER' | 'EDIT'

const MODES: Array<Modes> = ['POLYGON', 'BRUSH', 'RULER', 'EDIT'];

export const ResearchesShow: React.FC<IResourceComponentsProps> = () => {
    const containerRef = React.useRef<null | HTMLDivElement>(null);
    const isDrawing = React.useRef<boolean>(false);
    const isRuler = React.useRef<boolean>(false);
    const t = useTranslate();

    const [pointsGroup, setPointsGroup] = React.useState<PointsGroup>([[]]);
    const [drawLines, setDrawLines] = React.useState<Array<{ points: Array<number> }>>([]);
    const [rulerLines, setRulerLines] = React.useState<Array<{ points: Array<number> }>>([])
    const [activePointsGroupIndex, setActivePointsGroupIndex] = React.useState<number>(0);
    const [selectedMode, setSelectedMode] = React.useState<Modes | undefined>(undefined);

    const {queryResult} = useShow<IResearch>();
    const {data, isLoading} = queryResult;
    const record = data?.data;

    const {data: permissionsData} = usePermissions();

    const containerSize: { width: number, height: number } = React.useMemo(() => {
        if (containerRef.current) {
            return {width: containerRef.current?.clientWidth, height: containerRef.current?.clientHeight}
        }
        return {width: 0, height: 0}
    }, [containerRef.current]);

    const currentCursorType = () => {
        switch (selectedMode) {
            case "POLYGON":
            case "EDIT":
                return 'pointer';
            case "RULER":
            case "BRUSH":
            default:
                return "crosshair"
        }
    }

    const renderPanelButtons = () => {
        return MODES.map((mode) => <Button
            onClick={() => setSelectedMode(mode)}
            style={{marginRight: '8px'}}
            type={selectedMode === mode ? "primary" : "default"}>
            {mode}
        </Button>)
    }

    const createNewPointsGroup = () => {
        const currentPointsGroup = pointsGroup[activePointsGroupIndex];
        const firstPoint = currentPointsGroup[0];
        currentPointsGroup.push(firstPoint);
        const newPointsGroup = pointsGroup;
        newPointsGroup[activePointsGroupIndex] = currentPointsGroup;

        setPointsGroup([...newPointsGroup, []]);
        setActivePointsGroupIndex((prevIndex) => prevIndex + 1);
    }

    const createPoint = (event: KonvaEventObject<MouseEvent>) => {
        const stage = event.target.getStage();
        if (stage) {
            const newPointsGroup = pointsGroup;
            const pointerPosition = stage?.getRelativePointerPosition();
            const {x, y} = pointerPosition;
            const newPolygon = newPointsGroup[activePointsGroupIndex];
            newPolygon.push({x, y});
            newPointsGroup[activePointsGroupIndex] = newPolygon;
            setPointsGroup([...newPointsGroup]);
        } else {
            return
        }
    }

    const calculateLineWidth = (startPoint: { x: number, y: number }, endPoint: { x: number, y: number }) => {
        const distance = Math.sqrt(Math.pow((endPoint.x - startPoint.x), 2) + Math.pow((endPoint.y - startPoint.y), 2));
        return `${distance.toFixed(0)} px`
    }

    const drawLine = (event: KonvaEventObject<MouseEvent>) => {
        const stage = event.target.getStage();
        if (stage) {
            const point = stage.getRelativePointerPosition();
            const lastLine = drawLines[drawLines.length - 1];
            lastLine.points = lastLine.points.concat([point.x, point.y]);

            drawLines.splice(drawLines.length - 1, 1, lastLine);
            setDrawLines(drawLines.concat());
        }
    }

    const drawRuler = (event: KonvaEventObject<MouseEvent>) => {
        const stage = event.target.getStage();
        if (stage) {
            const point = stage.getRelativePointerPosition();
            const lastRuler = rulerLines[rulerLines.length - 1];
            if (lastRuler.points.length < 4) {
                lastRuler.points.push(point.x);
                lastRuler.points.push(point.y);
            } else {
                lastRuler.points[2] = point.x;
                lastRuler.points[3] = point.y
            }
            rulerLines.splice(rulerLines.length - 1, 1, lastRuler)
            setRulerLines(rulerLines.concat());
        }
    }

    const handleMouseMove = (event: KonvaEventObject<MouseEvent>) => {
        if (selectedMode === "BRUSH") {
            if (isDrawing.current) {
                drawLine(event)
            }
        }
        if (selectedMode === 'RULER') {
            if (isRuler.current) {
                drawRuler(event)
            }
        }
    }

    const handleMouseUp = (event: KonvaEventObject<MouseEvent>) => {
        isDrawing.current = false;
        isRuler.current = false
    }

    const handleMouseDown = (event: KonvaEventObject<MouseEvent>) => {
        const numberOfClicks = event.evt.detail;
        if (selectedMode === 'POLYGON') {
            createPoint(event);
            if (numberOfClicks === 2) {
                createNewPointsGroup()
            }
        }
        if (selectedMode === 'BRUSH') {
            isDrawing.current = true;
            const pos = event.target.getStage()?.getRelativePointerPosition();
            if (pos) {
                setDrawLines([...drawLines, {points: [pos.x, pos.y]}])
            }
        }
        if (selectedMode === 'RULER') {
            isRuler.current = true;
            const pos = event.target.getStage()?.getRelativePointerPosition();
            if (pos) {
                setRulerLines([...rulerLines, {points: [pos.x, pos.y]}])
            }
        }
    }

    const renderLine = (psG: PointsGroup) => {
        return psG.map((pG, idx) => {
            const linePoints: Array<number> = [];
            pG.forEach(p => {
                linePoints.push(p.x);
                linePoints.push(p.y);
            });
            const points = pG.map((p, idx) => <Circle key={idx} radius={3} x={p.x}
                                                      y={p.y} fill="none"
                                                      stroke="green"/>);
            return <><Line lineCap="round"
                           lineJoin="round" stroke="green" fill="green" points={linePoints}/>
                {idx === activePointsGroupIndex ? points : null}</>
        })
    }

    return (
        <div style={{height: '100%', display: 'flex', flexDirection: 'column', backgroundColor: 'white'}}>
            <div style={{padding: '12px'}}>
                {renderPanelButtons()}
            </div>
            <div ref={containerRef} style={{flexGrow: 1}}>
                <Stage onMouseDown={handleMouseDown} onMouseUp={handleMouseUp} onMouseMove={handleMouseMove}
                       width={containerSize.width}
                       height={containerSize.height}
                       style={{cursor: currentCursorType(), backgroundColor: 'black'}}>
                    <Layer>
                        {renderLine(pointsGroup)}
                        {drawLines.map((line, i) => (
                            <Line key={i} points={line.points} stroke="green" strokeWidth={2} tension={0.5}
                                  lineCap="round"
                                  lineJoin="round"/>))}
                        {rulerLines.map((line, i) => {
                            const firstPoint = {x: line.points[0], y: line.points[1]};
                            const lastPoint = {
                                x: line.points[line.points.length - 2],
                                y: line.points[line.points.length - 1]
                            };
                            return <><Circle key={`start-ruler-${i}`} radius={2} x={firstPoint.x}
                                             y={firstPoint.y} fill="none"
                                             stroke="red"/>
                                <Line key={i} points={line.points} stroke="red" strokeWidth={2}
                                      tension={0.5}
                                      lineCap="round"
                                      lineJoin="round"/>
                                <Circle key={`end-ruler-${i}`} radius={2}
                                        x={lastPoint.x}
                                        y={lastPoint.y}
                                        fill="none"
                                        stroke="red"/><Text x={lastPoint.x + 10}
                                                            y={lastPoint.y - 10}
                                                            fill="red"
                                                            textBaseline='bottom'
                                                            fontSize={12}
                                                            text={calculateLineWidth(firstPoint, lastPoint)}
                                                            align='center'/></>
                        })}
                    </Layer>
                </Stage>
            </div>
        </div>
    );
};