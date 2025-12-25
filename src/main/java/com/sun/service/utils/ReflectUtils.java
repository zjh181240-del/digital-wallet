package com.sun.service.utils;

import cn.hutool.core.date.StopWatch;
import cn.hutool.core.util.ReflectUtil;
import cn.hutool.core.util.StrUtil;
import com.baomidou.mybatisplus.core.toolkit.support.SFunction;
import lombok.AccessLevel;
import lombok.NoArgsConstructor;
import org.springframework.util.ClassUtils;
import org.springframework.util.ReflectionUtils;

import java.beans.Introspector;
import java.lang.invoke.MethodHandle;
import java.lang.invoke.MethodHandles;
import java.lang.invoke.MethodType;
import java.lang.invoke.SerializedLambda;
import java.lang.reflect.Field;
import java.lang.reflect.Method;
import java.util.Collection;
import java.util.HashSet;
import java.util.Map;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;
import java.util.function.Function;

/**
 * 反射工具类. 提供调用getter/setter方法, 访问私有变量, 调用私有方法, 获取泛型类型Class, 被AOP过的真实类等工具函数.
 *
 * @author zjh
 */
@SuppressWarnings("rawtypes")
@NoArgsConstructor(access = AccessLevel.PRIVATE)
public class ReflectUtils extends ReflectUtil {

    private static final String SETTER_PREFIX = "set";

    private static final String GETTER_PREFIX = "get";

    private static Map<SFunction<?, ?>, Field> cache = new ConcurrentHashMap<>();

    public static <T, R> Function<T, R> getGetter(Class<T> clazz, String propertyName) {
        // 1. 查找标准 getter (getXxx)
        String getterName = GETTER_PREFIX + StrUtil.upperFirst(propertyName);
        Method method = ReflectUtil.getPublicMethod(clazz, getterName);
        return (obj) -> invoke(obj, method);
    }


    public static <T, R> Function<T, R> getGetterWithMH(Class<T> clazz, String propertyName) {
        try {
            MethodHandles.Lookup lookup = MethodHandles.lookup();
            String getterName = GETTER_PREFIX + StrUtil.upperFirst(propertyName);
            // 查找方法
            Method method = ReflectUtil.getPublicMethod(clazz, getterName);
            Class<?> returnType = method.getReturnType();
            MethodHandle mh = lookup.findVirtual(clazz, getterName, MethodType.methodType(returnType));
            // 转换为 Function
            return (obj) -> {
                try {
                    return (R) mh.invoke(obj);
                } catch (Throwable e) {
                    throw new RuntimeException(e);
                }
            };
        } catch (ReflectiveOperationException e) {
            throw new RuntimeException(e);
        }
    }

    /**
     * 调用Getter方法.
     * 支持多级，如：对象名.对象名.方法
     */
    @SuppressWarnings("unchecked")
    public static <E> E invokeGetter(Object obj, String propertyName) {
        Object object = obj;
        for (String name : StringUtils.splitToArray(propertyName, ".")) {
            String getterMethodName = GETTER_PREFIX + StringUtils.upperFirst(name);
            object = invoke(object, getterMethodName);
        }
        return (E) object;
    }

    /**
     * 调用Setter方法, 仅匹配方法名。
     * 支持多级，如：对象名.对象名.方法
     */
    public static <E> void invokeSetter(Object obj, String propertyName, E value) {
        Object object = obj;
        String[] names = StringUtils.splitToArray(propertyName, ".");
        for (int i = 0; i < names.length; i++) {
            if (i < names.length - 1) {
                String getterMethodName = GETTER_PREFIX + StringUtils.upperFirst(names[i]);
                object = invoke(object, getterMethodName);
            } else {
                String setterMethodName = SETTER_PREFIX + StringUtils.upperFirst(names[i]);
                Method method = getMethodByName(object.getClass(), setterMethodName);
                invoke(object, method, value);
            }
        }
    }


    public static <T, R> Set<String> getFieldNames(Collection<SFunction<T, R>> sFunctions) {
        Set<String> fieldNames = new HashSet<>(sFunctions.size() + 1);

        for (SFunction<T, R> trSFunction : sFunctions) {
            fieldNames.add(getFieldName(trSFunction));
        }
        return fieldNames;
    }

    public static <T, R> String getFieldName(SFunction<T, R> SFunction) {
        Field field = getField(SFunction);
        return field.getName();
    }

    public static Field getField(SFunction<?, ?> sFunction) {
        return cache.computeIfAbsent(sFunction, ReflectUtils::findField);
    }

    public static Field findField(SFunction<?, ?> sFunction) {
        Field field = null;
        String fieldName = null;
        try {
            // 第1步 获取SerializedLambda
            Method method = sFunction.getClass().getDeclaredMethod("writeReplace");
            method.setAccessible(Boolean.TRUE);
            SerializedLambda serializedLambda = (SerializedLambda) method.invoke(sFunction);
            // 第2步 implMethodName 即为Field对应的Getter方法名
            String implMethodName = serializedLambda.getImplMethodName();
            if (implMethodName.startsWith("get") && implMethodName.length() > 3) {
                fieldName = Introspector.decapitalize(implMethodName.substring(3));

            } else if (implMethodName.startsWith("is") && implMethodName.length() > 2) {
                fieldName = Introspector.decapitalize(implMethodName.substring(2));
            } else if (implMethodName.startsWith("lambda$")) {
                throw new IllegalArgumentException("SerializableSFunction不能传递lambda表达式,只能使用方法引用");

            } else {
                throw new IllegalArgumentException(implMethodName + "不是Getter方法引用");
            }
            // 第3步 获取的Class是字符串，并且包名是“/”分割，需要替换成“.”，才能获取到对应的Class对象
            String declaredClass = serializedLambda.getImplClass().replace("/", ".");
            Class<?> aClass = Class.forName(declaredClass, false, ClassUtils.getDefaultClassLoader());

            // 第4步  Spring 中的反射工具类获取Class中定义的Field
            field = ReflectionUtils.findField(aClass, fieldName);

        } catch (Exception e) {
            e.printStackTrace();
        }
        // 第5步 如果没有找到对应的字段应该抛出异常
        if (field != null) {
            return field;
        }
        throw new NoSuchFieldError(fieldName);
    }


}
