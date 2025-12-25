package com.sun.service.utils;

import cn.dev33.satoken.context.SaHolder;
import cn.dev33.satoken.context.model.SaStorage;
import cn.dev33.satoken.session.SaSession;
import cn.dev33.satoken.stp.SaLoginModel;
import cn.dev33.satoken.stp.StpUtil;
import cn.hutool.core.util.ObjectUtil;
import com.sun.service.core.model.LoginUser;

import java.util.function.Consumer;
import java.util.function.Supplier;

/**
 * TODO
 *
 * @author: zjh
 * @Date: 2025年03月28日 16:42
 * @Description: LoginHelper
 */
public class LoginHelper {

    public static final String LOGIN_USER_KEY = SaSession.USER;

    /**
     * 登录系统 基于 设备类型
     * 针对相同用户体系不同设备
     *
     * @param loginUser 用户信息
     * @param model     配置参数
     */
    public static void login(LoginUser loginUser, SaLoginModel model) {
        SaStorage storage = SaHolder.getStorage();
        storage.set(LOGIN_USER_KEY, loginUser);
        model = ObjectUtil.defaultIfNull(model, new SaLoginModel());
        StpUtil.login(loginUser.getUsername(), model);
        StpUtil.getSession().set(LOGIN_USER_KEY, loginUser);
    }

    /**
     * 获取用户(多级缓存)
     */
    public static LoginUser getLoginUser() {
        return (LoginUser) getStorageIfAbsentSet(LOGIN_USER_KEY, () -> {
            SaSession session = StpUtil.getSession();
            if (ObjectUtil.isNull(session)) {
                return null;
            }
            return session.get(LOGIN_USER_KEY);
        });
    }

    public static void fillUserName(Consumer<String> consumer) {
        LoginUser loginUser = LoginHelper.getLoginUser();
        if (ObjectUtil.isNotNull(loginUser)) {
            consumer.accept(loginUser.getUsername());
        }
    }

    public static boolean isLogin() {
        return getLoginUser() != null;
    }

    public static Object getStorageIfAbsentSet(String key, Supplier<Object> handle) {
        try {
            Object obj = SaHolder.getStorage().get(key);
            if (ObjectUtil.isNull(obj)) {
                obj = handle.get();
                SaHolder.getStorage().set(key, obj);
            }
            return obj;
        } catch (Exception e) {
            return null;
        }
    }
}
