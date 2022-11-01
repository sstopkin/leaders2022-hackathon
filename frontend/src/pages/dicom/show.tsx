import {
    IResourceComponentsProps, useNavigation, useShow,
} from "@pankod/refine-core";
import DicomViewer from "../../components/DicomViewer";
import {IDicom} from "../../interfaces";
import {useLocation} from "react-router-dom";

export const DicomsShow: React.FC<IResourceComponentsProps> = (props) => {
    const location = useLocation();

    return <DicomViewer/>
}