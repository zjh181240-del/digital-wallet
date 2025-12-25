package com.sun.service.web3.domain.vo;

import com.sun.service.web3.domain.TWalletAddress;
import io.github.linpeilie.annotations.AutoMapper;
import lombok.Data;

import java.io.Serial;
import java.io.Serializable;


/**
 * 钱包地址，关联用户与其在不同区块链上的地址视图对象 t_wallet_address
 *
 * @author zjh
 * @date 2025-12-22
 */
@Data
@AutoMapper(target = TWalletAddress.class, convertGenerate = false)
public class TWalletAddressVo implements Serializable {

    @Serial
    private static final long serialVersionUID = 1L;

    /**
     * 主键
     */
    private String id;

    /**
     * 用户ID
     */
    private String userId;

    /**
     * 区块链网络类型，例如 polygon 或 bsc
     */
    private String chain;

    /**
     * 私钥
     */
    private String privateKey;

    /**
     * 区块链上的钱包地址（EVM地址，以0x开头，共42字符）
     */
    private String address;

    /**
     * 该钱包地址记录的创建时间
     */
    private String createdAt;


}
