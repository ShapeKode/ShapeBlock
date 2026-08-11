import React, { useState } from 'react';
import {
    Breadcrumb, Layout, Menu, theme, ConfigProvider, App
} from 'antd';
import Dashboard from './components/admin-components/dashboard';
import Blocks from './components/admin-components/blocks';
import Templates from './components/admin-components/templates';
import ThemeBuilder from './components/admin-components/theme-builder';
import Settings from './components/admin-components/settings';
import { DashboardOutlined, SettingOutlined, BlockOutlined, PicRightOutlined, KeyOutlined, LayoutOutlined } from '@ant-design/icons';
import { icons } from 'antd/es/image/PreviewGroup';
import './editor';


const { Header, Content, Footer, Sider } = Layout;

const isProInstalled = typeof eelfg !== 'undefined' && !!eelfg.isProInstalled;

const items = [
    {
        key: 'blocks',
        label: 'Blocks Settings',
        icon: <BlockOutlined />
    },
    {
        key: 'theme-builder',
        label: 'Theme Builder',
        icon: <LayoutOutlined />
    },
    {
        key: 'settings',
        label: 'Settings',
        icon: <SettingOutlined />
    }
]

const ThemeData = {
    borderRadius: 2,
    colorPrimary: '#a216ffff',
    Button: {
        colorPrimary: '#a216ffff',
        algorithm: true,
    }
};


export default function EasyElementsForGutenbergApp({ initialTab } = {}) {

    const {
        token: { colorBgContainer, borderRadiusLG },
    } = theme.useToken();

    // Tab resolution priority: the submenu page's data-initial-tab, then the URL
    // hash (e.g. #theme-builder used when returning from the block editor), then Blocks.
    const validKeys = ['blocks', 'theme-builder', 'settings'];
    const hashKey = window.location.hash.replace('#', '');
    const initialKey = validKeys.includes(initialTab)
        ? initialTab
        : (validKeys.includes(hashKey) ? hashKey : 'blocks');

    const [current, setCurrent] = useState(initialKey);
    const [collapsed, setCollapsed] = useState(false);

    const changeMenu = (e) => {
        setCurrent(e.key);
        if (window.history && window.history.replaceState) {
            window.history.replaceState(null, '', `#${e.key}`);
        }
    }

    return (

        <ConfigProvider theme={{ token: ThemeData }}>
            <App>
                <Layout style={{ minHeight: '100vh' }}>
                    <Sider theme="light" collapsible collapsed={collapsed} onCollapse={value => setCollapsed(value)}>
                        <div className="eelfg-logo">
                            <img src={eelfg.eelfgUrl + 'assets/images/icons/plugin-icon-200_200.png'} alt="eelfg-logo" />
                        </div>
                        <Menu
                            theme="light"
                            mode="inline"
                            selectedKeys={[current]}
                            items={items}
                            onClick={changeMenu}
                        />
                    </Sider>
                    <Layout>
                        {/* <Header style={{ padding: 0, background: colorBgContainer }} /> */}
                        <Content style={{ margin: '0 16px' }}>
                            <div
                                style={{
                                    background: colorBgContainer,
                                    minHeight: 280,
                                    padding: 24,
                                    margin: '16px 0',
                                    borderRadius: borderRadiusLG,
                                }}
                            >

                                {current === 'blocks' && <Blocks />}
                                {current === 'theme-builder' && <ThemeBuilder />}
                                {current === 'settings' && <Settings />}

                            </div>
                        </Content>
                        <Footer style={{ textAlign: 'center' }}>
                            Easy Element for Gutenberg ©{new Date().getFullYear()} Created by Themewant
                        </Footer>
                    </Layout>
                </Layout>
            </App >
        </ConfigProvider>

    );
}