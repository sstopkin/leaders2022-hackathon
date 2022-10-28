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
import {ResearchesCreate, ResearchesEdit, ResearchesList, ResearchesShow} from "./pages/researches/";
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
import axios, {AxiosRequestConfig} from "axios";
import * as constants from "./constants";

const axiosInstance: any = axios.create();

axiosInstance.interceptors.request.use(
    // Here we can perform any function we'd like on the request
    (request: AxiosRequestConfig) => {
        // Retrieve the token from local storage
        const token = localStorage.getItem(constants.ACCESS_TOKEN_KEY);
        // Check if the header property exists
        if (request.headers) {
            // Set the Authorization header if it exists
            request.headers["Authorization"] = `Bearer ${token}`;
        } else {
            // Create the headers property if it does not exist
            request.headers = {
                Authorization: `Bearer ${token}`,
            };
        }

        return request;
    }
);

const AuthenticatedCustomPage = () => {
    return <Authenticated>{/* <ImagesGallery /> */}</Authenticated>;
};

function App() {
    const {t, i18n} = useTranslation();

    const i18nProvider = {
        translate: (key: string, params: object) => t(key, params),
        changeLocale: (lang: string) => i18n.changeLanguage(lang),
        getLocale: () => i18n.language,
    };

    return (
        <Refine
            notificationProvider={notificationProvider}
            ReadyPage={ReadyPage}
            catchAll={<ErrorComponent/>}
            warnWhenUnsavedChanges
            routerProvider={{
                ...routerProvider,
                routes: [
                    {
                        element: <AuthenticatedCustomPage/>,
                        path: "/gallery",
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
                    name: "users",
                    icon: <Icons.UserOutlined/>,
                    list: UsersList,
                    create: UsersCreate,
                    edit: UsersEdit,
                    show: UsersShow,
                },
                {
                    name: 'researches',
                    icon: <Icons.SnippetsOutlined/>,
                    list: ResearchesList,
                    show: ResearchesShow,
                    create: ResearchesCreate,
                    edit: ResearchesEdit
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
