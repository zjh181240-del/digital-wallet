package com.sun.service.web3.controller;

import com.sun.service.core.domian.R;
import com.sun.service.core.groups.AddGroup;
import com.sun.service.core.groups.EditGroup;
import com.sun.service.core.page.PageQuery;
import com.sun.service.core.page.TableDataInfo;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;
import com.sun.service.utils.MapstructUtils;
import com.sun.service.web3.domain.TTransaction;
import com.sun.service.web3.domain.bo.TTransactionBo;
import com.sun.service.web3.domain.vo.TTransactionVo;
import com.sun.service.web3.service.ITTransactionService;

import lombok.RequiredArgsConstructor;


import java.util.List;

/**
 * 交易记录，记录用户发起的所有区块链交易
 *
 * @author zjh
 * @date 2025-12-22
 */
@Validated
@RequiredArgsConstructor
@RestController
@RequestMapping("/transaction")
public class TTransactionController {

    private final ITTransactionService tTransactionService;

    /**
     * 查询交易记录，记录用户发起的所有区块链交易列表
     */
    @GetMapping("/list")
    public TableDataInfo<TTransactionVo> list(TTransactionBo bo, PageQuery pageQuery) {
        return tTransactionService.queryPageList(bo, pageQuery);
    }

    /**
     * 获取交易记录，记录用户发起的所有区块链交易详细信息
     *
     * @param id 主键
     */
    @GetMapping("/{id}")
    public R<TTransactionVo> getInfo(@NotNull(message = "主键不能为空")
                                     @PathVariable Long id) {
        return R.ok(tTransactionService.queryById(id));
    }

    /**
     * 新增交易记录，记录用户发起的所有区块链交易
     */
    @PostMapping()
    public R<Void> add(@Validated(AddGroup.class) @RequestBody TTransactionBo bo) {
        return R.toAjax(tTransactionService.insert(MapstructUtils.convert(bo, TTransaction.class)));
    }

    /**
     * 修改交易记录，记录用户发起的所有区块链交易
     */
    @PutMapping()
    public R<Void> edit(@Validated(EditGroup.class) @RequestBody TTransactionBo bo) {
        return R.toAjax(tTransactionService.updateById(MapstructUtils.convert(bo, TTransaction.class)));
    }

    /**
     * 删除交易记录，记录用户发起的所有区块链交易
     *
     * @param ids 主键串
     */
    @DeleteMapping("/{ids}")
    public R<Void> remove(@NotEmpty(message = "主键不能为空")
                          @PathVariable Long[] ids) {
        return R.toAjax(tTransactionService.deleteByIds(List.of(ids)));
    }
}
