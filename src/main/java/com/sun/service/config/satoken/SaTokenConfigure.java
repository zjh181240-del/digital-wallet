package com.sun.service.config.satoken;

import cn.dev33.satoken.filter.SaServletFilter;
import com.sun.service.core.domian.R;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * TODO
 *
 * @author: zjh
 * @Date: 2025年03月31日 10:12
 * @Description: SaTokenConfigure
 */
@Slf4j
@Configuration(proxyBeanMethods = false)
public class SaTokenConfigure {

    @Bean
    public SaServletFilter getSaServletFilter() {
        return new SaServletFilter()
                .setError(e -> {
                    log.error("SaToken error !", e);
                    return R.fail(e.getMessage());
                });
    }
}
