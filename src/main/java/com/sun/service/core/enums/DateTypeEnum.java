package com.sun.service.core.enums;

import cn.hutool.core.date.DateField;
import lombok.Getter;

/**
 * 统计的时候使用枚举
 * 一般只有按照年月日进行统计
 *
 * @author: zjh
 * @Date: 2025年11月11日 15:36
 * @Description: DateTypeEnum
 */
@Getter
public enum DateTypeEnum {

    YEAR(DateField.YEAR, "yyyy"),
    MONTH(DateField.MONTH, "yyyy-MM"),
    DAY(DateField.DAY_OF_MONTH, "yyyy-MM-dd");

    private DateField field;

    private String format;

    DateTypeEnum(DateField field, String format) {
        this.field = field;
        this.format = format;
    }
}
