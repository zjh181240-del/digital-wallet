package com.sun.service.config.web3;

import com.sun.service.config.properties.BlockchainProperties;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.web3j.protocol.Web3j;
import org.web3j.protocol.http.HttpService;

/**
 * TODO
 *
 * @author: zjh
 * @Date: 2025年12月23日 17:18
 * @Description: Web3Config
 */
@RequiredArgsConstructor
@EnableConfigurationProperties(BlockchainProperties.class)
@Configuration
public class Web3Config {

    private final BlockchainProperties ethereumProperties;

    @Bean
    public Web3jWrapper web3jConfigPolygon() {
        Web3j web3j = Web3j.build(new HttpService(ethereumProperties.getPolygon().getRpcUrl()));
        return new Web3jWrapper(web3j, ethereumProperties.getPolygon());
    }

    @Bean
    public Web3jWrapper web3jConfigBnb() {
        Web3j web3j = Web3j.build(new HttpService(ethereumProperties.getBnb().getRpcUrl()));
        return new Web3jWrapper(web3j, ethereumProperties.getBnb());
    }
}
