package com.sun.service.core.domian;

import com.baomidou.mybatisplus.core.metadata.OrderItem;
import com.sun.service.exceptions.ServiceException;
import com.sun.service.utils.SqlUtil;
import com.sun.service.utils.StringUtils;

import java.util.ArrayList;
import java.util.List;

/**
 * TODO
 *
 * @author: zjh
 * @Date: 2025年11月10日 16:14
 * @Description: ISorting
 */
public interface ISort {

    String orderByColumn();

    String isAsc();

    default boolean sort() {
        return !(StringUtils.isBlank(orderByColumn()) || StringUtils.isBlank(isAsc()));
    }

    /**
     * 构建排序
     * <p>
     * 支持的用法如下:
     * {isAsc:"asc",orderByColumn:"id"} order by id asc
     * {isAsc:"asc",orderByColumn:"id,createTime"} order by id asc,create_time asc
     * {isAsc:"desc",orderByColumn:"id,createTime"} order by id desc,create_time desc
     * {isAsc:"asc,desc",orderByColumn:"id,createTime"} order by id asc,create_time desc
     */
    default List<OrderItem> buildOrderItem() {
        if (!sort()) {
            return null;
        }
        String isAsc = isAsc();

        String orderBy = SqlUtil.escapeOrderBySql(orderByColumn());
        orderBy = StringUtils.toUnderlineCase(orderBy);

        // 兼容前端排序类型
        isAsc = org.apache.commons.lang3.StringUtils.replaceEach(isAsc, new String[]{"ascending", "descending"}, new String[]{"asc", "desc"});

        String[] orderByArr = orderBy.split(StringUtils.COMMA);
        String[] isAscArr = isAsc.split(StringUtils.COMMA);
        if (isAscArr.length != 1 && isAscArr.length != orderByArr.length) {
            throw new ServiceException("排序参数有误");
        }

        List<OrderItem> list = new ArrayList<>();
        // 每个字段各自排序
        for (int i = 0; i < orderByArr.length; i++) {
            String orderByStr = orderByArr[i];
            String isAscStr = isAscArr.length == 1 ? isAscArr[0] : isAscArr[i];
            if ("asc".equals(isAscStr)) {
                list.add(OrderItem.asc(orderByStr));
            } else if ("desc".equals(isAscStr)) {
                list.add(OrderItem.desc(orderByStr));
            } else {
                throw new ServiceException("排序参数有误");
            }
        }
        return list;
    }
}
