import { ReactNode, useState } from 'react';

export const useModalOrDrawer = () => {
    const [content, setDrawerContent] = useState<ReactNode>(null);

    const closeDrawer = () => setDrawerContent(null);

    const openDrwaer = (_content: ReactNode) => setDrawerContent(_content);

    return {
        content,
        open: openDrwaer,
        close: closeDrawer,
    };
};
