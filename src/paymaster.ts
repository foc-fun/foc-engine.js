import { Call, TypedData } from 'starknet';

// TODO: If api key provided, use avnu api, otherwise use engineUrl directly

export type DeploymentData = {
  class_hash: string;
  calldata: string[];
  salt: string;
  unique: string;
}

export type BuildGaslessTxInput = {
  network: string;
  account: string;
  calls: Call[];
  deploymentData?: DeploymentData;
}

export const buildGaslessTx = async (engineUrl: string, gaslessTxInput: BuildGaslessTxInput): Promise<TypedData> => {
  const buildGslessTxDataUrl = `${engineUrl}/paymaster/build-gasless-tx`;
  const gaslessTxRes: { data: TypedData } = await fetch(buildGslessTxDataUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(gaslessTxInput),
  }).then(res => res.json()).catch(err => {
    console.error('Error building gasless transaction:', err);
    throw new Error('Failed to build gasless transaction');
  });
  return gaslessTxRes.data;
}

export type SendGaslessTxInput = {
  account: string;
  txData: TypedData;
  signature: string[];
  network: string;
  deploymentData?: DeploymentData;
}

export const sendGaslessTx = async (engineUrl: string, gaslessTx: SendGaslessTxInput): Promise<string> => {
  const sendGaslessTxUrl = `${engineUrl}/paymaster/send-gasless-tx`;
  const gaslessTxRes: { data: string } = await fetch(sendGaslessTxUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(gaslessTx),
  }).then(res => res.json()).catch(err => {
    console.error('Error sending gasless transaction:', err);
    throw new Error('Failed to send gasless transaction');
  });
  return gaslessTxRes.data;
}
