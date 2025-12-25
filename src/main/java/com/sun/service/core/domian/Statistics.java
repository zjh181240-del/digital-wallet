package com.sun.service.core.domian;

import lombok.Data;
import lombok.experimental.Accessors;

import java.io.Serializable;

/**
 * 统计通用实体
 *
 * @author: zjh
 * @Date: 2025年11月11日 11:45
 * @Description: Statistics
 */
@Data
@Accessors(chain = true)
public class Statistics<T> {

    /**
     * 名称
     */
    private Serializable name;

    /**
     * 值
     */
    private Serializable value;

    /**
     * 扩展数据
     */
    private T data;
}
