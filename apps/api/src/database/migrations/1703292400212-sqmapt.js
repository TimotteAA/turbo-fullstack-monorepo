/* eslint-disable import/no-import-module-exports */
        

class Sqmapt1703292400212 {
    name = 'Sqmapt1703292400212'

    async up(queryRunner) {
        await queryRunner.query(`CREATE TABLE \`content_categories\` (\`id\` varchar(36) NOT NULL, \`name\` varchar(255) NOT NULL COMMENT '分类名称', \`customOrder\` int NOT NULL COMMENT '自定义排序字段' DEFAULT '0', \`deletedAt\` datetime(6) NULL COMMENT '删除时间', \`mpath\` varchar(255) NULL DEFAULT '', \`parentId\` varchar(36) NULL, FULLTEXT INDEX \`IDX_d6aaf8517ca57297a8c3a44d3d\` (\`name\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`content_comments\` (\`id\` varchar(36) NOT NULL, \`body\` varchar(255) NOT NULL COMMENT '评论内容', \`createdAt\` datetime(6) NOT NULL COMMENT '评论发表时间' DEFAULT CURRENT_TIMESTAMP(6), \`customOrder\` int NOT NULL COMMENT '自定义排序字段' DEFAULT '0', \`mpath\` varchar(255) NULL DEFAULT '', \`postId\` varchar(36) NOT NULL, \`parentId\` varchar(36) NULL, FULLTEXT INDEX \`IDX_5f70a0489331d4346e46ea4d88\` (\`body\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`content_tags\` (\`id\` varchar(36) NOT NULL, \`name\` varchar(255) NOT NULL COMMENT '标签名称', \`description\` varchar(255) NULL COMMENT '标签描述', \`customOrder\` int NOT NULL COMMENT '自定义排序字段' DEFAULT '0', FULLTEXT INDEX \`IDX_6f504a08a58010e15c55b1eb23\` (\`name\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`content_posts\` (\`id\` varchar(36) NOT NULL, \`title\` varchar(255) NOT NULL COMMENT '文章标题', \`body\` text NOT NULL COMMENT '文章内容', \`summary\` varchar(255) NULL COMMENT '文章描述', \`keywords\` text NULL COMMENT '关键字', \`type\` varchar(255) NOT NULL COMMENT '文章类型' DEFAULT 'md', \`publishedAt\` varchar(255) NULL COMMENT '发布时间', \`customOrder\` int NOT NULL COMMENT '自定义文章排序' DEFAULT '0', \`createdAt\` datetime(6) NOT NULL COMMENT '创建时间' DEFAULT CURRENT_TIMESTAMP(6), \`updatedAt\` datetime(6) NOT NULL COMMENT '更新时间' DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`deletedAt\` datetime(6) NULL COMMENT '删除时间', \`categoryId\` varchar(36) NULL, FULLTEXT INDEX \`IDX_9ef6db9d13df6882d36c8af0cc\` (\`title\`), FULLTEXT INDEX \`IDX_e51068c39974ca11fae5d44c88\` (\`body\`), FULLTEXT INDEX \`IDX_f43723dc196c18767a3893a3f7\` (\`summary\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`rbac_systems\` (\`id\` varchar(36) NOT NULL, \`name\` varchar(255) NOT NULL COMMENT '部门名称', \`description\` varchar(255) NULL COMMENT '部门描述', \`status\` varchar(255) NOT NULL COMMENT '资源状态' DEFAULT 'enabled', \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`mpath\` varchar(255) NULL DEFAULT '', \`parentId\` varchar(36) NULL, FULLTEXT INDEX \`IDX_63a1ed6d9eae1b57ab970baf01\` (\`name\`), FULLTEXT INDEX \`IDX_8c8f7efc45e11ded3c5aed4bf0\` (\`description\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`rbac_roles\` (\`id\` varchar(36) NOT NULL, \`name\` varchar(255) NOT NULL COMMENT '角色名称', \`label\` varchar(255) NULL COMMENT '角色显示名称', \`description\` varchar(255) NULL COMMENT '角色描述', \`systemed\` tinyint NOT NULL COMMENT '是否为系统角色' DEFAULT 0, \`status\` varchar(255) NOT NULL COMMENT '角色状态' DEFAULT 'enabled', \`customOrder\` int NOT NULL COMMENT '角色排序字段' DEFAULT '0', \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`rbac_resources\` (\`id\` varchar(36) NOT NULL, \`name\` varchar(255) NOT NULL COMMENT '资源名称', \`label\` varchar(255) NULL COMMENT '资源显示名称', \`description\` varchar(255) NULL COMMENT '资源描述', \`type\` enum ('directory', 'menu', 'action') NOT NULL COMMENT '资源类型' DEFAULT 'menu', \`icon\` varchar(255) NULL COMMENT '用于侧边栏展示icon', \`path\` varchar(255) NULL COMMENT '菜单项路由路径', \`component\` varchar(255) NULL COMMENT '目录、菜单对应前端组件地址', \`status\` varchar(255) NOT NULL COMMENT '资源状态' DEFAULT 'enabled', \`external\` tinyint NULL COMMENT '是否外链' DEFAULT 0, \`show\` tinyint NULL COMMENT '是否显示在侧边栏中，用于目录或者菜单' DEFAULT 1, \`keepAlive\` tinyint NULL COMMENT '是否缓存，用于菜单项' DEFAULT 1, \`customOrder\` int NOT NULL COMMENT '权限排序字段' DEFAULT '0', \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`rule\` text NULL COMMENT '具体的权限规则', \`mpath\` varchar(255) NULL DEFAULT '', \`parentId\` varchar(36) NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`users\` (\`id\` varchar(36) NOT NULL, \`name\` varchar(100) NOT NULL COMMENT '用户名称', \`nickname\` varchar(100) NULL COMMENT '用户昵称', \`email\` varchar(255) NULL COMMENT '用户邮箱', \`phone\` varchar(255) NULL COMMENT '用户手机号', \`password\` varchar(255) NOT NULL COMMENT '用户密码', \`summary\` varchar(300) NULL COMMENT '用户简介', \`createtAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`deletedAt\` datetime(6) NULL, \`actived\` tinyint NOT NULL COMMENT '用户是否启用' DEFAULT 1, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`content_posts_tags_content_tags\` (\`contentPostsId\` varchar(36) NOT NULL, \`contentTagsId\` varchar(36) NOT NULL, INDEX \`IDX_1e8c41827d0d509e70de1f6b70\` (\`contentPostsId\`), INDEX \`IDX_888e6754015ee17f9e22faae57\` (\`contentTagsId\`), PRIMARY KEY (\`contentPostsId\`, \`contentTagsId\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`rbac_roles_users_users\` (\`rbacRolesId\` varchar(36) NOT NULL, \`usersId\` varchar(36) NOT NULL, INDEX \`IDX_3c933e8c0950496fa3a616e4b2\` (\`rbacRolesId\`), INDEX \`IDX_789b5818a876ba2c4f058bdeb9\` (\`usersId\`), PRIMARY KEY (\`rbacRolesId\`, \`usersId\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`rbac_resources_roles_rbac_roles\` (\`rbacResourcesId\` varchar(36) NOT NULL, \`rbacRolesId\` varchar(36) NOT NULL, INDEX \`IDX_87de9bc0d3195bf48a34246e6a\` (\`rbacResourcesId\`), INDEX \`IDX_811d6314edd88be3bd72decd2e\` (\`rbacRolesId\`), PRIMARY KEY (\`rbacResourcesId\`, \`rbacRolesId\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`rbac_resources_users_users\` (\`rbacResourcesId\` varchar(36) NOT NULL, \`usersId\` varchar(36) NOT NULL, INDEX \`IDX_6b8d229e9b5794575d795bf48b\` (\`rbacResourcesId\`), INDEX \`IDX_a9e2821b971c54dff704bf7148\` (\`usersId\`), PRIMARY KEY (\`rbacResourcesId\`, \`usersId\`)) ENGINE=InnoDB`);
        await queryRunner.query(`ALTER TABLE \`content_categories\` ADD CONSTRAINT \`FK_a03aea27707893300382b6f18ae\` FOREIGN KEY (\`parentId\`) REFERENCES \`content_categories\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`content_comments\` ADD CONSTRAINT \`FK_5e1c3747a0031f305e94493361f\` FOREIGN KEY (\`postId\`) REFERENCES \`content_posts\`(\`id\`) ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE \`content_comments\` ADD CONSTRAINT \`FK_982a849f676860e5d6beb607f20\` FOREIGN KEY (\`parentId\`) REFERENCES \`content_comments\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`content_posts\` ADD CONSTRAINT \`FK_4027367881933f659d02f367e92\` FOREIGN KEY (\`categoryId\`) REFERENCES \`content_categories\`(\`id\`) ON DELETE SET NULL ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`rbac_systems\` ADD CONSTRAINT \`FK_15a76c16422b3c05fba06b6a0fe\` FOREIGN KEY (\`parentId\`) REFERENCES \`rbac_systems\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`rbac_resources\` ADD CONSTRAINT \`FK_8f2f71e39f671afa71cadd56eb4\` FOREIGN KEY (\`parentId\`) REFERENCES \`rbac_resources\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`content_posts_tags_content_tags\` ADD CONSTRAINT \`FK_1e8c41827d0d509e70de1f6b70e\` FOREIGN KEY (\`contentPostsId\`) REFERENCES \`content_posts\`(\`id\`) ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE \`content_posts_tags_content_tags\` ADD CONSTRAINT \`FK_888e6754015ee17f9e22faae578\` FOREIGN KEY (\`contentTagsId\`) REFERENCES \`content_tags\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`rbac_roles_users_users\` ADD CONSTRAINT \`FK_3c933e8c0950496fa3a616e4b27\` FOREIGN KEY (\`rbacRolesId\`) REFERENCES \`rbac_roles\`(\`id\`) ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE \`rbac_roles_users_users\` ADD CONSTRAINT \`FK_789b5818a876ba2c4f058bdeb98\` FOREIGN KEY (\`usersId\`) REFERENCES \`users\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`rbac_resources_roles_rbac_roles\` ADD CONSTRAINT \`FK_87de9bc0d3195bf48a34246e6a8\` FOREIGN KEY (\`rbacResourcesId\`) REFERENCES \`rbac_resources\`(\`id\`) ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE \`rbac_resources_roles_rbac_roles\` ADD CONSTRAINT \`FK_811d6314edd88be3bd72decd2e2\` FOREIGN KEY (\`rbacRolesId\`) REFERENCES \`rbac_roles\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`rbac_resources_users_users\` ADD CONSTRAINT \`FK_6b8d229e9b5794575d795bf48b6\` FOREIGN KEY (\`rbacResourcesId\`) REFERENCES \`rbac_resources\`(\`id\`) ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE \`rbac_resources_users_users\` ADD CONSTRAINT \`FK_a9e2821b971c54dff704bf71489\` FOREIGN KEY (\`usersId\`) REFERENCES \`users\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    async down(queryRunner) {
        await queryRunner.query(`ALTER TABLE \`rbac_resources_users_users\` DROP FOREIGN KEY \`FK_a9e2821b971c54dff704bf71489\``);
        await queryRunner.query(`ALTER TABLE \`rbac_resources_users_users\` DROP FOREIGN KEY \`FK_6b8d229e9b5794575d795bf48b6\``);
        await queryRunner.query(`ALTER TABLE \`rbac_resources_roles_rbac_roles\` DROP FOREIGN KEY \`FK_811d6314edd88be3bd72decd2e2\``);
        await queryRunner.query(`ALTER TABLE \`rbac_resources_roles_rbac_roles\` DROP FOREIGN KEY \`FK_87de9bc0d3195bf48a34246e6a8\``);
        await queryRunner.query(`ALTER TABLE \`rbac_roles_users_users\` DROP FOREIGN KEY \`FK_789b5818a876ba2c4f058bdeb98\``);
        await queryRunner.query(`ALTER TABLE \`rbac_roles_users_users\` DROP FOREIGN KEY \`FK_3c933e8c0950496fa3a616e4b27\``);
        await queryRunner.query(`ALTER TABLE \`content_posts_tags_content_tags\` DROP FOREIGN KEY \`FK_888e6754015ee17f9e22faae578\``);
        await queryRunner.query(`ALTER TABLE \`content_posts_tags_content_tags\` DROP FOREIGN KEY \`FK_1e8c41827d0d509e70de1f6b70e\``);
        await queryRunner.query(`ALTER TABLE \`rbac_resources\` DROP FOREIGN KEY \`FK_8f2f71e39f671afa71cadd56eb4\``);
        await queryRunner.query(`ALTER TABLE \`rbac_systems\` DROP FOREIGN KEY \`FK_15a76c16422b3c05fba06b6a0fe\``);
        await queryRunner.query(`ALTER TABLE \`content_posts\` DROP FOREIGN KEY \`FK_4027367881933f659d02f367e92\``);
        await queryRunner.query(`ALTER TABLE \`content_comments\` DROP FOREIGN KEY \`FK_982a849f676860e5d6beb607f20\``);
        await queryRunner.query(`ALTER TABLE \`content_comments\` DROP FOREIGN KEY \`FK_5e1c3747a0031f305e94493361f\``);
        await queryRunner.query(`ALTER TABLE \`content_categories\` DROP FOREIGN KEY \`FK_a03aea27707893300382b6f18ae\``);
        await queryRunner.query(`DROP INDEX \`IDX_a9e2821b971c54dff704bf7148\` ON \`rbac_resources_users_users\``);
        await queryRunner.query(`DROP INDEX \`IDX_6b8d229e9b5794575d795bf48b\` ON \`rbac_resources_users_users\``);
        await queryRunner.query(`DROP TABLE \`rbac_resources_users_users\``);
        await queryRunner.query(`DROP INDEX \`IDX_811d6314edd88be3bd72decd2e\` ON \`rbac_resources_roles_rbac_roles\``);
        await queryRunner.query(`DROP INDEX \`IDX_87de9bc0d3195bf48a34246e6a\` ON \`rbac_resources_roles_rbac_roles\``);
        await queryRunner.query(`DROP TABLE \`rbac_resources_roles_rbac_roles\``);
        await queryRunner.query(`DROP INDEX \`IDX_789b5818a876ba2c4f058bdeb9\` ON \`rbac_roles_users_users\``);
        await queryRunner.query(`DROP INDEX \`IDX_3c933e8c0950496fa3a616e4b2\` ON \`rbac_roles_users_users\``);
        await queryRunner.query(`DROP TABLE \`rbac_roles_users_users\``);
        await queryRunner.query(`DROP INDEX \`IDX_888e6754015ee17f9e22faae57\` ON \`content_posts_tags_content_tags\``);
        await queryRunner.query(`DROP INDEX \`IDX_1e8c41827d0d509e70de1f6b70\` ON \`content_posts_tags_content_tags\``);
        await queryRunner.query(`DROP TABLE \`content_posts_tags_content_tags\``);
        await queryRunner.query(`DROP TABLE \`users\``);
        await queryRunner.query(`DROP TABLE \`rbac_resources\``);
        await queryRunner.query(`DROP TABLE \`rbac_roles\``);
        await queryRunner.query(`DROP INDEX \`IDX_8c8f7efc45e11ded3c5aed4bf0\` ON \`rbac_systems\``);
        await queryRunner.query(`DROP INDEX \`IDX_63a1ed6d9eae1b57ab970baf01\` ON \`rbac_systems\``);
        await queryRunner.query(`DROP TABLE \`rbac_systems\``);
        await queryRunner.query(`DROP INDEX \`IDX_f43723dc196c18767a3893a3f7\` ON \`content_posts\``);
        await queryRunner.query(`DROP INDEX \`IDX_e51068c39974ca11fae5d44c88\` ON \`content_posts\``);
        await queryRunner.query(`DROP INDEX \`IDX_9ef6db9d13df6882d36c8af0cc\` ON \`content_posts\``);
        await queryRunner.query(`DROP TABLE \`content_posts\``);
        await queryRunner.query(`DROP INDEX \`IDX_6f504a08a58010e15c55b1eb23\` ON \`content_tags\``);
        await queryRunner.query(`DROP TABLE \`content_tags\``);
        await queryRunner.query(`DROP INDEX \`IDX_5f70a0489331d4346e46ea4d88\` ON \`content_comments\``);
        await queryRunner.query(`DROP TABLE \`content_comments\``);
        await queryRunner.query(`DROP INDEX \`IDX_d6aaf8517ca57297a8c3a44d3d\` ON \`content_categories\``);
        await queryRunner.query(`DROP TABLE \`content_categories\``);
    }

}

module.exports = Sqmapt1703292400212
