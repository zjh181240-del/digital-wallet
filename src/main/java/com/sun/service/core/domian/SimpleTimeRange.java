package com.sun.service.core.domian;

import com.baomidou.mybatisplus.core.toolkit.support.SFunction;
import com.sun.service.core.enums.DateTypeEnum;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.util.Date;

/**
 * 时间范围参数实体
 *
 * @author: zjh
 * @Date: 2025年11月11日 15:39
 * @Description: SimpleTimeRange
 */
@Data
public class SimpleTimeRange<T> implements TimeRange<T> {

    /**
     * 开始时间
     */
    @NotNull(message = "开始时间不能为空")
    private Date startTime;
    /**
     * 结束时间
     */
    @NotNull(message = "结束时间不能为空")
    private Date endTime;
    /**
     * 时间类型 枚举类型为：YEAR、MONTH、DAY
     */
    @NotNull(message = "时间类型不能为空")
    private DateTypeEnum dateType;

    private SFunction<T, Date> filterFun;
    /**
     * 过滤属性
     */
    private String filterProperty;

    @Override
    public Date startTime() {
        return startTime;
    }

    @Override
    public Date endTime() {
        return endTime;
    }

    @Override
    public DateTypeEnum dateType() {
        return dateType;
    }

    @Override
    public String filterProperty() {
        return filterProperty;
    }

    @Override
    public SFunction<T, Date> filterFun() {
        return filterFun;
    }
}
