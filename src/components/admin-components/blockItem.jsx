import React from 'react';
import { Switch } from 'antd';

export default function BlockItem(
    {
        title,
        description,
        icon,
        badge,
        badgeType,
        onChangeHandler,
        status
    }
) {
    // The small tag on top of the icon ("Free", or whatever an add-on passes for
    // its own blocks). badgeType only picks the colour.
    const badgeClass = 'shapeblock-block-badge is-' + String(badgeType || 'default').replace(/[^a-z0-9-]/g, '');

    return (
        <div className="shapeblock-block-item">
            <div className="meta">
                <div className='icon'>
                    {badge && <span className={badgeClass}>{badge}</span>}
                    <i className={icon} ></i>
                </div>
                <div className='content'>
                    <strong>{title}</strong>
                    <p title={description}>{description}</p>
                </div>
            </div>
            <div className='switch'>
                <Switch size="small" onChange={onChangeHandler} checked={status === 'enable'} />
            </div>
        </div>
    );
}
