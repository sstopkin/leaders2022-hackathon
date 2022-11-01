import React from "react";
import {Authenticated, Refine} from "@pankod/refine-core";
import {
    notificationProvider,
    ReadyPage,
    ErrorComponent,
    Icons,
} from "@pankod/refine-antd";
import "@pankod/refine-antd/dist/styles.min.css";
import routerProvider from "@pankod/refine-react-router-v6";
import dataProvider from "@pankod/refine-nestjsx-crud";
import {authProvider} from "./authProvider";
import {UsersList, UsersCreate, UsersEdit, UsersShow} from "pages/users";
import {ResearchesCreate, ResearchesEdit, ResearchesList, ResearchesShow} from "./pages/researches";
import {DicomsCreate, DicomsShow} from "pages/dicom";
import {
    Title,
    Header,
    Sider,
    Footer,
    Layout,
    OffLayoutArea,
} from "components/layout";
import {useTranslation} from "react-i18next";
import {Login} from "pages/login";
import * as constants from "./constants";
import initCornerstone from "./utils";
import axiosInstance from "./setup";

function App() {
    const {t, i18n} = useTranslation();

    const i18nProvider = {
        translate: (key: string, params: object) => t(key, params),
        changeLocale: (lang: string) => i18n.changeLanguage(lang),
        getLocale: () => i18n.language,
    };

    React.useEffect(() => {
        initCornerstone();
    }, [])

    return (
        <Refine
            options={{
                disableTelemetry: true,
                warnWhenUnsavedChanges: true
            }}
            notificationProvider={notificationProvider}
            ReadyPage={ReadyPage}
            catchAll={<ErrorComponent/>}
            routerProvider={{
                ...routerProvider,
                routes: [
                    {
                        element: <Authenticated><DicomsCreate/></Authenticated>,
                        path: "/dicom/create",
                        layout: true,
                    }, {
                        element: <Authenticated><DicomsShow/></Authenticated>,
                        path: "/dicom/show",
                        layout: true,
                    },
                ],
            }}
            dataProvider={dataProvider(`${constants.API_ROOT}`, axiosInstance)}
            authProvider={authProvider}
            accessControlProvider={{
                can: async ({resource, action}) => {
                    let can = true;

                    const profile = localStorage.getItem("profile");
                    if (!profile) {
                        throw new Error("Error getting profile from local storage!");
                    }
                    const role = JSON.parse(profile).role;

                    if (role !== "admin") {
                        if (resource === "users") {
                            //action === "list"
                            can = false;
                        }
                    }

                    return Promise.resolve({can});
                },
            }}
            LoginPage={Login}
            // DashboardPage={DashboardPage}
            resources={[
                {
                    name: 'researches',
                    icon: <Icons.SnippetsOutlined/>,
                    list: ResearchesList,
                    show: ResearchesShow,
                    create: ResearchesCreate,
                    edit: ResearchesEdit
                },
                {
                    name: "users",
                    icon: <Icons.UserOutlined/>,
                    list: UsersList,
                    create: UsersCreate,
                    edit: UsersEdit,
                    show: UsersShow,
                },
            ]}
            Title={Title}
            Header={Header}
            Sider={Sider}
            Footer={Footer}
            Layout={Layout}
            OffLayoutArea={OffLayoutArea}
            i18nProvider={i18nProvider}
        />
    );
}

export default App;
