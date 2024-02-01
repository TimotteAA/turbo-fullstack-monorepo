import { Spin } from 'antd';
import { useEffect, useState } from 'react';

import $styles from './index.module.css';

export interface IFrameProps {
    src: string;
}

const IFrame: FC<IFrameProps> = ({ src }) => {
    const [loading, setLoading] = useState(true);

    const handleWindowResize = () => {};

    useEffect(() => {
        return () => setLoading(true);
    }, []);

    return (
        <Spin size="large" spinning={loading}>
            <div className={$styles.iframeContainer}>
                <iframe
                    onLoad={() => setLoading(false)}
                    src={src}
                    className="tw-w-full tw-h-full"
                />
            </div>
        </Spin>
    );
};

export default IFrame;
