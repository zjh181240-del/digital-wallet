package com.sun.service.web3.utils;
import org.web3j.crypto.Credentials;
import org.web3j.crypto.ECKeyPair;
import org.web3j.utils.Numeric;
import java.math.BigInteger;

/**
 * @author: zjh
 * @Date: 2025年12月24日 00:30
 * @Description: PrivateKeyWallet
 * TODO
 */
public class PrivateKeyWallet {

    /**
     * 从十六进制私钥字符串创建钱包凭证
     */
    public static Credentials getCredentialsFromPrivateKey(String privateKeyHex) {
        // 私钥字符串转BigInteger
        BigInteger privateKey = Numeric.toBigInt(privateKeyHex);

        // 创建密钥对
        ECKeyPair keyPair = ECKeyPair.create(privateKey);

        // 创建凭证
        return Credentials.create(keyPair);
    }

    /**
     * 从BigInteger私钥创建钱包凭证
     */
    public static Credentials getCredentialsFromPrivateKey(BigInteger privateKey) {
        ECKeyPair keyPair = ECKeyPair.create(privateKey);
        return Credentials.create(keyPair);
    }

    /**
     * 获取钱包地址
     */
    public static String getAddressFromPrivateKey(String privateKeyHex) {
        Credentials credentials = getCredentialsFromPrivateKey(privateKeyHex);
        return credentials.getAddress();
    }
}
