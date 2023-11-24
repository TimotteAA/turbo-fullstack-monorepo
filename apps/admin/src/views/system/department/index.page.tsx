import Icon from '@ant-design/icons';
import type { ActionType, ProColumns } from '@ant-design/pro-components';
import {
    ModalForm,
    ProFormText,
    ProFormTextArea,
    ProFormTreeSelect,
    ProTable,
    TableDropdown,
} from '@ant-design/pro-components';
import { Button, Dropdown, message } from 'antd';
import { useRef, useState } from 'react';

import { useFetcher } from '@/components/fetcher/hooks';

const columns: ProColumns<any>[] = [
    {
        dataIndex: 'index',
        valueType: 'indexBorder',
        width: 48,
    },
    {
        title: '名称',
        dataIndex: 'name',
        copyable: true,
        ellipsis: true,
        tip: '名称过长会自动收缩',
    },
    {
        disable: true,
        title: '状态',
        dataIndex: 'status',
        filters: true,
        onFilter: true,
        ellipsis: true,
        valueType: 'select',
        render(_dom, entity, _index, _action, _schema) {
            if (entity.status === 'enabled') {
                return <Button type="link">禁用</Button>;
            }
            return <Button type="primary">启用</Button>;
        },
        valueEnum: {
            all: { text: '超长'.repeat(50) },
            open: {
                text: '未解决',
                status: 'Error',
            },
            closed: {
                text: '已解决',
                status: 'Success',
                disabled: true,
            },
            processing: {
                text: '解决中',
                status: 'Processing',
            },
        },
    },
    {
        title: '创建时间',
        key: 'showTime',
        dataIndex: 'createdAt',
        valueType: 'date',
        sorter: true,
        hideInSearch: true,
        editable: false,
    },
    {
        title: '修改时间',
        dataIndex: 'updatedAt',
        valueType: 'dateRange',
        hideInTable: true,
        editable: false,
    },
    {
        title: '操作',
        valueType: 'option',
        key: 'option',
        render: (text, record, _, action) => [
            <a
                key="editable"
                onClick={() => {
                    action?.startEditable?.(record.id);
                }}
            >
                编辑
            </a>,
            <a href={record.url} target="_blank" rel="noopener noreferrer" key="view">
                查看
            </a>,
            <TableDropdown
                key="actionGroup"
                onSelect={() => action?.reload()}
                menus={[
                    { key: 'copy', name: '复制' },
                    { key: 'delete', name: '删除' },
                ]}
            />,
        ],
    },
];

export default () => {
    const fetcher = useFetcher();

    const [params, setParams] = useState({
        current: 1,
        pageSize: 10,
    });

    const actionRef = useRef<ActionType>();

    return (
        <div className="tw-px-4 tw-py-2">
            <ProTable<GithubIssueItem>
                params={params}
                columns={columns}
                actionRef={actionRef}
                cardBordered
                request={async (params, sort, filter) => {
                    const { data } = await fetcher.get(
                        `/rbac/systems?page=${params.current}&limit=${params.pageSize}`,
                    );
                    console.log('data ', data);
                    return {
                        data: data.data.items,
                        success: data.statusCode < 300,
                        total: data.data.meta.totalItems,
                    };
                }}
                rowKey="id"
                search={{
                    labelWidth: 'auto',
                }}
                options={{
                    setting: {
                        listsHeight: 400,
                    },
                }}
                form={{
                    // 由于配置了 transform，提交的参与与定义的不同这里需要转化一下
                    syncToUrl: (values, type) => {
                        if (type === 'get') {
                            return {
                                ...values,
                                created_at: [values.startTime, values.endTime],
                            };
                        }
                        return values;
                    },
                }}
                pagination={{
                    pageSize: 5,
                    onChange: (page, pageSize) => setParams({ pageSize, current: page }),
                }}
                dateFormatter="string"
                headerTitle="部门管理"
                toolBarRender={() => [
                    <ModalForm
                        width={520}
                        title="新建"
                        trigger={
                            <Button
                                key="button"
                                icon={<Icon name="iconify:ant-design:edit-filled" />}
                                type="primary"
                            >
                                新建
                            </Button>
                        }
                        onFinish={async (values) => {
                            try {
                                await fetcher.post('/rbac/systems', values);
                                message.success('创建成功');
                                return true;
                            } catch (err) {
                                console.error('创建部门失败 ', err);
                                message.error('创建失败');
                                return false;
                            }
                        }}
                        submitter={{
                            render: (_props, defaultDoms) => {
                                return [...defaultDoms];
                            },
                        }}
                        layout="horizontal"
                        labelCol={{ span: 4 }}
                        wrapperCol={{ span: 20 }}
                        modalProps={{
                            destroyOnClose: true,
                        }}
                    >
                        <ProFormText
                            width="md"
                            name="name"
                            label="名称"
                            tooltip="最长为 30 位"
                            placeholder="请输入名称"
                            required
                        />

                        <ProFormTreeSelect
                            name="parent"
                            placeholder="Please select"
                            label="上级部门"
                            allowClear
                            width={330}
                            secondary
                            request={async () => {
                                const { data } = await fetcher.get('/rbac/systems/tree');
                                return data.data;
                            }}
                        />

                        <ProFormTextArea
                            width="md"
                            name="description"
                            label="备注"
                            placeholder="备注"
                            labelCol={{ span: 4 }}
                            wrapperCol={{ span: 20 }}
                        />
                    </ModalForm>,
                    <Dropdown
                        key="menu"
                        menu={{
                            items: [
                                {
                                    label: '1st item',
                                    key: '1',
                                },
                                {
                                    label: '2nd item',
                                    key: '1',
                                },
                                {
                                    label: '3rd item',
                                    key: '1',
                                },
                            ],
                        }}
                    >
                        <Button>
                            <Icon name="iconify:ant-design:delete-filled" />
                        </Button>
                    </Dropdown>,
                ]}
            />
        </div>
    );
};
