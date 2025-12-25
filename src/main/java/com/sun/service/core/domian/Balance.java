package com.sun.service.core.domian;

import lombok.Data;

/**
 * TODO
 *
 * @author: zjh
 * @Date: 2025年12月23日 17:42
 * @Description: Balance
 */
@Data
public class Balance {
    /**
     * 原生币余额
     */
    private String nativeCurrency;
    /**
     * USDT余额
     */
    private String usdt;
}
