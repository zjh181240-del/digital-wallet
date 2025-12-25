package com.sun.service.config.mybatis.type;

import cn.hutool.core.date.DatePattern;
import cn.hutool.core.date.DateUtil;
import org.apache.ibatis.type.BaseTypeHandler;
import org.apache.ibatis.type.JdbcType;

import java.sql.CallableStatement;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.Date;

public class DateTypeHandler extends BaseTypeHandler<Date> {

//    private static final SimpleDateFormat format = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss");
    @Override
    public void setNonNullParameter(PreparedStatement ps, int i, Date parameter, JdbcType jdbcType) throws SQLException {
        ps.setString(i, DateUtil.format(parameter, DatePattern.NORM_DATETIME_PATTERN));
    }

    @Override
    public Date getNullableResult(ResultSet rs, String columnName) throws SQLException {
        String dateStr = rs.getString(columnName);
        try {
            return dateStr == null ? null : DateUtil.parse(dateStr);
        } catch (Exception e) {
            throw new SQLException("Failed to parse date: " + dateStr, e);
        }
    }

    @Override
    public Date getNullableResult(ResultSet rs, int columnIndex) throws SQLException {
        String dateStr = rs.getString(columnIndex);
        try {
            return dateStr == null ? null : DateUtil.parse(dateStr);
        } catch (Exception e) {
            throw new SQLException("Failed to parse date: " + dateStr, e);
        }
    }

    @Override
    public Date getNullableResult(CallableStatement cs, int columnIndex) throws SQLException {
        String dateStr = cs.getString(columnIndex);
        try {
            return dateStr == null ? null : DateUtil.parse(dateStr);
        } catch (Exception e) {
            throw new SQLException("Failed to parse date: " + dateStr, e);
        }
    }
}
