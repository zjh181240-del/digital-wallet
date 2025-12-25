package com.sun.service.core.domian;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonInclude;
import com.sun.service.utils.MapstructUtils;
import io.github.linpeilie.annotations.AutoMapping;
import lombok.Data;

import java.io.Serial;
import java.io.Serializable;
import java.util.HashMap;
import java.util.Map;

/**
 * TODO
 *
 * @author: zjh
 * @Date: 2025年11月10日 17:02
 * @Description: BaseEntityBo
 */
@Data
public class BaseEntityBo extends SimpleSort implements Serializable {

    @Serial
    private static final long serialVersionUID = 1L;

    /**
     * 搜索值
     */
    @JsonIgnore
    @AutoMapping(ignore = true, targetClass = BaseEntityBo.class)
    private String searchValue;

    /**
     * 请求参数
     */
    @JsonInclude(JsonInclude.Include.NON_EMPTY)
    @AutoMapping(ignore = true, targetClass = BaseEntityBo.class)
    private Map<String, String[]> params = new HashMap<>();

    public <T> T to(Class<T> tClass) {
        return MapstructUtils.convert(this, tClass);
    }
}
