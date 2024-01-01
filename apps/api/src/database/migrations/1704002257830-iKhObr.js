/* eslint-disable import/no-import-module-exports */
        

class IKhObr1704002257830 {
    name = 'IKhObr1704002257830'

    async up(queryRunner) {
        await queryRunner.query(`CREATE TABLE \`tasks\` (\`id\` varchar(36) NOT NULL, \`name\` varchar(50) NOT NULL COMMENT '任务名称', \`service\` varchar(255) NOT NULL COMMENT '任务所调用的服务及其方法', \`type\` tinyint NOT NULL COMMENT '任务类型：0 cron，1 间隔' DEFAULT '0', \`status\` tinyint NOT NULL COMMENT '任务是否启用：0禁用，1启用' DEFAULT '1', \`startTime\` datetime NULL COMMENT '开始时间', \`endTime\` datetime NULL COMMENT '结束时间', \`limit\` int NULL COMMENT '任务的间隔时间' DEFAULT '0', \`cron\` varchar(255) NULL COMMENT 'cron表达式', \`count\` int NULL COMMENT '执行次数', \`data\` text NULL COMMENT '任务执行的参数', \`jobOptions\` varchar(255) NULL COMMENT '任务repeat配置', \`description\` varchar(255) NULL COMMENT '任务简介', UNIQUE INDEX \`IDX_396d500ff7f1b82771ddd812fd\` (\`name\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
    }

    async down(queryRunner) {
        await queryRunner.query(`DROP INDEX \`IDX_396d500ff7f1b82771ddd812fd\` ON \`tasks\``);
        await queryRunner.query(`DROP TABLE \`tasks\``);
    }

}

module.exports = IKhObr1704002257830
