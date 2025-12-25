package com.sun.service.web3.domain.bo;

import com.sun.service.web3.domain.TTransaction;
import com.sun.service.core.groups.AddGroup;
import com.sun.service.core.groups.EditGroup;
import io.github.linpeilie.annotations.AutoMapper;
import lombok.Data;
import lombok.EqualsAndHashCode;
import jakarta.validation.constraints.*;

/**
 * 交易记录，记录用户发起的所有区块链交易业务对象 t_transaction
 *
 * @author zjh
 * @date 2025-12-22
 */
@Data
@AutoMapper(target = TTransaction.class, reverseConvertGenerate = false)
public class TTransactionBo {

    /**
     * 主键
     */
    @NotNull(message = "主键不能为空", groups = { EditGroup.class })
    private String id;

    /**
     * 发起交易的用户ID
     */
    @NotNull(message = "发起交易的用户ID不能为空", groups = { AddGroup.class, EditGroup.class })
    private String userId;

    /**
     * 交易所在的区块链网络类型
     */
    @NotBlank(message = "交易所在的区块链网络类型不能为空", groups = { AddGroup.class, EditGroup.class })
    private String chain;

    /**
     * 交易的代币类型，native代表链原生代币（如MATIC/BNB），usdt代表该链上的USDT
     */
    @NotBlank(message = "交易的代币类型，native代表链原生代币（如MATIC/BNB），usdt代表该链上的USDT不能为空", groups = { AddGroup.class, EditGroup.class })
    private String token;

    /**
     * 交易发送方的区块链地址
     */
    @NotBlank(message = "交易发送方的区块链地址不能为空", groups = { AddGroup.class, EditGroup.class })
    private String fromAddress;

    /**
     * 交易接收方的区块链地址
     */
    @NotBlank(message = "交易接收方的区块链地址不能为空", groups = { AddGroup.class, EditGroup.class })
    private String toAddress;

    /**
     * 交易金额，使用高精度十进制存储以保证准确性
     */
    @NotNull(message = "交易金额，使用高精度十进制存储以保证准确性不能为空", groups = { AddGroup.class, EditGroup.class })
    private Long amount;

    /**
     * 区块链上的交易哈希ID（Transaction Hash），用于在区块浏览器中查询
     */
    @NotBlank(message = "区块链上的交易哈希ID（Transaction Hash），用于在区块浏览器中查询不能为空", groups = { AddGroup.class, EditGroup.class })
    private String txid;

    /**
     * 交易的当前状态：pending（处理中）、success（成功）、failed（失败）
     */
    @NotBlank(message = "交易的当前状态：pending（处理中）、success（成功）、failed（失败）不能为空", groups = { AddGroup.class, EditGroup.class })
    private String status;

    /**
     * 交易记录创建时间
     */
    @NotBlank(message = "交易记录创建时间不能为空", groups = { AddGroup.class, EditGroup.class })
    private String createdAt;

    /**
     * 交易记录最后更新时间
     */
    @NotBlank(message = "交易记录最后更新时间不能为空", groups = { AddGroup.class, EditGroup.class })
    private String updatedAt;


}
