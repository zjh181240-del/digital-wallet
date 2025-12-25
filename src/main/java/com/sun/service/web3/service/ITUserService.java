package com.sun.service.web3.service;

import com.sun.service.core.service.IBoService;
import com.sun.service.web3.domain.TUser;
import com.sun.service.web3.domain.bo.TUserBo;
import com.sun.service.web3.domain.vo.TUserVo;

/**
 * 用户Service接口
 *
 * @author zjh
 * @date 2025-12-22
 */
public interface ITUserService extends IBoService<TUser, TUserVo, TUserBo> {
    TUserVo selectByUserName(String username);
}
