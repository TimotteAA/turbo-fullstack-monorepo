import { memo } from 'react';
import { Outlet } from 'react-router';

import MasterLayout from '@/components/layout';

export default memo(() => {
    return (
        <MasterLayout>
            <Outlet />
        </MasterLayout>
    );
});
