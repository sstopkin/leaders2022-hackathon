import React from "react";
import {Button, Icons, Tooltip} from "@pankod/refine-antd";
import styles from "./AnnotationsList.module.css";
import {useTranslate} from "@pankod/refine-core";

interface AnnotationsListProps {
    currentUserId: string,
    annotations: {
        [userId: string]: {
            username: string
            info: Array<{
                uuid: string,
                toolName: string,
                isVisible: boolean,
                imageIdx: number
            }>
        }
    },
    handleVisibility: (annotationId: string, userId: string) => void,
    handleDelete: (annotationId: string) => void,
    handleGroupVisibility: (userId: string, status: boolean) => void,
    handleGroupDelete: (userId: string) => void,
}

const AnnotationsSubList: React.FC<{
    userId: string,
    username: string,
    data: Array<{ uuid: string, toolName: string, isVisible: boolean, imageIdx: number }>,
    handleVisibility: (annotationId: string, userId: string) => void,
    handleDelete: (annotationId: string) => void,
    handleGroupVisibility: (userId: string, status: boolean) => void,
    handleGroupDelete: (userId: string) => void,
    currentUserId: string
}> = ({
          userId,
          username,
          data,
          currentUserId,
          handleDelete,
          handleVisibility,
          handleGroupDelete,
          handleGroupVisibility
      }) => {
    const t = useTranslate();
    const [collapsed, setCollapsed] = React.useState(userId !== currentUserId);

    const toggleCollapsed = () => setCollapsed((prevState) => !prevState);

    const visibleStatus = data.every(annotation => annotation.isVisible);

    return <li>
        <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingBottom: '4px',
            marginBottom: '8px',
            borderBottom: '1px solid gray'
        }}>
            <span
                style={{fontWeight: 'bold'}}>{`(${data.length}) `}{userId === currentUserId ? 'Ваши аннотации' : username}</span>
            <div className={styles.listTitleButtonsContainer}>
                {data.length > 0 &&
                    <Button onClick={() => handleGroupVisibility(userId, !visibleStatus)}
                            type="primary"
                            size="small"
                            icon={visibleStatus ? <Icons.EyeOutlined/> : <Icons.EyeInvisibleOutlined/>}/>
                }
                {data.length > 0 && currentUserId === userId &&
                    <Button onClick={() => handleGroupDelete(currentUserId)} type="primary" danger size="small"
                            icon={<Icons.DeleteOutlined/>}/>}
                <Button size="small" onClick={toggleCollapsed}
                        icon={collapsed ? <Icons.CaretUpFilled/> : <Icons.CaretDownFilled/>}/>
            </div>
        </div>
        {!collapsed && <ul style={{margin: 0, padding: 0}}>{
            data.map((annotation) => (
                <li
                    key={annotation.uuid}
                    className={styles.listItem}>
                    <div>
                        <span
                            style={{fontSize: '0.8rem'}}>{`[${annotation.imageIdx + 1}] `}{t(`dicom.annotations.tool.${annotation.toolName}`)}</span>
                    </div>
                    <div>
                        <Tooltip
                            placement="top"
                            color="green"
                            title={annotation.isVisible ? t("dicom.annotations.tool.Hide") : t("dicom.annotations.tool.Show")}
                        >
                            <Button
                                size="small"
                                style={{marginRight: '8px'}}
                                type="default"
                                icon={annotation.isVisible ? <Icons.EyeOutlined/> :
                                    <Icons.EyeInvisibleOutlined/>}
                                onClick={() => handleVisibility(annotation.uuid, userId)}
                            />
                        </Tooltip>
                        {userId === currentUserId && <Tooltip
                            placement="top"
                            color="green"
                            title={t("dicom.annotations.tool.Delete")}
                        >
                            <Button
                                size="small"
                                type="default"
                                icon={<Icons.CloseOutlined/>}
                                danger
                                onClick={() => handleDelete(annotation.uuid)}
                            />
                        </Tooltip>}
                    </div>
                </li>
            ))
        }</ul>}
    </li>
}

const AnnotationsList: React.FC<AnnotationsListProps> = ({
                                                             annotations,
                                                             currentUserId,
                                                             handleDelete,
                                                             handleVisibility,
                                                             handleGroupDelete,
                                                             handleGroupVisibility
                                                         }) => (
    <ul className={styles.list}>
        {Object.keys(annotations).sort((x, y) => x === currentUserId ? -1 : y === currentUserId ? 1 : 0).map((userId) => {
            const data = annotations[userId];
            return <AnnotationsSubList
                key={userId}
                currentUserId={currentUserId}
                userId={userId}
                username={data.username}
                data={data.info}
                handleVisibility={handleVisibility}
                handleDelete={handleDelete}
                handleGroupDelete={handleGroupDelete}
                handleGroupVisibility={handleGroupVisibility}
            />
        })}
    </ul>
)


export default AnnotationsList;