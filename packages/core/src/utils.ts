import {
  FOC_ENGINE_MAINNET_API_URL,
  FOC_ENGINE_SEPOLIA_API_URL,
  FOC_ENGINE_DEVNET_API_URL,
} from "./constants";

/**
 * Normalizes various network name formats to the standard FOC Engine format
 * Supports: mainnet, sepolia, devnet, sn_mainnet, sn_sepolia, sn_devnet, SN_MAINNET, SN_SEPOLIA, SN_DEVNET
 */
export const normalizeNetworkName = (network: string): string => {
  const normalizedInput = network.toLowerCase().trim();
  
  switch (normalizedInput) {
    case "mainnet":
    case "sn_mainnet":
      return "SN_MAINNET";
    case "sepolia":
    case "sn_sepolia":
      return "SN_SEPOLIA";
    case "devnet":
    case "sn_devnet":
      return "SN_DEVNET";
    default:
      // Try to match if it's already in the correct format
      const upperNetwork = network.toUpperCase();
      if (["SN_MAINNET", "SN_SEPOLIA", "SN_DEVNET"].includes(upperNetwork)) {
        return upperNetwork;
      }
      throw new Error(`Unsupported network: ${network} (supported: mainnet, sepolia, devnet, sn_mainnet, sn_sepolia, sn_devnet, SN_MAINNET, SN_SEPOLIA, SN_DEVNET)`);
  }
};

export const getFocEngineUrl = (network: string): string => {
  const normalizedNetwork = normalizeNetworkName(network);
  
  switch (normalizedNetwork) {
    case "SN_MAINNET":
      return FOC_ENGINE_MAINNET_API_URL;
    case "SN_SEPOLIA":
      return FOC_ENGINE_SEPOLIA_API_URL;
    case "SN_DEVNET":
      return FOC_ENGINE_DEVNET_API_URL;
    default:
      throw new Error(`Unsupported network: ${normalizedNetwork} (supported: SN_MAINNET, SN_SEPOLIA, SN_DEVNET)`);
  }
};
