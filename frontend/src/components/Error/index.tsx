import React from "react";
import {Button, Result} from "@pankod/refine-antd";
import {useNavigation} from "@pankod/refine-core";

interface ErrorProps {
    textError?: string
}

const Error: React.FC<ErrorProps> = ({textError}) => {
    const navigation = useNavigation();

    return <Result status="error" title="Загрузка не удалась"
                   extra={<Button type="primary"
                                  onClick={navigation.goBack}>Назад</Button>}>{textError ? textError : "Что-то пошло не так :("}</Result>
}

export default Error;