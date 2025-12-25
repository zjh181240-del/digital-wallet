package com.sun.service.config.properties;

import lombok.Getter;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

/**
 * 全局配置类
 *
 * @author: zjh
 * @Date: 2025年11月12日 16:23
 * @Description: GisInfoConfig
 */
@Component
@ConfigurationProperties(prefix = "service")
public class ServiceConfig {

    /**
     * 项目名称
     */
    private static String name;

    /**
     * 版本
     */
    private static String version;

    /**
     * 版权年份
     */
    private static String copyrightYear;

    /**
     * 上传路径
     */
    private static String profile;

    /**
     * 密钥
     */
    @Getter
    private static String secretKey;

    public void setSecretKey(String secretKey) {
        ServiceConfig.secretKey = secretKey;
    }

    public static String getName() {
        return name;
    }

    public void setName(String name) {
        ServiceConfig.name = name;
    }

    public static String getVersion() {
        return version;
    }

    public void setVersion(String version) {
        ServiceConfig.version = version;
    }

    public static String getCopyrightYear() {
        return copyrightYear;
    }

    public void setCopyrightYear(String copyrightYear) {
        ServiceConfig.copyrightYear = copyrightYear;
    }

    public static String getProfile() {
        return profile;
    }

    public void setProfile(String profile) {
        ServiceConfig.profile = profile;
    }


    /**
     * 获取上传路径
     */
    public static String getUploadPath()
    {
        return getProfile() + "/upload";
    }

    /**
     * 获取外部模板路径
     */
    public static String getTemplatesPath() { return getProfile() +"/templates"; }
}
