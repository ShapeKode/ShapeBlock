import React from 'react';
import { Col, Switch } from 'antd';

export default function BlockItem(
    {
        title,
        id,
        description,
        icon,
        onChangeHandler,
        status
    }
) {
    return (
        <Col className="gutter-row" xs={24} sm={12} md={12} lg={6}>
            <div className="shapeblock-block-item">
                <div className="meta">
                    <div className='icon'>
                        <i className={icon} ></i>
                    </div>
                    <div className='content'>
                        <strong>{title}</strong>
                        <p>{description}</p>
                    </div>
                </div>
                <div className='switch'>
                    <Switch size="small" onChange={onChangeHandler} checked={status === 'enable'} />
                </div>
            </div>
        </Col>
    );
}