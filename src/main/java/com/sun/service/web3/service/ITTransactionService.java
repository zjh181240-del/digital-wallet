package com.sun.service.web3.service;

import com.sun.service.core.service.IBoService;
import com.sun.service.web3.domain.TTransaction;
import com.sun.service.web3.domain.bo.TTransactionBo;
import com.sun.service.web3.domain.vo.TTransactionVo;

/**
 * 交易记录，记录用户发起的所有区块链交易Service接口
 *
 * @author zjh
 * @date 2025-12-22
 */
public interface ITTransactionService extends IBoService<TTransaction, TTransactionVo, TTransactionBo> {
}
