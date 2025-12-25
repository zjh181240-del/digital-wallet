package com.sun.service.web3.service.impl;

import com.baomidou.mybatisplus.core.toolkit.Wrappers;
import com.sun.service.core.service.impl.BoServiceImpl;
import com.sun.service.web3.domain.TUser;
import com.sun.service.web3.domain.bo.TUserBo;
import com.sun.service.web3.domain.vo.TUserVo;
import com.sun.service.web3.mapper.TUserMapper;
import com.sun.service.web3.service.ITUserService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

/**
 * 用户Service业务层处理
 *
 * @author zjh
 * @date 2025-12-22
 */
@RequiredArgsConstructor
@Service
public class TUserServiceImpl extends BoServiceImpl<TUser, TUserMapper, TUserVo, TUserBo> implements ITUserService {
    @Override
    public TUserVo selectByUserName(String username) {
        return getBaseMapper().selectVoOne(Wrappers.lambdaQuery(TUser.class).eq(TUser::getUsername, username));
    }
}
