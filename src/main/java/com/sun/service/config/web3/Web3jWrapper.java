package com.sun.service.config.web3;

import com.sun.service.config.properties.BlockchainProperties;
import lombok.Data;
import org.web3j.protocol.Web3j;

import java.io.Serializable;

/**
 * TODO
 *
 * @author: zjh
 * @Date: 2025年12月23日 17:19
 * @Description: Web3jWrapper
 */
@Data
public class Web3jWrapper implements Serializable {
    private static final long serialVersionUID = 1L;

    public Web3jWrapper(Web3j web3j, BlockchainProperties.Config config) {
        this.web3j = web3j;
        this.config = config;
    }

    private Web3j web3j;

    private BlockchainProperties.Config config;
}
