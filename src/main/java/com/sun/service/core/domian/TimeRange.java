package com.sun.service.core.domian;

import cn.hutool.core.date.DateUtil;
import cn.hutool.core.util.ObjectUtil;
import com.baomidou.mybatisplus.core.toolkit.support.SFunction;
import com.sun.service.core.enums.DateTypeEnum;

import java.util.Date;

/**
 * TODO
 *
 * @author: zjh
 * @Date: 2025年11月11日 15:31
 * @Description: TimeRange
 */
public interface TimeRange<T> {

    Date startTime();

    Date endTime();

    DateTypeEnum dateType();

    String filterProperty();

    SFunction<T, Date> filterFun();

    default Date formatStartTime() {
        if (ObjectUtil.isNotNull(startTime()) && ObjectUtil.isNotNull(dateType())) {
            return DateUtil.truncate(startTime(), dateType().getField());
        }
        return startTime();
    }

    default Date formatEndTime() {
        if (ObjectUtil.isNotNull(endTime()) && ObjectUtil.isNotNull(dateType())) {
            return DateUtil.ceiling(endTime(), dateType().getField());
        }
        return endTime();
    }

}
