package com.sun.service.core.service.impl;

import cn.hutool.core.collection.CollectionUtil;
import cn.hutool.core.convert.Convert;
import cn.hutool.core.date.DatePattern;
import cn.hutool.core.date.DateUtil;
import cn.hutool.core.util.ArrayUtil;
import cn.hutool.core.util.ObjectUtil;
import cn.hutool.core.util.ReflectUtil;
import cn.hutool.core.util.StrUtil;
import com.baomidou.mybatisplus.annotation.SqlCondition;
import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.baomidou.mybatisplus.core.metadata.*;
import com.baomidou.mybatisplus.core.toolkit.Wrappers;
import com.baomidou.mybatisplus.core.toolkit.support.SFunction;
import com.sun.service.core.domian.BaseEntityBo;
import com.sun.service.core.domian.ISort;
import com.sun.service.core.domian.TimeRange;
import com.sun.service.core.mapper.BaseMapperPlus;
import com.sun.service.core.page.PageQuery;
import com.sun.service.core.page.TableDataInfo;
import com.sun.service.core.service.IBoService;
import com.sun.service.utils.MapstructUtils;
import com.sun.service.utils.query.QueryGenerator;
import com.sun.service.core.mapper.BaseMapperPlus;
import com.sun.service.core.service.IBoService;

import java.io.Serializable;
import java.util.Date;
import java.util.List;
import java.util.Optional;
import java.util.function.Consumer;
import java.util.stream.Collectors;

/**
 * @author: zjh
 * @Date: 2024年03月24日 18:18
 * @Description: BoServiceImpl
 * TODO
 */
public class BoServiceImpl<T, M extends BaseMapperPlus<T, V>, V, B> extends ServiceImpl<T, M, V> implements IBoService<T, V, B> {

    @Override
    public V queryById(Serializable id) {
        return getBaseMapper().selectVoById(id);
    }

    @Override
    public TableDataInfo<V> queryPageList(B bo, PageQuery pageQuery, Consumer<LambdaQueryWrapper<T>> consumer, SFunction<T, ?>... columns) {
        LambdaQueryWrapper<T> queryWrapper = buildQueryWrapper(bo, false);
        if (ObjectUtil.isNotNull(consumer)) {
            consumer.accept(queryWrapper);
        }
        if (ArrayUtil.isNotEmpty(columns)) {
            queryWrapper.select(columns);
        }
        IPage<V> page = getBaseMapper().selectVoPage(pageQuery.build(), queryWrapper);

        return TableDataInfo.build(page);
    }

    protected LambdaQueryWrapper<T> buildQueryWrapper(B bo) {
        return buildQueryWrapper(bo, true);
    }

    protected LambdaQueryWrapper<T> buildQueryWrapper(B bo, boolean buildSort) {
        return buildQueryWrapper(bo, null, buildSort);
    }

    protected LambdaQueryWrapper<T> buildTimeRangeQueryWrapper(B bo, TimeRange<T> timeRange, boolean buildSort) {
        if (ObjectUtil.isNull(timeRange)
                || ObjectUtil.isNull(timeRange.dateType())
                || (ObjectUtil.isNull(timeRange.startTime()) && ObjectUtil.isNull(timeRange.endTime()))
                || (ObjectUtil.isNull(timeRange.filterFun()) && StrUtil.isEmpty(timeRange.filterProperty()))) {
            throw new RuntimeException("时间范围参数错误！");
        }
        SFunction<T, ?> filterFun = timeRange.filterFun();

        Date startTime = timeRange.formatStartTime();
        Date endTime = timeRange.formatEndTime();

        /**
         * 时间字段为SFunction
         * 直接使用lambda
         */
        if (ObjectUtil.isNotNull(filterFun)) {
            LambdaQueryWrapper<T> queryWrapper = buildQueryWrapper(bo, null, buildSort);
            queryWrapper.isNotNull(filterFun);
            if (ObjectUtil.isNotNull(startTime) && ObjectUtil.isNotNull(endTime)) {
                queryWrapper.between(filterFun, startTime, endTime);
            } else {
                if (ObjectUtil.isNotNull(startTime)) {
                    queryWrapper.ge(filterFun, startTime);
                }
                if (ObjectUtil.isNotNull(endTime)) {
                    queryWrapper.le(filterFun, endTime);
                }
            }
            return queryWrapper;
        }
        /**
         * 时间字段为字符串
         * 使用queryWrapper
         */
        QueryWrapper<T> queryWrapper = Wrappers.query();
        String property = timeRange.filterProperty();
        TableInfo tableInfo = TableInfoHelper.getTableInfo(currentModelClass());
        TableFieldInfo tableFieldInfo = tableInfo.getFieldList().stream().filter(item -> StrUtil.equals(item.getProperty(), property) ||
                        StrUtil.equals(item.getColumn(), timeRange.filterProperty())).findFirst()
                .orElseThrow(() -> new RuntimeException("表[" + tableInfo.getTableName() + "]中未找到字段 [" + property + "]！"));
        String column = tableFieldInfo.getColumn();
        queryWrapper.isNotNull(column);
        if (ObjectUtil.isNotNull(startTime) && ObjectUtil.isNotNull(endTime)) {
            queryWrapper.between(column, DateUtil.format(startTime, DatePattern.NORM_DATE_PATTERN), DateUtil.format(endTime, DatePattern.NORM_DATE_PATTERN));
        } else {
            if (ObjectUtil.isNotNull(startTime)) {
                queryWrapper.ge(column, startTime);
            }
            if (ObjectUtil.isNotNull(endTime)) {
                queryWrapper.le(column, endTime);
            }
        }
        return buildQueryWrapper(bo, queryWrapper, buildSort);
    }

    /**
     * @param bo
     * @param buildSort 是否构建排序，当查询为分页的时候不需要构建排序
     * @return
     */
    protected LambdaQueryWrapper<T> buildQueryWrapper(B bo, QueryWrapper<T> queryWrapper, boolean buildSort) {
        if (ObjectUtil.isNotNull(bo)) {
            if (ObjectUtil.isNull(queryWrapper)) {
                queryWrapper = Wrappers.query();
            }
            if (buildSort && bo instanceof ISort sort) {
                List<OrderItem> orders = sort.buildOrderItem();
                if (CollectionUtil.isNotEmpty(orders)) {
                    for (OrderItem order : orders) {
                        queryWrapper.orderBy(true, order.isAsc(), order.getColumn());
                    }
                }
            }
            if (bo instanceof BaseEntityBo baseEntityBo) {
                fillSearchValue(baseEntityBo, queryWrapper);
                QueryGenerator.initQueryWrapper(queryWrapper, MapstructUtils.convert(bo, getEntityClass()), baseEntityBo.getParams());
            }

            return queryWrapper.lambda();
        }
        return ObjectUtil.isNotNull(queryWrapper) ? queryWrapper.lambda() : Wrappers.lambdaQuery();
    }

    private void fillSearchValue(BaseEntityBo bo, QueryWrapper<T> queryWrapper) {
        final String searchValue = bo.getSearchValue();
        if (StrUtil.isNotEmpty(searchValue)) {
            T entity = MapstructUtils.convert(bo, getEntityClass());

            TableInfo tableInfo = TableInfoHelper.getTableInfo(getEntityClass());
            List<TableFieldInfo> fieldList = tableInfo.getFieldList();

            fieldList.stream().filter(tableFieldInfo -> {
                /**
                 * 注意这里只能使用一下几种模糊查询才会生效 不能使用自定义的，如果使用自定义的请更改以下逻辑
                 */
                if (StrUtil.equalsAny(tableFieldInfo.getCondition(), SqlCondition.LIKE, SqlCondition.LIKE_RIGHT, SqlCondition.LIKE_LEFT, SqlCondition.ORACLE_LIKE)) {
                    if (tableFieldInfo.getPropertyType() == String.class) {
                        // 只对空值做处理
                        String value = Convert.toStr(ReflectUtil.getFieldValue(entity, tableFieldInfo.getField()));
                        return StrUtil.isEmpty(value);
                    }
                }
                return Boolean.FALSE;
            }).collect(Collectors.toList()).forEach(tableFieldInfo ->
                    queryWrapper.and((wrapper) -> {
                        switch (tableFieldInfo.getCondition()) {
                            case SqlCondition.LIKE:
                            case SqlCondition.ORACLE_LIKE:
                                wrapper.like(tableFieldInfo.getColumn(), searchValue);
                                break;
                            case SqlCondition.LIKE_RIGHT:
                                wrapper.likeRight(tableFieldInfo.getColumn(), searchValue);
                                break;
                            case SqlCondition.LIKE_LEFT:
                                wrapper.likeLeft(tableFieldInfo.getColumn(), searchValue);
                                break;
                        }
                    })
            );

        }
    }

    @Override
    public List<V> queryList(B bo, Consumer<LambdaQueryWrapper<T>> consumer, SFunction<T, ?>... columns) {
        LambdaQueryWrapper<T> queryWrapper = buildQueryWrapper(bo);
        Optional.ofNullable(consumer).ifPresent(item -> item.accept(queryWrapper));
        return getBaseMapper().selectVoList(queryWrapper);
    }

}
