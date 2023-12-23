import { ApiProperty, ApiPropertyOptional, PickType } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsNotEmpty, IsOptional, IsUUID, MaxLength, ValidateIf } from 'class-validator';

import { DTO_VALIDATION } from '@/modules/core/decorators';
import { ListQueryDto } from '@/modules/restful/dtos';

/**
 * 分页查询评论
 */
@DTO_VALIDATION({ type: 'query' })
export class QueryCommentListDto extends ListQueryDto {
    @ApiPropertyOptional({
        description: '某篇文章的id，用于查询特定文章下的所有评论',
    })
    @IsUUID(undefined, { message: '文章id格式错误' })
    @IsOptional()
    post?: string;
}

/**
 * 查询评论树
 */
@DTO_VALIDATION({ type: 'query' })
export class QueryCommentTreeDto extends PickType(QueryCommentListDto, ['post']) {}

@DTO_VALIDATION({ groups: ['create'] })
export class CreateCommentDto {
    @ApiProperty({ description: '评论内容' })
    @MaxLength(1000, {
        always: true,
        message: '评论内容长度不能超过1000',
    })
    @IsNotEmpty({ always: true, message: '评论内容不能为空' })
    body!: string;

    @ApiProperty({ description: '评论所属文章' })
    @IsUUID(undefined, { message: '文章id格式错误' })
    @IsNotEmpty({ always: true, message: '评论文章必须指定' })
    post: string;

    @ApiPropertyOptional({ description: '父评论' })
    @IsUUID(undefined, { message: '父分类id格式错误', always: true })
    @ValidateIf((value) => value.parent !== null && value.parent !== undefined)
    @IsOptional({ always: true })
    @Transform(({ value }) => (value !== 'null' ? value : null))
    parent?: string;
}
