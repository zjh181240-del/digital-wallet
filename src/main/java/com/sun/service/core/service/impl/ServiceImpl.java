package com.sun.service.core.service.impl;

import com.baomidou.mybatisplus.core.conditions.Wrapper;
import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.baomidou.mybatisplus.core.toolkit.reflect.GenericTypeUtils;
import com.sun.service.core.mapper.BaseMapperPlus;
import com.sun.service.core.service.IService;
import org.springframework.beans.factory.annotation.Autowired;

import java.util.Collection;

/**
 * @author: zjh
 * @Date: 2024年03月24日 18:09
 * @Description: ServiceImpl
 * TODO
 */
public class ServiceImpl<T, M extends BaseMapperPlus<T, V>, V> implements IService<T> {

    @Autowired
    protected M baseMapper;

    protected final Class<?>[] typeArguments = GenericTypeUtils.resolveTypeArguments(this.getClass(), ServiceImpl.class);
    protected final Class<T> entityClass = this.currentModelClass();
    protected final Class<M> mapperClass = this.currentMapperClass();

    protected Class<M> currentMapperClass() {
        return (Class<M>) this.typeArguments[1];
    }

    protected Class<T> currentModelClass() {
        return (Class<T>) this.typeArguments[0];
    }

    @Override
    public boolean insert(T entity) {
        return IService.super.insert(entity);
    }

    @Override
    public boolean updateById(T entity) {
        return IService.super.updateById(entity);
    }

    @Override
    public boolean insertBatch(Collection<T> entityList, int batchSize) {
        return baseMapper.insertBatch(entityList, batchSize);
    }

    @Override
    public boolean insertOrUpdateBatch(Collection<T> entityList, int batchSize) {
        return baseMapper.insertOrUpdateBatch(entityList, batchSize);
    }

    @Override
    public boolean updateBatchById(Collection<T> entityList, int batchSize) {
        return baseMapper.updateBatchById(entityList, batchSize);
    }

    @Override
    public boolean insertOrUpdate(T entity) {
        return baseMapper.insertOrUpdate(entity);
    }

    /**
     * 根据 Wrapper，查询一条记录
     *
     * @param queryWrapper 实体对象封装操作类 {@link QueryWrapper}
     * @param throwEx      有多个 result 是否抛出异常
     */
    @Override
    public T getOne(Wrapper<T> queryWrapper, boolean throwEx) {
        return getBaseMapper().selectOne(queryWrapper, throwEx);
    }

    @Override
    public BaseMapperPlus<T, V> getBaseMapper() {
        return baseMapper;
    }

    @Override
    public Class<T> getEntityClass() {
        return entityClass;
    }
}
