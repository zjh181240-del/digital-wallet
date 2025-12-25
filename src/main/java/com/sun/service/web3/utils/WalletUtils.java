package com.sun.service.web3.utils;
import org.web3j.crypto.*;
import org.web3j.utils.Numeric;
/**
 * TODO
 *
 * @author: zjh
 * @Date: 2025年12月24日 09:20
 * @Description: WalletUtils
 */
public class WalletUtils {

    /**
     * 从私钥字符串加载钱包
     * @param privateKey 私钥字符串
     * @return Credentials对象
     */
    public static Credentials loadWalletFromPrivateKey(String privateKey) {
        // 移除可能的"0x"前缀
        if (privateKey.startsWith("0x")) {
            privateKey = privateKey.substring(2);
        }

        return Credentials.create(privateKey);
    }

    /**
     * 从助记词加载钱包
     * @param mnemonic 助记词
     * @return Credentials对象
     */
    public static Credentials loadWalletFromMnemonic(String mnemonic) throws Exception {
        byte[] seed = MnemonicUtils.generateSeed(mnemonic, "");
        ECKeyPair ecKeyPair = ECKeyPair.create(seed);
        return Credentials.create(ecKeyPair);
    }
}
