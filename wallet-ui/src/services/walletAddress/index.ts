import request from '@/utils/request'
import { AxiosPromise } from 'axios';
import { WalletAddressBo, WalletAddressOfCreateBo, WalletAddressVo } from "@/services/walletAddress/type.ts";

export const BASE_API = '/api/wallet';

export function createWallet(bo:WalletAddressOfCreateBo): AxiosPromise<Boolean> {
    return request.post(BASE_API, bo)
}

export function getWalletList(bo:WalletAddressBo): AxiosPromise<WalletAddressVo[]> {
    return request.get(BASE_API + '/getList',{params: bo})
}

export function deleteWallet(id: string): AxiosPromise<Boolean> {
    return request.delete(`${BASE_API}/${id}`)
}
