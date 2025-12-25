package com.sun.service.web3.controller;

import cn.dev33.satoken.secure.BCrypt;
import cn.dev33.satoken.stp.SaTokenInfo;
import cn.dev33.satoken.stp.StpUtil;
import com.sun.service.core.domian.R;
import com.sun.service.core.model.LoginUser;
import com.sun.service.utils.LoginHelper;
import com.sun.service.utils.MapstructUtils;
import com.sun.service.web3.domain.TUser;
import com.sun.service.web3.domain.bo.AuthBo;
import com.sun.service.web3.domain.vo.AuthVo;
import com.sun.service.web3.domain.vo.TUserVo;
import com.sun.service.web3.service.ITUserService;
import lombok.RequiredArgsConstructor;
import org.springframework.util.Assert;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.util.function.Supplier;

/**
 * TODO
 *
 * @author: zjh
 * @Date: 2025年12月23日 14:00
 * @Description: AuthController
 */
@RequiredArgsConstructor
@RestController
@RequestMapping("/auth")
public class AuthController {

    private final ITUserService userService;
    @GetMapping("/getCurrentUser")
    public R<LoginUser> getCurrentUser() {
        LoginUser loginUser = LoginHelper.getLoginUser();
        return R.ok(loginUser);
    }
    @PostMapping("/login")
    public R<AuthVo.Login> login(@Validated @RequestBody AuthBo.Login bo) {
        TUserVo userVo = userService.selectByUserName(bo.getUsername());

        checkLogin(bo.getUsername(), () -> !BCrypt.checkpw(bo.getPassword(), userVo.getPassword()));
        LoginUser loginUser = MapstructUtils.convert(userVo, LoginUser.class);

        LoginHelper.login(loginUser, null);
        AuthVo.Login loginVo = new AuthVo.Login();
        SaTokenInfo tokenInfo = StpUtil.getTokenInfo();
        loginVo.setAccessToken(tokenInfo.getTokenValue());
        loginVo.setExpireIn(tokenInfo.getTokenTimeout());
        return R.ok(loginVo);
    }

    @PostMapping("/register")
    public R register(@Validated @RequestBody AuthBo.Register bo) {
        TUserVo userVo = userService.selectByUserName(bo.getUsername());
        Assert.isNull(userVo, "用户名已存在");
        bo.setPassword(BCrypt.hashpw(bo.getPassword(), BCrypt.gensalt()));
        userService.insert(MapstructUtils.convert(bo, TUser.class));
        return R.ok();
    }

    @GetMapping("/logout")
    public R logout() {
        StpUtil.logout();
        return R.ok();
    }

    public void checkLogin(String username, Supplier<Boolean> supplier) {
        //TODO 获取用户登录错误次数
        if (supplier.get()) {
            //TODO 达到指定次数锁定用户
            throw new IllegalArgumentException("用户名或密码错误!");
        }
    }
}
