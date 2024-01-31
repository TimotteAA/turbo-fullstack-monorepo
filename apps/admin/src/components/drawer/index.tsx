import { Drawer, DrawerProps } from 'antd';
import { ReactNode, useEffect, useMemo, useState } from 'react';

export type DrawerInstance = {
    setDrawerProps: (props: DrawerProps) => void;
};

const BasicDrawer: React.FC<{
    children: ReactNode;
    onRegister: (instance: DrawerInstance, uid: string) => void;
    uid: string;
}> = ({ children, onRegister, uid }) => {
    // 自定义drawerInstance
    const [props, setProps] = useState<DrawerProps>({});
    // drawer内部实例
    const instance: DrawerInstance = useMemo(() => ({ setDrawerProps: setProps }), [setProps]);

    useEffect(() => {
        onRegister(instance, uid);

        return () => {};
    }, [setProps]);
    return <Drawer {...props}>{children}</Drawer>;
};

export default BasicDrawer;
