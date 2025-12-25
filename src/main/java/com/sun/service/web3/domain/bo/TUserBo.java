package com.sun.service.web3.domain.bo;

import com.sun.service.core.groups.AddGroup;
import com.sun.service.core.groups.EditGroup;
import com.sun.service.web3.domain.TUser;
import io.github.linpeilie.annotations.AutoMapper;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

/**
 * 用户业务对象 t_user
 *
 * @author zjh
 * @date 2025-12-22
 */
@Data
@AutoMapper(target = TUser.class, reverseConvertGenerate = false)
public class TUserBo {

    /**
     * 主键
     */
    @NotNull(message = "主键不能为空", groups = {EditGroup.class})
    private String id;

    /**
     * $column.columnComment
     */
    @NotBlank(message = "$column.columnComment不能为空", groups = {AddGroup.class, EditGroup.class})
    private String nickName;

    /**
     * 用户名
     */
    @NotBlank(message = "用户名不能为空", groups = {EditGroup.class})
    private String username;

    /**
     * 用户密码
     */
    @NotBlank(message = "用户密码不能为空", groups = {AddGroup.class, EditGroup.class})
    private String password;

    /**
     * 用户邮箱地址
     */
    @NotBlank(message = "用户邮箱地址不能为空", groups = {AddGroup.class, EditGroup.class})
    private String email;

    /**
     * 用户账户创建时间
     */
    @NotBlank(message = "用户账户创建时间不能为空", groups = {AddGroup.class, EditGroup.class})
    private String createdAt;

    /**
     * 用户账户最后更新时间
     */
    @NotBlank(message = "用户账户最后更新时间不能为空", groups = {AddGroup.class, EditGroup.class})
    private String updatedAt;


}
