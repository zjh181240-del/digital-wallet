package com.sun.service.utils;

import cn.hutool.core.date.DateUtil;
import org.apache.commons.lang3.time.DateFormatUtils;

import java.util.Date;

/**
 * TODO
 *
 * @author: zjh
 * @Date: 2025年11月18日 13:42
 * @Description: DateUtils
 */
public class DateUtils extends DateUtil {

    /**
     * 日期路径 即年/月/日 如2018/08/08
     */
    public static String datePath() {
        Date now = new Date();
        return DateFormatUtils.format(now, "yyyy/MM/dd");
    }
}
