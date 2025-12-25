package com.sun.service.web3.utils;

import org.web3j.abi.TypeReference;
import org.web3j.abi.datatypes.Function;
import org.web3j.abi.datatypes.Type;
import org.web3j.abi.datatypes.generated.Uint256;
import org.web3j.crypto.Credentials;
import org.web3j.protocol.Web3j;
import org.web3j.protocol.core.RemoteCall;
import org.web3j.protocol.core.methods.response.TransactionReceipt;
import org.web3j.protocol.http.HttpService;
import org.web3j.tx.Contract;
import org.web3j.tx.ReadonlyTransactionManager;
import org.web3j.tx.TransactionManager;
import org.web3j.tx.gas.ContractGasProvider;
import org.web3j.tx.gas.DefaultGasProvider;

import java.math.BigDecimal;
import java.math.BigInteger;
import java.util.Arrays;
import java.util.Collections;

/**
 * @author: zjh
 * @Date: 2025年12月23日 22:37
 * @Description: ERC20
 * TODO
 */
public class ERC20 extends Contract {

    public static final String FUNC_BALANCE_OF = "balanceOf";
    public static final String FUNC_TRANSFER = "transfer";

    protected ERC20(String contractAddress, Web3j web3j, TransactionManager transactionManager, ContractGasProvider gasProvider) {
        super("", contractAddress, web3j, transactionManager, gasProvider);
    }

    protected ERC20(String contractAddress, Web3j web3j, Credentials credentials, ContractGasProvider gasProvider) {
        super("", contractAddress, web3j, credentials, gasProvider);
    }


    // 获取余额
    public RemoteCall<BigInteger> balanceOf(String owner) {
        final Function function = new Function(
                FUNC_BALANCE_OF,
                Arrays.asList(new org.web3j.abi.datatypes.Address(owner)),
                Collections.singletonList(new TypeReference<Uint256>() {}));
        return executeRemoteCallSingleValueReturn(function, BigInteger.class);
    }

    // 转账
    public RemoteCall<TransactionReceipt> transfer(String to, BigInteger value) {
        final Function function = new Function(
                FUNC_TRANSFER,
                Arrays.asList(new org.web3j.abi.datatypes.Address(to), new Uint256(value)),
                Collections.singletonList(new TypeReference<Type>() {}));
        return executeRemoteCallTransaction(function);
    }

    public static ERC20 load(String contractAddress, Web3j web3j, Credentials credentials, ContractGasProvider contractGasProvider) {
        return new ERC20(contractAddress, web3j, credentials, contractGasProvider);
    }

    public static ERC20 load(String contractAddress, Web3j web3j, TransactionManager transactionManager, ContractGasProvider contractGasProvider) {
        return new ERC20(contractAddress, web3j, transactionManager, contractGasProvider);
    }

    public static void main(String[] args) throws Exception {
        Web3j web3j = Web3j.build(new HttpService("https://polygon-rpc.com"));
        String contractAddress = "0xc2132D05D31c914a87C6611C10748AEb04B58e8F";
        String address = "0x43A05C733218CB4309EAC11778970A1e80014C11";
        // 2. 关键修复：使用ReadOnlyTransactionManager（只读操作无需Credentials）
        ReadonlyTransactionManager txManager = new ReadonlyTransactionManager(
                web3j,          // Web3j客户端
                address   // 任意地址（只读操作仅用于标识，无实际权限）
        );
        // 直接使用你现有的 getBalance 方法
        ERC20 erc20 = ERC20.load(contractAddress, web3j, txManager, new DefaultGasProvider());
        BigInteger value = erc20.balanceOf(address).send();
        BigDecimal divide = new BigDecimal(value).divide(new BigDecimal("1000000"), 6, BigDecimal.ROUND_HALF_UP);
        System.out.println(value);
        System.out.println(divide);
    }
}
