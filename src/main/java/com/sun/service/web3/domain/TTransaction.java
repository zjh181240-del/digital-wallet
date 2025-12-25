package com.sun.service.web3.domain;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.io.Serial;

/**
 * 交易记录，记录用户发起的所有区块链交易对象 t_transaction
 *
 * @author zjh
 * @date 2025-12-22
 */
@Data
@TableName("t_transaction")
public class TTransaction {

    @Serial
    private static final long serialVersionUID = 1L;

    /**
     * 主键
     */
    @TableId(value = "id")
    private String id;

    /**
     * 发起交易的用户ID
     */
    private String userId;

    /**
     * 交易所在的区块链网络类型
     */
    private String chain;

    /**
     * 交易的代币类型，native代表链原生代币（如MATIC/BNB），usdt代表该链上的USDT
     */
    private String token;

    /**
     * 交易发送方的区块链地址
     */
    private String fromAddress;

    /**
     * 交易接收方的区块链地址
     */
    private String toAddress;

    /**
     * 交易金额，使用高精度十进制存储以保证准确性
     */
    private Long amount;

    /**
     * 区块链上的交易哈希ID（Transaction Hash），用于在区块浏览器中查询
     */
    private String txid;

    /**
     * 交易的当前状态：pending（处理中）、success（成功）、failed（失败）
     */
    private String status;

    /**
     * 交易记录创建时间
     */
    private String createdAt;

    /**
     * 交易记录最后更新时间
     */
    private String updatedAt;


}
