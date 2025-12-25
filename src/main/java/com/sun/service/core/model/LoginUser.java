package com.sun.service.core.model;

import com.sun.service.web3.domain.vo.TUserVo;
import io.github.linpeilie.annotations.AutoMapper;
import io.github.linpeilie.annotations.AutoMapping;
import lombok.Data;

import java.util.Date;

/**
 * TODO
 *
 * @author: zjh
 * @Date: 2025年12月23日 15:16
 * @Description: LoginUser
 */
@Data
@AutoMapper(target = TUserVo.class, convertGenerate = false)
public class LoginUser {

    @AutoMapping(source = "userId", target = "id")
    private String userId;

    private String nickName;

    private String username;

    private String email;

    private Date createdAt;
}
