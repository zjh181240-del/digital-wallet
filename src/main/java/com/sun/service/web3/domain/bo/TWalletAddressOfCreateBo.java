package com.sun.service.web3.domain.bo;

import com.baomidou.mybatisplus.annotation.TableId;
import com.sun.service.core.groups.EditGroup;
import com.sun.service.web3.domain.TWalletAddress;
import io.github.linpeilie.annotations.AutoMapper;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import lombok.Data;

/**
 * TODO
 *
 * @author: zjh
 * @Date: 2025年12月23日 18:33
 * @Description: TWalletAddressOfCreateBo
 */
@Data
@AutoMapper(target = TWalletAddress.class, reverseConvertGenerate = false)
public class TWalletAddressOfCreateBo {

    /**
     * 区块链网络类型，例如 polygon 或 bsc
     */
    @NotBlank(message = "区块链网络类型，例如 polygon 或 bsc不能为空", groups = {EditGroup.class})
    private String chain;

    /**
     * 区块链上的钱包地址（EVM地址，以0x开头，共42字符）
     */
    @NotBlank(message = "区块链上的钱包地址（EVM地址，以0x开头，共42字符）不能为空", groups = {EditGroup.class})
    @Pattern(regexp = "^0x[a-fA-F0-9]{40}$", message = "区块链上的钱包地址（EVM地址，以0x开头，共42字符）格式错误", groups = {EditGroup.class})
    private String address;

    /**
     * 私钥（AES加密存储）
     */
    @TableId(value = "private_key")
    @NotBlank(message = "私钥不能为空")
    private String privateKey;

    /**
     * 助记词（AES加密存储）
     */
    @TableId(value = "mnemonic")
//    @NotBlank(message = "助记词不能为空")
    private String mnemonic;
}
