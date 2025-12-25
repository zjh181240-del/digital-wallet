package com.sun.service.web3.utils;

import org.web3j.crypto.Credentials;

/**
 * @author: zjh
 * @Date: 2025年12月24日 00:31
 * @Description: WalletExample
 * TODO
 */
public class WalletExample {

    public static void main(String[] args) {
        // 示例助记词
        String mnemonic = "word1 word2 word3 word4 word5 word6 word7 word8 word9 word10 word11 word12";

        // 通过助记词获取钱包
        Credentials credentials = WalletDerivation.getCredentialsFromMnemonic(mnemonic);
        System.out.println("Address: " + credentials.getAddress());
        System.out.println("Private Key: " + credentials.getEcKeyPair().getPrivateKey().toString(16));

        // 通过私钥获取钱包
        String privateKeyHex = "your_private_key_hex_here";
        Credentials credentials2 = PrivateKeyWallet.getCredentialsFromPrivateKey(privateKeyHex);
        System.out.println("Address from private key: " + credentials2.getAddress());
    }
}
