package com.sun.service.web3.service;

import com.sun.service.core.service.IBoService;
import com.sun.service.web3.domain.TWalletAddress;
import com.sun.service.web3.domain.bo.TWalletAddressBo;
import com.sun.service.web3.domain.vo.TWalletAddressVo;

import java.util.List;

/**
 * 钱包地址，关联用户与其在不同区块链上的地址Service接口
 *
 * @author zjh
 * @date 2025-12-22
 */
public interface ITWalletAddressService extends IBoService<TWalletAddress, TWalletAddressVo, TWalletAddressBo> {

    public List<TWalletAddressVo> getUserWalletList(TWalletAddressBo params);
}
