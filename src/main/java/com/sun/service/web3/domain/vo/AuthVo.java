package com.sun.service.web3.domain.vo;

import lombok.Data;

/**
 * TODO
 *
 * @author: zjh
 * @Date: 2025年12月23日 15:29
 * @Description: AuthVo
 */
public class AuthVo {

    @Data
    public static class Login {

        /**
         * 授权令牌
         */
        private String accessToken;

        /**
         * 授权令牌 access_token 的有效期
         */
        private Long expireIn;
    }

}
