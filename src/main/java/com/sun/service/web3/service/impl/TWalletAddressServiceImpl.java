package com.sun.service.web3.service.impl;

import cn.hutool.core.collection.CollectionUtil;
import cn.hutool.core.util.ObjectUtil;
import cn.hutool.core.util.StrUtil;
import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.toolkit.Wrappers;
import com.sun.service.core.model.LoginUser;
import com.sun.service.core.service.impl.BoServiceImpl;
import com.sun.service.exceptions.ServiceException;
import com.sun.service.utils.CryptoUtil;
import com.sun.service.utils.LoginHelper;
import com.sun.service.utils.MapstructUtils;
import com.sun.service.web3.domain.TWalletAddress;
import com.sun.service.web3.domain.bo.TWalletAddressBo;
import com.sun.service.web3.domain.vo.TWalletAddressVo;
import com.sun.service.web3.mapper.TWalletAddressMapper;
import com.sun.service.web3.service.ITWalletAddressService;
import lombok.RequiredArgsConstructor;
import org.springframework.dao.DuplicateKeyException;
import org.springframework.stereotype.Service;

import java.io.Serializable;
import java.util.Collection;
import java.util.HashSet;
import java.util.List;

/**
 * 钱包地址，关联用户与其在不同区块链上的地址Service业务层处理
 *
 * @author zjh
 * @date 2025-12-22
 */
@RequiredArgsConstructor
@Service
public class TWalletAddressServiceImpl extends BoServiceImpl<TWalletAddress, TWalletAddressMapper, TWalletAddressVo, TWalletAddressBo> implements ITWalletAddressService {

    private LambdaQueryWrapper<TWalletAddress> getQueryWrapper(TWalletAddressBo params) {
        LambdaQueryWrapper<TWalletAddress> queryWrapper = new LambdaQueryWrapper<>();

        if (ObjectUtil.isNotNull(params)) {
            queryWrapper.eq(ObjectUtil.isNotNull(params.getUserId()), TWalletAddress::getUserId, params.getUserId());
            queryWrapper.eq(ObjectUtil.isNotNull(params.getAddress()), TWalletAddress::getAddress, params.getAddress());
            queryWrapper.eq(ObjectUtil.isNotNull(params.getChain()), TWalletAddress::getChain, params.getChain());
            queryWrapper.eq(ObjectUtil.isNotNull(params.getId()), TWalletAddress::getId, params.getId());
        }
        return queryWrapper;
    }

    @Override
    public boolean deleteByIds(Collection<? extends Serializable> ids) {
        HashSet<? extends Serializable> _ids = CollectionUtil.newHashSet(ids);
        LoginUser loginUser = LoginHelper.getLoginUser();
        long count = count(Wrappers.lambdaQuery(TWalletAddress.class)
                .eq(TWalletAddress::getUserId, loginUser.getUserId())
                .in(TWalletAddress::getId, _ids));
        if (count != _ids.size()) {
            throw new ServiceException("删除失败，请检查权限!");
        }
        return super.deleteByIds(ids);
    }

    @Override
    public List<TWalletAddressVo> getUserWalletList(TWalletAddressBo params) {
        LoginUser loginUser = LoginHelper.getLoginUser();
        if (ObjectUtil.isNull(params)) {
            params = new TWalletAddressBo();
        }
        params.setUserId(loginUser.getUserId());
        List<TWalletAddress> dataList = baseMapper.selectList(getQueryWrapper(params));
        return MapstructUtils.convert(dataList, TWalletAddressVo.class);
    }

    @Override
    public boolean insert(TWalletAddress entity) {
        LoginUser loginUser = LoginHelper.getLoginUser();
        entity.setUserId(loginUser.getUserId());
        // 1. 加密助记词/私钥（前端已生成标准格式，后端仅加密存储）
        if(StrUtil.isNotEmpty(entity.getMnemonic())){
            String encryptMnemonic = CryptoUtil.aesEncrypt(entity.getMnemonic());
            entity.setMnemonic(encryptMnemonic);
        }
//        String encryptPrivateKey = CryptoUtil.aesEncrypt(entity.getPrivateKey());
//        entity.setPrivateKey(encryptPrivateKey);
        try {
            return super.insert(entity);
        } catch (DuplicateKeyException e) {
            throw new ServiceException("该钱包地址已存在!");
        }
    }
}
