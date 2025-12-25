package com.sun.service.web3.service.impl;

import com.sun.service.core.service.impl.BoServiceImpl;
import com.sun.service.web3.domain.TTransaction;
import com.sun.service.web3.domain.bo.TTransactionBo;
import com.sun.service.web3.domain.vo.TTransactionVo;
import com.sun.service.web3.mapper.TTransactionMapper;
import com.sun.service.web3.service.ITTransactionService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

/**
 * 交易记录，记录用户发起的所有区块链交易Service业务层处理
 *
 * @author zjh
 * @date 2025-12-22
 */
@RequiredArgsConstructor
@Service
public class TTransactionServiceImpl extends BoServiceImpl<TTransaction, TTransactionMapper, TTransactionVo, TTransactionBo> implements ITTransactionService {
}
