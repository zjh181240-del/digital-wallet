/**
 * TODO
 *
 * @author: zjh
 * @Date: 2025年12月23日 18:33
 * @Description: TWalletAddressOfCreateBo
 */
export interface WalletAddressOfCreateBo {
    /**
     * 区块链网络类型，例如 polygon 或 bsc
     */
    chain: string

    /**
     * 区块链上的钱包地址（EVM地址，以0x开头，共42字符）
     */
    address: string

    /**
     * 私钥（AES加密存储）
     */
    privateKey: string

    /**
     * 助记词（AES加密存储）
     */
    mnemonic: string
}
/**
 * 钱包地址，关联用户与其在不同区块链上的地址业务对象 t_wallet_address
 *
 * @author zjh
 * @date 2025-12-22
 */
export interface WalletAddressBo {
    /**
     * 主键
     */
    id?: string

    /**
     * 用户ID
     */
    userId?: string

    /**
     * 区块链网络类型，例如 polygon 或 bsc
     */
    chain?: string

    /**
     * 区块链上的钱包地址（EVM地址，以0x开头，共42字符）
     */
    address?: string

    /**
     * 该钱包地址记录的创建时间
     */
    createdAt?: string
}

/**
 * 钱包地址，关联用户与其在不同区块链上的地址视图对象 t_wallet_address
 *
 * @author zjh
 * @date 2025-12-22
 */
export interface WalletAddressVo {
    /**
     * 主键
     */
    id?: string

    /**
     * 用户ID
     */
    userId?: string

    /**
     * 区块链网络类型，例如 polygon 或 bsc
     */
    chain?: string

    privateKey: string

    /**
     * 区块链上的钱包地址（EVM地址，以0x开头，共42字符）
     */
    address?: string

    /**
     * 该钱包地址记录的创建时间
     */
    createdAt?: string
}

