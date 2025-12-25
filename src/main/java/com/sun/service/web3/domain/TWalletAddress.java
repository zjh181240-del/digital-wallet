package com.sun.service.web3.domain;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.io.Serial;

/**
 * 钱包地址，关联用户与其在不同区块链上的地址对象 t_wallet_address
 *
 * @author zjh
 * @date 2025-12-22
 */
@Data
@TableName("t_wallet_address")
public class TWalletAddress {

    @Serial
    private static final long serialVersionUID = 1L;

    /**
     * 主键
     */
    @TableId(value = "id")
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
     * 区块链上的钱包地址（EVM地址，以0x开头，共42字符）
     */
    private String address;

    /**
     * 私钥（AES加密存储）
     */
    private String privateKey;

    /**
     * 助记词（AES加密存储）
     */
    private String mnemonic;

    /**
     * 该钱包地址记录的创建时间
     */
    private String createdAt;


}
