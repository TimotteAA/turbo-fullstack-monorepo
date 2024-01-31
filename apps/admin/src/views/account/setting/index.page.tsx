import BasicDrawer from '@/components/drawer';
import { useDrawer } from '@/hooks/useDrawer';
import { Button } from 'antd';
import { useEffect } from 'react';

export default () => {
    const { registerDrawer, unregisterDrawer, openDrawer, closeDrawer } = useDrawer('test');

    useEffect(() => {
        return () => unregisterDrawer();
    }, []);

    return (
        <div>
            user setting
            <BasicDrawer onRegister={registerDrawer} uid="test">
                <div>12356</div>
            </BasicDrawer>
            <Button
                onClick={() =>
                    openDrawer({
                        open: true,
                        onClose: () => {
                            closeDrawer({});
                        },
                    })
                }
            >
                Open Drawer
            </Button>
        </div>
    );
};
