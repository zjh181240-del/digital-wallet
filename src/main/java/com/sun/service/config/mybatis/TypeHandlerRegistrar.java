package com.sun.service.config.mybatis;

import com.sun.service.config.mybatis.type.DateTypeHandler;
import jakarta.annotation.PostConstruct;
import org.apache.ibatis.session.SqlSessionFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

/**
 * @author: zjh
 * @Date: 2025年06月11日 20:05
 * @Description: TypeHandlerRegistrar
 * TODO
 */
@Component
public class TypeHandlerRegistrar {

    @Autowired
    private SqlSessionFactory sqlSessionFactory;

    @PostConstruct
    public void registerTypeHandler() {
        sqlSessionFactory.getConfiguration().getTypeHandlerRegistry()
            .register(DateTypeHandler.class);
    }
}
