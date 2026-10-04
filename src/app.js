import React, { useState } from 'react';
import {
    Breadcrumb, Layout, Menu, theme, ConfigProvider, App
} from 'antd';
import Dashboard from './components/admin-components/dashboard';
import Blocks from './components/admin-components/blocks';
import Templates from './components/admin-components/templates';
import ThemeBuilder from './components/admin-components/theme-builder';
import Settings from './components/admin-components/settings';
import { DashboardOutlined, SettingOutlined, BlockOutlined, PicRightOutlined, LayoutOutlined } from '@ant-design/icons';
import { icons } from 'antd/es/image/PreviewGroup';
import './editor';


const { Header, Content, Footer, Sider } = Layout;

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
        key: 'templates',
        label: 'Custom Templates',
        icon: <PicRightOutlined />
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


export default function ShapeBlockApp({ initialTab } = {}) {

    const {
        token: { colorBgContainer, borderRadiusLG },
    } = theme.useToken();

    // Tab resolution priority: the submenu page's data-initial-tab, then the URL
    // hash (e.g. #theme-builder used when returning from the block editor), then Blocks.
    const validKeys = ['blocks', 'templates', 'theme-builder', 'settings'];
    const hashKey = window.location.hash.replace('#', '');
    const initialKey = validKeys.includes(initialTab)
        ? initialTab
        : (validKeys.includes(hashKey) ? hashKey : 'blocks');

    const [current, setCurrent] = useState(initialKey);
    const [collapsed, setCollapsed] = useState(false);

    // Tab => admin submenu page slug (mirrors Main::get_admin_pages()).
    const tabPages = {
        'blocks': 'shapeblock',
        'theme-builder': 'shapeblock-theme-builder',
        'templates': 'shapeblock-templates',
        'settings': 'shapeblock-settings',
    };

    const changeMenu = (e) => {
        setCurrent(e.key);
        const page = tabPages[e.key];
        if (!page) {
            return;
        }

        // Point the URL at the tab's own submenu page so a reload or a copied
        // link opens the same tab.
        if (window.history && window.history.replaceState) {
            window.history.replaceState(null, '', `admin.php?page=${page}`);
        }

        // Move the WordPress sidebar highlight to the matching submenu item.
        const submenu = document.querySelector('#toplevel_page_shapeblock .wp-submenu');
        if (submenu) {
            submenu.querySelectorAll('li.current, a.current').forEach((el) => el.classList.remove('current'));
            const link = submenu.querySelector(`a[href="admin.php?page=${page}"]`);
            if (link) {
                link.classList.add('current');
                link.setAttribute('aria-current', 'page');
                link.closest('li').classList.add('current');
            }
            submenu.querySelectorAll('a[aria-current]').forEach((el) => {
                if (el !== link) el.removeAttribute('aria-current');
            });
        }
    }

    return (

        <ConfigProvider theme={{ token: ThemeData }}>
            <App>
                <Layout style={{ minHeight: '100vh' }}>
                    <Sider theme="light" collapsible collapsed={collapsed} onCollapse={value => setCollapsed(value)}>
                        <div className="shapeblock-logo">
                            <img src={shapeblock.shapeblockUrl + 'assets/images/icons/shapeblock-logo.png'} alt="shapeblock-logo" />
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
                                {current === 'templates' && <Templates />}
                                {current === 'theme-builder' && <ThemeBuilder />}
                                {current === 'settings' && <Settings />}

                            </div>
                        </Content>
                        <Footer style={{ textAlign: 'center' }}>
                            ShapeBlock ©{new Date().getFullYear()}
                        </Footer>
                    </Layout>
                </Layout>
            </App >
        </ConfigProvider>

    );
}