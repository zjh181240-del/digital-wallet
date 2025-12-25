package com.sun.service.web3.utils;

import org.web3j.crypto.*;
import org.web3j.utils.Numeric;
import java.util.Arrays;
import java.math.BigInteger;

/**
 * @author: zjh
 * @Date: 2025年12月24日 00:29
 * @Description: WalletDerivation
 * TODO
 */
public class WalletDerivation {

    /**
     * 通过助记词生成钱包凭证
     */
    public static Credentials getCredentialsFromMnemonic(String mnemonic) {
        // 助记词转种子
        byte[] seed = MnemonicUtils.generateSeed(mnemonic, "");

        // 从种子生成密钥对
        ECKeyPair keyPair = ECKeyPair.create(Hash.sha256(seed));

        // 创建凭证
        return Credentials.create(keyPair);
    }

    /**
     * 获取钱包地址
     */
    public static String getAddressFromMnemonic(String mnemonic) {
        Credentials credentials = getCredentialsFromMnemonic(mnemonic);
        return credentials.getAddress();
    }

    /**
     * 获取私钥十六进制字符串
     */
    public static String getPrivateKeyFromMnemonic(String mnemonic) {
        Credentials credentials = getCredentialsFromMnemonic(mnemonic);
        return credentials.getEcKeyPair().getPrivateKey().toString(16);
    }
}
