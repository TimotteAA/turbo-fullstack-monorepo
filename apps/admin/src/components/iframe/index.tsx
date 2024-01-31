import { Spin } from 'antd';
import { useState } from 'react';

export interface IFrameProps {
    src: string;
}

const IFrame: FC<IFrameProps> = ({ src }) => {
    const [loading, setLoading] = useState(true);

    return (
        <Spin size="large" spinning={loading}>
            <iframe onLoad={() => setLoading(false)} src={src} />
        </Spin>
    );
};

export default IFrame;
