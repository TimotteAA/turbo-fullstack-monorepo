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
import { Button, Dropdown, Space, Tag } from 'antd';
import { useRef, useState } from 'react';

import { useFetcher } from '@/components/fetcher/hooks';

type GithubIssueItem = {
    url: string;
    id: number;
    number: number;
    title: string;
    labels: {
        name: string;
        color: string;
    }[];
    state: string;
    comments: number;
    created_at: string;
    updated_at: string;
    closed_at?: string;
};

const columns: ProColumns<GithubIssueItem>[] = [
    {
        dataIndex: 'index',
        valueType: 'indexBorder',
        width: 48,
    },
    {
        title: '标题',
        dataIndex: 'title',
        copyable: true,
        ellipsis: true,
        tip: '标题过长会自动收缩',
        formItemProps: {
            rules: [
                {
                    required: true,
                    message: '此项为必填项',
                },
            ],
        },
    },
    {
        disable: true,
        title: '状态',
        dataIndex: 'state',
        filters: true,
        onFilter: true,
        ellipsis: true,
        valueType: 'select',
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
        disable: true,
        title: '标签',
        dataIndex: 'labels',
        search: false,
        renderFormItem: (_, { defaultRender }) => {
            return defaultRender(_);
        },
        render: (_, record) => (
            <Space>
                {record.labels.map(({ name, color }) => (
                    <Tag color={color} key={name}>
                        {name}
                    </Tag>
                ))}
            </Space>
        ),
    },
    {
        title: '创建时间',
        key: 'showTime',
        dataIndex: 'created_at',
        valueType: 'date',
        sorter: true,
        hideInSearch: true,
    },
    {
        title: '创建时间',
        dataIndex: 'created_at',
        valueType: 'dateRange',
        hideInTable: true,
        search: {
            transform: (value) => {
                return {
                    startTime: value[0],
                    endTime: value[1],
                };
            },
        },
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
                    return {
                        data: data.data.items,
                        success: data.msg === 'success',
                        total: data.data.meta.totalPages,
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
                headerTitle="高级表格"
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
                        submitter={{
                            render: (_props, defaultDoms) => {
                                return [...defaultDoms];
                            },
                        }}
                        layout="horizontal"
                        labelCol={{ span: 4 }}
                        wrapperCol={{ span: 20 }}
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
                            name="name"
                            placeholder="Please select"
                            label="上级部门"
                            allowClear
                            width={330}
                            secondary
                            request={async () => {
                                const { data } = await fetcher.get('/rbac/systems/tree');
                                console.log('data ', data);
                                return [
                                    {
                                        title: 'Node1',
                                        value: '0-0',
                                        children: [
                                            {
                                                title: 'Child Node1',
                                                value: '0-0-0',
                                            },
                                        ],
                                    },
                                    {
                                        title: 'Node2',
                                        value: '0-1',
                                        children: [
                                            {
                                                title: 'Child Node3',
                                                value: '0-1-0',
                                            },
                                            {
                                                title: 'Child Node4',
                                                value: '0-1-1',
                                            },
                                            {
                                                title: 'Child Node5',
                                                value: '0-1-2',
                                            },
                                        ],
                                    },
                                ];
                            }}
                        />

                        <ProFormTextArea
                            width="md"
                            name="company"
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
