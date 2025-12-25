package com.sun.service.web3.enums;

import com.baomidou.mybatisplus.annotation.IEnum;
import lombok.Getter;

/**
 * TODO
 *
 * @author: zjh
 * @Date: 2025年12月23日 17:05
 * @Description: ChainEnum
 */
@Getter
public enum ChainEnum implements IEnum<String> {

    POLYGON("polygon", "Polygon链"),
    BNB("bnb", "BNB Chain链");
    private String value;

    private String desc;

    ChainEnum(String value, String desc) {
        this.value = value;
        this.desc = desc;
    }
}
