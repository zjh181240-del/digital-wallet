package com.sun.service.core.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.toolkit.support.SFunction;
import com.sun.service.core.page.PageQuery;
import com.sun.service.core.page.TableDataInfo;

import java.io.Serializable;
import java.util.List;
import java.util.function.Consumer;

/**
 * @author: zjh
 * @Date: 2024年03月24日 18:19
 * @Description: IBoService
 * TODO
 */
public interface IBoService<T, V, B> extends IService<T> {

    public V queryById(Serializable id);

    default TableDataInfo<V> queryPageList(B bo, PageQuery pageQuery, SFunction<T, ?>... columns) {
        return queryPageList(bo, pageQuery, null, columns);
    }

    public TableDataInfo<V> queryPageList(B bo, PageQuery pageQuery, Consumer<LambdaQueryWrapper<T>> consumer, SFunction<T, ?>... columns);

    public List<V> queryList(B bo, Consumer<LambdaQueryWrapper<T>> consumer, SFunction<T, ?>... columns);

    default List<V> queryList(B bo, SFunction<T, ?>... columns) {
        return queryList(bo, null, columns);
    }
}
