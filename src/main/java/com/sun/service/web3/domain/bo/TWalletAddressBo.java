package com.sun.service.web3.domain.bo;

import com.sun.service.web3.domain.TWalletAddress;
import com.sun.service.core.groups.AddGroup;
import com.sun.service.core.groups.EditGroup;
import io.github.linpeilie.annotations.AutoMapper;
import lombok.Data;
import lombok.EqualsAndHashCode;
import jakarta.validation.constraints.*;

/**
 * 钱包地址，关联用户与其在不同区块链上的地址业务对象 t_wallet_address
 *
 * @author zjh
 * @date 2025-12-22
 */
@Data
@AutoMapper(target = TWalletAddress.class, reverseConvertGenerate = false)
public class TWalletAddressBo {

    /**
     * 主键
     */
    @NotNull(message = "主键不能为空", groups = { EditGroup.class })
    private String id;

    /**
     * 用户ID
     */
    @NotNull(message = "用户ID不能为空", groups = { EditGroup.class })
    private String userId;

    /**
     * 区块链网络类型，例如 polygon 或 bsc
     */
    @NotBlank(message = "区块链网络类型，例如 polygon 或 bsc不能为空", groups = { EditGroup.class })
    private String chain;

    /**
     * 区块链上的钱包地址（EVM地址，以0x开头，共42字符）
     */
    @NotBlank(message = "区块链上的钱包地址（EVM地址，以0x开头，共42字符）不能为空", groups = { EditGroup.class })
    private String address;

    /**
     * 该钱包地址记录的创建时间
     */
    @NotBlank(message = "该钱包地址记录的创建时间不能为空", groups = { AddGroup.class, EditGroup.class })
    private String createdAt;


}
