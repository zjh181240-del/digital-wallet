package com.sun.service.core.service;

import com.baomidou.mybatisplus.core.conditions.Wrapper;
import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.baomidou.mybatisplus.core.toolkit.CollectionUtils;
import com.baomidou.mybatisplus.core.toolkit.Wrappers;
import com.baomidou.mybatisplus.extension.toolkit.SqlHelper;
import org.springframework.transaction.annotation.Transactional;

import java.io.Serializable;
import java.util.Collection;
import java.util.List;
import java.util.Optional;

/**
 * @author: zjh
 * @Date: 2024年03月24日 17:58
 * @Description: IService
 * TODO
 */
public interface IService<T> {

    int DEFAULT_BATCH_SIZE = 1000;

    default boolean insert(T entity) {
        return SqlHelper.retBool(this.getBaseMapper().insert(entity));
    }

    @Transactional(
        rollbackFor = {Exception.class}
    )
    default boolean insertBatch(Collection<T> entityList) {
        return this.insertBatch(entityList, DEFAULT_BATCH_SIZE);
    }

    boolean insertBatch(Collection<T> entityList, int batchSize);

    @Transactional(
        rollbackFor = {Exception.class}
    )
    default boolean insertOrUpdateBatch(Collection<T> entityList) {
        return this.insertOrUpdateBatch(entityList, DEFAULT_BATCH_SIZE);
    }

    boolean insertOrUpdateBatch(Collection<T> entityList, int batchSize);

    default boolean deleteById(Serializable id) {
        return SqlHelper.retBool(this.getBaseMapper().deleteById(id));
    }

    default boolean deleteById(Serializable id, boolean useFill) {
        throw new UnsupportedOperationException("不支持的方法!");
    }

    default boolean deleteById(T entity) {
        return SqlHelper.retBool(this.getBaseMapper().deleteById(entity));
    }

    default boolean delete(Wrapper<T> queryWrapper) {
        return SqlHelper.retBool(getBaseMapper().delete(queryWrapper));
    }

    default boolean deleteByIds(Collection<? extends Serializable> list) {
        return CollectionUtils.isEmpty(list) ? false : SqlHelper.retBool(this.getBaseMapper().deleteBatchIds(list));
    }

    default boolean updateById(T entity) {
        return SqlHelper.retBool(this.getBaseMapper().updateById(entity));
    }
    @Transactional(
        rollbackFor = {Exception.class}
    )
    default boolean updateBatchById(Collection<T> entityList) {
        return this.updateBatchById(entityList, 1000);
    }

    boolean updateBatchById(Collection<T> entityList, int batchSize);

    boolean insertOrUpdate(T entity);

    default T getById(Serializable id) {
        return this.getBaseMapper().selectById(id);
    }

    default Optional<T> getOptById(Serializable id) {
        return Optional.ofNullable(this.getBaseMapper().selectById(id));
    }

    default T getOne(Wrapper<T> queryWrapper) {
        return getOne(queryWrapper, true);
    }

    /**
     * 根据 Wrapper，查询一条记录
     *
     * @param queryWrapper 实体对象封装操作类 {@link com.baomidou.mybatisplus.core.conditions.query.QueryWrapper}
     * @param throwEx      有多个 result 是否抛出异常
     */
    T getOne(Wrapper<T> queryWrapper, boolean throwEx);

    /**
     * 查询列表
     *
     * @param queryWrapper 实体对象封装操作类 {@link com.baomidou.mybatisplus.core.conditions.query.QueryWrapper}
     */
    default List<T> selectList(Wrapper<T> queryWrapper) {
        return getBaseMapper().selectList(queryWrapper);
    }

    default List<T> selectByIds(Collection<? extends Serializable> idList) {
        return this.getBaseMapper().selectBatchIds(idList);
    }
    default long count() {
        return this.count(Wrappers.emptyWrapper());
    }

    default long count(Wrapper<T> queryWrapper) {
        return SqlHelper.retCount(this.getBaseMapper().selectCount(queryWrapper));
    }

    BaseMapper<T> getBaseMapper();

    Class<T> getEntityClass();

}
