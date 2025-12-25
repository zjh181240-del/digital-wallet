package com.sun.service.config.properties;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.boot.context.properties.NestedConfigurationProperty;

/**
 * TODO
 *
 * @author: zjh
 * @Date: 2025年12月23日 16:08
 * @Description: EthereumProperties
 */
@Data
@ConfigurationProperties(prefix = "blockchain")
public class BlockchainProperties {

    @NestedConfigurationProperty
    private Config polygon;

    @NestedConfigurationProperty
    private Config bnb;

    @Data
    public static class Config {
        /**
         * RPC地址
         */
        private String rpcUrl;
        /**
         * USDT合约地址
         */
        private String usdtContract;
        /**
         * 链 ID
         */
        private String chainId;
    }
}
