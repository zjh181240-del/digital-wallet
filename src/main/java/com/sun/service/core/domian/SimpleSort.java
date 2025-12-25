package com.sun.service.core.domian;

import cn.hutool.core.collection.CollectionUtil;
import cn.hutool.core.util.ObjectUtil;
import cn.hutool.core.util.StrUtil;
import com.baomidou.mybatisplus.core.metadata.OrderItem;
import com.baomidou.mybatisplus.core.toolkit.support.SFunction;
import com.sun.service.utils.ReflectUtils;
import io.github.linpeilie.annotations.AutoMapping;

import java.io.Serial;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

/**
 * TODO
 *
 * @author: zjh
 * @Date: 2025年11月10日 16:33
 * @Description: SimpleSorting
 */
public class SimpleSort implements ISort {
    @Serial
    private static final long serialVersionUID = 1L;
    /**
     * 排序列
     */
    @AutoMapping(ignore = true, targetClass = SimpleSort.class)
    private String orderByColumn;

    /**
     * 排序的方向desc或者asc
     */
    @AutoMapping(ignore = true, targetClass = SimpleSort.class, target = "isAsc")
    private String isAsc;

    @AutoMapping(ignore = true, targetClass = SimpleSort.class, target = "orderItems")
    private List<OrderItem> orderItems;

    @Override
    public String orderByColumn() {
        return orderByColumn;
    }

    @Override
    public String isAsc() {
        return isAsc;
    }

    /**
     * 构建排序
     */
    @Override
    public List<OrderItem> buildOrderItem() {
        List<OrderItem> orderItems = ISort.super.buildOrderItem();
        if (CollectionUtil.isNotEmpty(orderItems)) {
            _getOrders().addAll(orderItems);
        }
        return this.orderItems;
    }

    private List<OrderItem> _getOrders() {
        if (ObjectUtil.isNull(orderItems)) {
            orderItems = new ArrayList<>();
        }
        return orderItems;
    }

    /**
     * 添加新的排序条件，构造条件可以使用工厂
     *
     * @param items 条件
     * @return
     */
    public void addOrder(OrderItem... items) {
        _getOrders().addAll(Arrays.asList(items));
    }

    /**
     * 添加新的排序条件，构造条件可以使用工厂
     *
     * @param items 条件
     * @return
     */
    public void addOrder(List<OrderItem> items) {
        _getOrders().addAll(items);
    }

    public <T> void addOrder(SFunction<T, ?> columnFun, boolean isAsc) {
        String column = StrUtil.toUnderlineCase(ReflectUtils.getFieldName(columnFun));
        if (isAsc) {
            _getOrders().add(OrderItem.asc(column));
        } else {
            _getOrders().add(OrderItem.desc(column));
        }
    }

    public <T> void addOrder(SFunction<T, ?> columnFun) {
        addOrder(columnFun, true);
    }


    public String getOrderByColumn() {
        return orderByColumn;
    }

    public void setOrderByColumn(String orderByColumn) {
        this.orderByColumn = orderByColumn;
    }

    public String getIsAsc() {
        return isAsc;
    }

    public void setIsAsc(String isAsc) {
        this.isAsc = isAsc;
    }
}
