/** *******************启动命令类型*********************** */
export type StartComamndArgs = {
    /** 是否监控文件变更重启应用（非PM2部署的生产环境无效） */
    watch?: boolean;
};
