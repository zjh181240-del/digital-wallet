package com.sun.service.validation;

import com.baomidou.mybatisplus.annotation.IEnum;
import jakarta.validation.Constraint;
import jakarta.validation.Payload;

import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

/**
 * TODO
 *
 * @author: zjh
 * @Date: 2025年11月24日 10:10
 * @Description: Enumerable
 */
@Target({ElementType.FIELD})
@Retention(RetentionPolicy.RUNTIME)
@Constraint(validatedBy = EnumerableValidator.class)
public @interface Enumerable {

    String message() default "该值不在枚举范围内";

    Class<? extends IEnum<?>> enumClass();

    Class<?>[] groups() default {};

    Class<? extends Payload>[] payload() default {};
}
