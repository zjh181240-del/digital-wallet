package com.sun.service.utils;

import cn.hutool.crypto.SecureUtil;
import cn.hutool.crypto.symmetric.AES;
import com.sun.service.config.properties.ServiceConfig;
import org.web3j.crypto.ECKeyPair;
import org.web3j.crypto.Keys;
import org.web3j.crypto.MnemonicUtils;
import org.web3j.utils.Numeric;

import java.security.InvalidAlgorithmParameterException;
import java.security.NoSuchAlgorithmException;
import java.security.NoSuchProviderException;
import java.util.HashMap;
import java.util.Map;

/**
 * @author: zjh
 * @Date: 2025年12月23日 23:32
 * @Description: CryptoUtil
 * TODO
 */
public class CryptoUtil {

    public static void main(String[] args) throws Exception {
        ECKeyPair ecKeyPair = Keys.createEcKeyPair();
    }
    /**
     * 直接生成私钥+地址（无助记词，也可被MetaMask导入）
     */
    public static Map<String, String> generatePrivateKeyAndAddress() {
        try {
            // 1. 生成secp256k1标准私钥对
            ECKeyPair keyPair = Keys.createEcKeyPair();
            // 2. 私钥（16进制）
            String privateKey = Numeric.toHexStringNoPrefix(keyPair.getPrivateKey());
            // 3. 合规地址
            String address = "0x" + Keys.getAddress(keyPair);

            Map<String, String> wallet = new HashMap<>();
            wallet.put("privateKey", privateKey);
            wallet.put("address", address);
            return wallet;
        } catch (Exception e) {
            throw new RuntimeException("生成私钥+地址失败", e);
        }
    }

    /**
     * AES加密
     */
    public static String aesEncrypt(String content) {
        AES aes = SecureUtil.aes(ServiceConfig.getSecretKey().getBytes());
        return aes.encryptHex(content);
    }

    /**
     * AES解密
     */
    public static String aesDecrypt(String encryptContent) {
        AES aes = SecureUtil.aes(ServiceConfig.getSecretKey().getBytes());
        return aes.decryptStr(encryptContent);
    }
}
