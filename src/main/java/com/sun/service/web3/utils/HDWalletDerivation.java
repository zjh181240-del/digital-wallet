//package com.sun.service.web3.utils;
//import org.bitcoinj.core.NetworkParameters;
//import org.bitcoinj.params.MainNetParams;
//import org.bitcoinj.crypto.*;
//import org.web3j.crypto.ECKeyPair;
//import org.web3j.crypto.Keys;
//import org.web3j.crypto.MnemonicUtils;
//import org.web3j.utils.Numeric;
//import java.math.BigInteger;
//import java.util.Map;
//
///**
// * @author: zjh
// * @Date: 2025年12月24日 00:30
// * @Description: HDWalletDerivation
// * TODO
// */
//public class HDWalletDerivation {
//
//    /**
//     * BIP44 标准路径派生钱包 m/44'/60'/0'/0/0
//     */
//    public static Map<String, String> deriveWalletFromMnemonic(String mnemonic) {
//        try {
//            // 1. 助记词转种子
//            byte[] seed = MnemonicUtils.generateSeed(mnemonic, "");
//
//            // 2. 创建根私钥
//            DeterministicKey rootPrivateKey = HDKeyDerivation.createMasterPrivKeyFromBytes(seed, null);
//
//            // 3. 按BIP44路径派生
//            DeterministicKey purpose = HDKeyDerivation.deriveChildKey(rootPrivateKey,
//                    ChildNumber.EXTENDED_KEY_CHILD_NUMBER.create(44)); // 44'
//            DeterministicKey coinType = HDKeyDerivation.deriveChildKey(purpose,
//                    ChildNumber.EXTENDED_KEY_CHILD_NUMBER.create(60)); // 60' (Ethereum)
//            DeterministicKey account = HDKeyDerivation.deriveChildKey(coinType,
//                    ChildNumber.EXTENDED_KEY_CHILD_NUMBER.create(0)); // 0'
//            DeterministicKey change = HDKeyDerivation.deriveChildKey(account,
//                    ChildNumber.NORMAL_KEY_CHILD_NUMBER.create(0)); // 0
//            DeterministicKey address = HDKeyDerivation.deriveChildKey(change,
//                    ChildNumber.NORMAL_KEY_CHILD_NUMBER.create(0)); // 0
//
//            // 4. 获取私钥和地址
//            BigInteger privateKey = address.getPrivKey();
//            ECKeyPair keyPair = ECKeyPair.create(privateKey);
//
//            Map<String, String> wallet = new HashMap<>();
//            wallet.put("privateKey", Numeric.toHexStringNoPrefix(keyPair.getPrivateKey()));
//            wallet.put("address", "0x" + Keys.getAddress(keyPair));
//
//            return wallet;
//        } catch (Exception e) {
//            throw new RuntimeException("助记词派生钱包失败", e);
//        }
//    }
//}
