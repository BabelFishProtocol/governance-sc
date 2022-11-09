/* eslint-disable @typescript-eslint/camelcase */
/* eslint-disable spaced-comment */
/* eslint-disable @typescript-eslint/triple-slash-reference,spaced-comment */
/// <reference path="../../types/generated/index.d.ts" />
/// <reference path="../../types/generated/types.d.ts" />

import state from "../state";

export default async ({ artifacts }: { artifacts: Truffle.Artifacts },
    deployer, network, accounts): Promise<void> => {

    /*
    const c_TokenProxy = artifacts.require("TokenProxy");
    const d_Token = await state.conditionalDeploy(c_Token, 'Token',
        () => c_Token.new());
    await state.conditionalInitialize('Token', () => d_Token.initialize('XUSD', 'XUSD', 18));

    /*
    const d_TokenProxy = await state.conditionalDeploy(c_TokenProxy, 'TokenProxy',
        () => c_TokenProxy.new());

    const initData1: string = d_Token.contract.methods
        .initialize('XUSD', 'XUSD', 18).encodeABI();
    await state.conditionalInitialize('TokenProxy', () => {
        return d_TokenProxy.methods["initialize(address,address,bytes)"](
            d_Token.address,
            admin,
            initData1,
        );
    });
    */
    state.printState();
};
