package com.sun.service.web3.domain.bo;

import com.sun.service.web3.domain.TUser;
import io.github.linpeilie.annotations.AutoMapper;
import jakarta.validation.constraints.NotEmpty;
import lombok.Data;

/**
 * TODO
 *
 * @author: zjh
 * @Date: 2025年12月23日 15:10
 * @Description: AuthBo
 */
public class AuthBo {


    @Data
    public static class Login {

        @NotEmpty(message = "用户名不能为空")
        private String username;

        @NotEmpty(message = "密码不能为空")
        private String password;
    }

    @Data
    @AutoMapper(target = TUser.class, reverseConvertGenerate = false)
    public static class Register {
        @NotEmpty(message = "用户名不能为空")
        private String username;

        @NotEmpty(message = "密码不能为空")
        private String password;

        @NotEmpty(message = "邮箱不能为空")
        private String email;
    }

}
