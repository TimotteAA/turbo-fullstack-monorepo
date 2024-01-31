import { DrawerInstance } from '@/components/drawer';
import { DrawerProps } from 'antd';
import { produce } from 'immer';
import { ReactNode, createContext, useCallback, useContext, useState } from 'react';

interface DrawerContext {
    drawers: Record<string, DrawerInstance>;
    register: (ele: DrawerInstance, id: string) => void;
    unregister: (id: string) => void;
}

const drawerContext = createContext<DrawerContext>({
    drawers: {},
    register: () => {},
    unregister: () => {},
});

export const DrawerProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [drawers, setDrawers] = useState<Record<string, DrawerInstance>>({});

    const register = (ele: DrawerInstance, id: string) => {
        setDrawers(
            produce((state) => {
                // if (!state[id]) {
                state[id] = ele;
                // }
                return state;
            }),
        );
    };

    const unregister = useCallback((id: string) => {
        setDrawers(
            produce((state) => {
                delete state[id];
                return state;
            }),
        );
    }, []);

    return (
        <drawerContext.Provider value={{ drawers, register, unregister }}>
            {children}
        </drawerContext.Provider>
    );
};

export const useDrawer = (id: string) => {
    const context = useContext(drawerContext);
    const { drawers, register, unregister } = context;
    const getInstance = useCallback(() => {
        const drawer = drawers[id];
        if (!drawer) {
            throw new Error('Drawer instance is undefined!');
        }
        return drawer;
    }, [drawers, id]);

    const methods = {
        registerDrawer: (ele: DrawerInstance, id: string) => register(ele, id),
        unregisterDrawer: () => unregister(id),
        openDrawer: (props: DrawerProps) => {
            const instance = getInstance();
            instance.setDrawerProps({ ...props, open: true });
        },
        closeDrawer: (props: DrawerProps) => {
            const instance = getInstance();
            instance.setDrawerProps({ ...props, open: false });
        },
    };

    return methods;
};
