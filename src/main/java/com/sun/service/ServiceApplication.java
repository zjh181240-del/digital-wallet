package com.sun.service;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

/**
 * 特别注意 sqlite的日期 当查询日期范围的时候 日期格式一定要严格一样 否则查询不到数据 且查询条件要为 string
 * 建议表日期格式统一 DATETIME
 */
@SpringBootApplication
public class ServiceApplication {

    public static void main(String[] args) {
        SpringApplication.run(ServiceApplication.class, args);
        System.out.println("(♥◠‿◠)ﾉﾞ  GisInfo-Serve 启动成功   ლ(´ڡ`ლ)ﾞ");
    }

}
