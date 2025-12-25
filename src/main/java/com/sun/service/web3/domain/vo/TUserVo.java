package com.sun.service.web3.domain.vo;

import com.sun.service.web3.domain.TUser;
import io.github.linpeilie.annotations.AutoMapper;
import lombok.Data;

import java.io.Serial;
import java.io.Serializable;


/**
 * 用户视图对象 t_user
 *
 * @author zjh
 * @date 2025-12-22
 */
@Data
@AutoMapper(target = TUser.class, convertGenerate = false)
public class TUserVo implements Serializable {

    @Serial
    private static final long serialVersionUID = 1L;

    /**
     * 主键
     */
    private String id;

    /**
     * 用户昵称
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
