package com.sun.service.web3.controller;

import com.sun.service.core.domian.R;
import com.sun.service.utils.MapstructUtils;
import com.sun.service.web3.domain.TWalletAddress;
import com.sun.service.web3.domain.bo.TWalletAddressBo;
import com.sun.service.web3.domain.bo.TWalletAddressOfCreateBo;
import com.sun.service.web3.domain.vo.TWalletAddressVo;
import com.sun.service.web3.service.ITWalletAddressService;
import com.sun.service.web3.utils.WalletUtils;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import lombok.RequiredArgsConstructor;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;
import org.web3j.crypto.Credentials;

import java.util.List;

/**
 * 钱包地址，关联用户与其在不同区块链上的地址
 *
 * @author zjh
 * @date 2025-12-22
 */
@Validated
@RequiredArgsConstructor
@RestController
@RequestMapping("/api/wallet")
public class TWalletAddressController {

    private final ITWalletAddressService baseService;

    /**
     * 创建钱包
     *
     * @param bo
     * @return
     */
    @PostMapping()
    public R<Boolean> createWallet(@Valid @RequestBody TWalletAddressOfCreateBo bo) {
        boolean success = baseService.insert(MapstructUtils.convert(bo, TWalletAddress.class));
        return R.ok(success);
    }

//    /**
//     * 导入钱包根据私钥
//     *
//     * @param privateKey
//     * @return
//     */
//    @PostMapping("/importByPrivateKey")
//    public R<Boolean> importByPrivateKey(@Validated @RequestParam String privateKey) {
//
//        Credentials credentials = WalletUtils.loadWalletFromPrivateKey(privateKey);
//        String address = credentials.getAddress();
//        TWalletAddress insert = new TWalletAddress();
//        insert.setAddress("0x" + address);
//        insert.setMnemonic("");
//        boolean success = baseService.insert(insert);
//        return R.ok(success);
//    }
//
//    @PostMapping("/importByMnemonic")
//    public R<Boolean> importByMnemonic(@Validated @RequestParam String mnemonic) {
//        boolean success = baseService.insert(MapstructUtils.convert(bo, TWalletAddress.class));
//        return R.ok(success);
//    }

    @GetMapping("/getList")
    public R<List<TWalletAddressVo>> getWalletList(TWalletAddressBo bo) {
        List<TWalletAddressVo> wallets = baseService.getUserWalletList(bo);
        return R.ok(wallets);
    }

    /**
     * 删除钱包地址，关联用户与其在不同区块链上的地址
     *
     * @param ids 主键串
     */
    @DeleteMapping("/{ids}")
    public R<Void> remove(@NotEmpty(message = "主键不能为空")
                          @PathVariable Long[] ids) {
        return R.toAjax(baseService.deleteByIds(List.of(ids)));
    }
}
