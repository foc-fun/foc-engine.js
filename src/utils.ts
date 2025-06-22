import {
  FOC_ENGINE_MAINNET_API_URL,
  FOC_ENGINE_SEPOLIA_API_URL,
  FOC_ENGINE_DEVNET_API_URL,
} from "./constants";

export const getFocEngineUrl = (network: string): string => {
  switch (network) {
    case "SN_MAINNET":
      return FOC_ENGINE_MAINNET_API_URL;
    case "SN_SEPOLIA":
      return FOC_ENGINE_SEPOLIA_API_URL;
    case "SN_DEVNET":
      return FOC_ENGINE_DEVNET_API_URL;
    default:
      throw new Error(`Unsupported network: ${network} (supported: SN_MAINNET, SN_SEPOLIA, SN_DEVNET)`);
  }
}

module.exports = {
  getFocEngineUrl,
};
