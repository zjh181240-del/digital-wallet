package com.sun.service.web3.service.impl;

import com.sun.service.config.web3.Web3jWrapper;
import com.sun.service.core.domian.Balance;
import com.sun.service.web3.enums.ChainEnum;
import com.sun.service.web3.utils.ERC20;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.util.Assert;
import org.web3j.abi.FunctionEncoder;
import org.web3j.abi.FunctionReturnDecoder;
import org.web3j.abi.TypeReference;
import org.web3j.abi.datatypes.Address;
import org.web3j.abi.datatypes.Function;
import org.web3j.abi.datatypes.Type;
import org.web3j.abi.datatypes.generated.Uint256;
import org.web3j.crypto.Credentials;
import org.web3j.protocol.Web3j;
import org.web3j.protocol.core.DefaultBlockParameterName;
import org.web3j.protocol.core.methods.request.Transaction;
import org.web3j.protocol.core.methods.response.EthCall;
import org.web3j.protocol.core.methods.response.EthGetBalance;
import org.web3j.protocol.core.methods.response.EthGetTransactionReceipt;
import org.web3j.protocol.core.methods.response.EthSendTransaction;
import org.web3j.protocol.http.HttpService;
import org.web3j.tx.ReadonlyTransactionManager;
import org.web3j.tx.gas.DefaultGasProvider;
import org.web3j.utils.Convert;

import java.io.IOException;
import java.math.BigDecimal;
import java.math.BigInteger;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ExecutionException;

/**
 * ERC协议相关接口
 *
 * @author: zjh
 * @Date: 2025年12月23日 18:00
 * @Description: ERC20Service
 */
@RequiredArgsConstructor
@Service
public class BlockchainService {

    private static final BigDecimal WEI = new BigDecimal(10000);
    private final Web3jWrapper web3jConfigPolygon;
    private final Web3jWrapper web3jConfigBnb;

    private static Map<ChainEnum, Web3jWrapper> web3jMap;

    @PostConstruct
    public void init() {
        web3jMap = Map.of(ChainEnum.POLYGON, web3jConfigPolygon, ChainEnum.BNB, web3jConfigBnb);
    }
    private Web3jWrapper getWeb3jWrapper(ChainEnum chain) {
        Web3jWrapper web3jWrapper = web3jMap.get(chain);
        Assert.notNull(web3jWrapper, "chain:[" + chain.getValue() + "] is not supported");
        return web3jWrapper;
    }

    public String broadcastTransaction(ChainEnum chain, String signedTransaction) throws IOException {
        Web3jWrapper web3jWrapper = getWeb3jWrapper(chain);
        Web3j web3j = web3jWrapper.getWeb3j();

        EthSendTransaction response = web3j.ethSendRawTransaction(signedTransaction).send();

        if (response.hasError()) {
            throw new RuntimeException("交易广播失败: " + response.getError().getMessage());
        }

        return response.getTransactionHash();
    }

    public String getTransactionStatus(ChainEnum chain, String txid) throws IOException {
        Web3jWrapper web3jWrapper = getWeb3jWrapper(chain);
        Web3j web3j = web3jWrapper.getWeb3j();

        EthGetTransactionReceipt receipt = web3j.ethGetTransactionReceipt(txid).send();

        if (receipt.getTransactionReceipt().isPresent()) {
            return receipt.getTransactionReceipt().get().getStatus();
        }
        return null; // 交易尚未被打包
    }


    /**
     * 获取ERC-20 token指定地址余额
     *
     * @param address         查询地址
     * @param contractAddress 合约地址
     * @return
     * @throws ExecutionException
     * @throws InterruptedException
     */
    public String getUsdtBalance(Web3j web3j, String address, String contractAddress) throws Exception {
        ReadonlyTransactionManager txManager = new ReadonlyTransactionManager(
                web3j,          // Web3j客户端
                address   // 任意地址（只读操作仅用于标识，无实际权限）
        );
        ERC20 erc20 = ERC20.load(contractAddress, web3j, txManager, new DefaultGasProvider());
        BigInteger value = erc20.balanceOf(address).send();
        BigDecimal balanceValue = new BigDecimal(value).divide(WEI, 6, BigDecimal.ROUND_HALF_UP);
        return balanceValue.toString();
    }

    // 获取原生币余额（MATIC/BNB）
    public Balance getNativeBalance(ChainEnum chain, String address) throws Exception {
        Balance balances = new Balance();

        Web3jWrapper web3jWrapper = getWeb3jWrapper(chain);

        Web3j web3j = web3jWrapper.getWeb3j();
        String usdt = web3jWrapper.getConfig().getUsdtContract();
        // 获取原生币余额
        EthGetBalance ethGetBalance = web3j.ethGetBalance(address, DefaultBlockParameterName.LATEST).send();
        BigInteger nativeBalance = ethGetBalance.getBalance();
        balances.setNativeCurrency(Convert.fromWei(nativeBalance.toString(), Convert.Unit.ETHER).toString());

        balances.setUsdt(getUsdtBalance(web3j, address, usdt));

        return balances;
    }
}
