package com.sun.service.validation;

import cn.hutool.core.util.ObjectUtil;
import com.baomidou.mybatisplus.annotation.IEnum;
import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;
import org.springframework.util.Assert;

/**
 * TODO
 *
 * @author: zjh
 * @Date: 2025年11月24日 10:12
 * @Description: EnumerableValidator
 */
public class EnumerableValidator implements ConstraintValidator<Enumerable, Object> {

    private Class<? extends IEnum<?>> enumClass;

    /**
     * Initializes the validator in preparation for
     * {@link #isValid(Object, ConstraintValidatorContext)} calls.
     * The constraint annotation for a given constraint declaration
     * is passed.
     * <p>
     * This method is guaranteed to be called before any use of this instance for
     * validation.
     * <p>
     * The default implementation is a no-op.
     *
     * @param constraintAnnotation annotation instance for a given constraint declaration
     */
    @Override
    public void initialize(Enumerable constraintAnnotation) {
        ConstraintValidator.super.initialize(constraintAnnotation);
        this.enumClass = constraintAnnotation.enumClass();
        Assert.notNull(this.enumClass, "enumClass must not be null");
        Assert.isTrue(this.enumClass.isEnum(), "enumClass must be an enum");
    }

    /**
     * Implements the validation logic.
     * The state of {@code value} must not be altered.
     * <p>
     * This method can be accessed concurrently, thread-safety must be ensured
     * by the implementation.
     *
     * @param value   object to validate
     * @param context context in which the constraint is evaluated
     * @return {@code false} if {@code value} does not pass the constraint
     */
    @Override
    public boolean isValid(Object value, ConstraintValidatorContext context) {
        /**
         * 如果值为null，则不进行校验
         */
        if (value == null) {
            return true;
        }
        for (IEnum<?> enumConstant : enumClass.getEnumConstants()) {
            if (ObjectUtil.equals(enumConstant.getValue(), value)) {
                return true;
            }
        }
        return false;
    }
}
