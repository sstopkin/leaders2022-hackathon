import React, {useState} from "react";

import {
    useTranslate,
    useLogout,
    CanAccess,
    ITreeMenu,
    useRouterContext,
    useMenu
} from "@pankod/refine-core";
import {AntdLayout, Menu, Grid, Icons} from "@pankod/refine-antd";
import {antLayoutSider, antLayoutSiderMobile} from "./styles";

const {UnorderedListOutlined, LogoutOutlined} = Icons;

export const Sider: React.FC = () => {
    const [collapsed, setCollapsed] = useState<boolean>(false);

    const {mutate: logout} = useLogout();

    const {Link} = useRouterContext();
    const {SubMenu} = Menu;

    const translate = useTranslate();
    const {menuItems, selectedKey, defaultOpenKeys} = useMenu();
    const breakpoint = Grid.useBreakpoint();

    const isMobile = !breakpoint.lg;

    const renderTreeView = (tree: ITreeMenu[], selectedKey: string) => {
        return tree.map((item: ITreeMenu) => {
            const {icon, label, route, name, children, parentName} = item;

            if (children.length > 0) {
                return (
                    <SubMenu
                        key={name}
                        icon={icon ?? <UnorderedListOutlined/>}
                        title={label}
                    >
                        {renderTreeView(children, selectedKey)}
                    </SubMenu>
                );
            }
            const isSelected = route === selectedKey;
            const isRoute = !(parentName !== undefined && children.length === 0);
            return (
                <CanAccess key={route} resource={name.toLowerCase()} action="list">
                    <Menu.Item
                        key={selectedKey}
                        style={{
                            fontWeight: isSelected ? "bold" : "normal",
                        }}
                        icon={icon ?? (isRoute && <UnorderedListOutlined/>)}
                    >
                        <Link to={route}>{label}</Link>
                        {!collapsed && isSelected && (
                            <div className="ant-menu-tree-arrow"/>
                        )}
                    </Menu.Item>
                </CanAccess>
            );
        });
    };

    return (
        <AntdLayout.Sider
            collapsible
            collapsed={collapsed}
            onCollapse={(collapsed: boolean): void => setCollapsed(collapsed)}
            collapsedWidth={isMobile ? 0 : 80}
            breakpoint="lg"
            style={isMobile ? antLayoutSiderMobile : antLayoutSider}
        >
            <Menu
                selectedKeys={[selectedKey]}
                defaultOpenKeys={defaultOpenKeys}
                mode="inline"
                onClick={() => {
                    if (!breakpoint.lg) {
                        setCollapsed(true);
                    }
                }}
            >
                {renderTreeView(menuItems, selectedKey)}

                <Menu.Item
                    key="logout"
                    onClick={() => logout()}
                    icon={<LogoutOutlined/>}
                >
                    {translate("buttons.logout", "Logout")}
                </Menu.Item>
            </Menu>
        </AntdLayout.Sider>
    );
};
