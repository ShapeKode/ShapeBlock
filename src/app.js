import React, { useState } from 'react';
import { __ } from '@wordpress/i18n';
import {
    Layout, Menu, theme, ConfigProvider, App, Grid
} from 'antd';
import Blocks from './components/admin-components/blocks';
import Templates from './components/admin-components/templates';
import ThemeBuilder from './components/admin-components/theme-builder';
import Settings from './components/admin-components/settings';
import ExportImport from './components/admin-components/export-import';
import AddonTab from './components/admin-components/addon-tab';
import { SettingOutlined, BlockOutlined, PicRightOutlined, LayoutOutlined, SwapOutlined, AppstoreAddOutlined } from '@ant-design/icons';


const { Content, Footer, Sider } = Layout;

// Pages added by add-ons (shapeblock_admin_pages filter): { tab, label, page }.
const addonPages = (typeof shapeblock !== 'undefined' && Array.isArray(shapeblock.addonPages)) ? shapeblock.addonPages : [];

const getMenuItems = () => [
    {
        key: 'settings',
        label: __( 'General', 'shapeblock' ),
        icon: <SettingOutlined />
    },
    {
        key: 'blocks',
        label: __( 'Blocks', 'shapeblock' ),
        icon: <BlockOutlined />
    },
    {
        key: 'theme-builder',
        label: __( 'Theme Builder', 'shapeblock' ),
        icon: <LayoutOutlined />
    },
    {
        key: 'templates',
        label: __( 'Custom Templates', 'shapeblock' ),
        icon: <PicRightOutlined />
    },
    // Add-on pages, then Export & Import last (the same order as the submenu).
    ...addonPages.map((p) => ({ key: p.tab, label: p.label, icon: <AppstoreAddOutlined /> })),
    {
        key: 'export-import',
        label: __( 'Export & Import', 'shapeblock' ),
        icon: <SwapOutlined />
    },
];

const ThemeData = {
    borderRadius: 2,
    colorPrimary: '#a216ffff',
    // No glow around a focused field; its border colour shows the focus.
    controlOutlineWidth: 0,
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
    // hash (e.g. #theme-builder used when returning from the block editor), then General.
    const validKeys = ['blocks', 'templates', 'theme-builder', 'settings', 'export-import', ...addonPages.map((p) => p.tab)];
    const hashKey = window.location.hash.replace('#', '');
    const initialKey = validKeys.includes(initialTab)
        ? initialTab
        : (validKeys.includes(hashKey) ? hashKey : 'settings');

    const [current, setCurrent] = useState(initialKey);
    const [collapsed, setCollapsed] = useState(false);
    // Phones and small tablets: a narrow menu and tighter spacing, so the page keeps its width.
    const wide = Grid.useBreakpoint().md !== false;

    // Tab => admin submenu page slug (mirrors Main::get_admin_pages()).
    const tabPages = {
        'blocks': 'shapeblock-blocks',
        'theme-builder': 'shapeblock-theme-builder',
        'templates': 'shapeblock-templates',
        'settings': 'shapeblock',
        'export-import': 'shapeblock-export-import',
        ...Object.fromEntries(addonPages.map((p) => [p.tab, p.page])),
    };
    const isAddonTab = addonPages.some((p) => p.tab === current);

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
                    <Sider theme="light" collapsible collapsed={collapsed} onCollapse={value => setCollapsed(value)} breakpoint="md" collapsedWidth={wide ? 80 : 56}>
                        <div className="shapeblock-logo">
                            <img src={shapeblock.shapeblockUrl + 'assets/images/icons/shapeblock-logo.png'} alt={ __( 'ShapeBlock logo', 'shapeblock' ) } />
                        </div>
                        <Menu
                            theme="light"
                            mode="inline"
                            selectedKeys={[current]}
                            items={getMenuItems()}
                            onClick={changeMenu}
                        />
                    </Sider>
                    <Layout>
                        <Content style={{ margin: wide ? '0 16px' : '0 8px', minWidth: 0 }}>
                            <div
                                style={{
                                    background: colorBgContainer,
                                    minHeight: 280,
                                    padding: wide ? 24 : 12,
                                    margin: '16px 0',
                                    borderRadius: borderRadiusLG,
                                }}
                            >

                                {current === 'blocks' && <Blocks />}
                                {current === 'templates' && <Templates />}
                                {current === 'theme-builder' && <ThemeBuilder />}
                                {current === 'settings' && <Settings />}
                                {current === 'export-import' && <ExportImport />}
                                {isAddonTab && <AddonTab key={current} tab={current} />}

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