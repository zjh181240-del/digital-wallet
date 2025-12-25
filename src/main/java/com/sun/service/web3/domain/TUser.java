package com.sun.service.web3.domain;

import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.io.Serial;

/**
 * 用户对象 t_user
 *
 * @author zjh
 * @date 2025-12-22
 */
@Data
@TableName("t_user")
public class TUser {

    @Serial
    private static final long serialVersionUID = 1L;

    /**
     * 主键
     */
    @TableId(value = "id")
    private String id;

    /**
     * $column.columnComment
     */
    private String nickName;

    /**
     * 用户名
     */
    private String username;

    /**
     * 用户密码
     */
    private String password;

    /**
     * 用户邮箱地址
     */
    private String email;

    /**
     * 用户账户创建时间
     */
    private String createdAt;

    /**
     * 用户账户最后更新时间
     */
    private String updatedAt;


}
