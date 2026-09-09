// Loopin Sphere Mail — Configurable Personal Digital Server & Storage Engine
// Visionary 1 YB (Yottabyte) Virtual Capacity Architecture with Honest Sparse Allocation

export interface StorageTierSpec {
  tierId: string;
  name: string;
  type: 'hot_nvme' | 'warm_object' | 'cold_vault' | 'virtual_sparse';
  description: string;
  physicalAllocationBytes: number;
  virtualAddressableBytes: number;
  encryptionStandard: string;
  redundancy: string;
  latencyProfile: string;
}

export interface VirtualStorageArchitecture {
  visionaryCapacityTitle: string; // "1 YB (Yottabyte) Sparse Virtual Architecture"
  visionaryCapacityBytes: string; // "1,000,000,000,000,000,000,000,000 bytes (10^24 B / 2^80 Address Space)"
  transparencyNotice: string;
  tiers: StorageTierSpec[];
  sparseAllocationStrategy: {
    addressBitWidth: number; // 128-bit Content-Addressable Space
    blockAllocationMode: 'sparse_on_demand' | 'zero_page_coalescing';
    physicalPreAllocation: false; // Explicitly FALSE: zero false physical allocation
    maxSparseIndexBlocks: number;
  };
}

export const VIRTUAL_STORAGE_ARCHITECTURE: VirtualStorageArchitecture = {
  visionaryCapacityTitle: '1 YB (Yottabyte) Sparse Virtual Capacity Vision',
  visionaryCapacityBytes: '1,000,000,000,000,000,000,000,000 Bytes (10²⁴ B / 2⁸⁰ Addressing Space)',
  transparencyNotice:
    'Loopin Sphere Mail rejects fabricated physical storage claims. While the architectural address space is mathematically structured for up to 1 YB sparse addressability using 128-bit Content-Addressable Storage (CAS), physical hardware capacity is provisioned honestly based on active node quotas (default: 50 GB baseline). No false physical disks are claimed.',
  sparseAllocationStrategy: {
    addressBitWidth: 128,
    blockAllocationMode: 'sparse_on_demand',
    physicalPreAllocation: false,
    maxSparseIndexBlocks: 1000000,
  },
  tiers: [
    {
      tierId: 'tier-0-hot',
      name: 'Tier 0: Hot NVMe SSD Enclave',
      type: 'hot_nvme',
      description: 'Ultra-low-latency in-memory cache and NVMe storage for instant message indexing, draft autosave, and zero-knowledge search trees.',
      physicalAllocationBytes: 5 * 1024 * 1024 * 1024, // 5 GB
      virtualAddressableBytes: 5 * 1024 * 1024 * 1024,
      encryptionStandard: 'ChaCha20-Poly1305 Hardware Ring',
      redundancy: 'Triple-replicated local RAID 10',
      latencyProfile: '< 1.2 ms',
    },
    {
      tierId: 'tier-1-warm',
      name: 'Tier 1: Warm Sovereign Object Mesh',
      type: 'warm_object',
      description: 'Decentralized distributed object mesh for verified attachments, media assets, and personal digital server document repositories.',
      physicalAllocationBytes: 45 * 1024 * 1024 * 1024, // 45 GB (totaling 50 GB physical baseline)
      virtualAddressableBytes: 500 * 1024 * 1024 * 1024 * 1024, // 500 TB addressable
      encryptionStandard: 'AES-256-GCM Zero-Knowledge Enclave',
      redundancy: 'Geo-distributed Reed-Solomon 8+4 erasure coding',
      latencyProfile: '< 35 ms',
    },
    {
      tierId: 'tier-2-cold',
      name: 'Tier 2: Cold Zero-Knowledge Vault',
      type: 'cold_vault',
      description: 'Immutable zero-knowledge long-term archival storage with hardware air-gap attestation and client-held biometric keys.',
      physicalAllocationBytes: 0, // dynamic on demand
      virtualAddressableBytes: 10 * 1024 * 1024 * 1024 * 1024 * 1024, // 10 PB addressable
      encryptionStandard: 'XChaCha20-Poly1305 + Argon2id Key Derivation',
      redundancy: 'Triple-datacenter deep freeze escrow',
      latencyProfile: 'Asynchronous fetch (< 450 ms)',
    },
    {
      tierId: 'tier-3-sparse-universe',
      name: 'Tier 3: 1 YB Sparse Virtual Addressing Plane',
      type: 'virtual_sparse',
      description: 'Visionary 1 Yottabyte virtual address space utilizing 128-bit cryptographic block pointers and sparse zero-page indexing without false physical allocation.',
      physicalAllocationBytes: 0, // strictly 0 until real physical bytes are committed
      virtualAddressableBytes: 1e24, // 1 YB = 10^24 bytes
      encryptionStandard: 'BLAKE3 Merkle-DAG + Sovereign Post-Quantum Lattice',
      redundancy: 'Content-Addressable Cryptographic Distributed Hash Table (DHT)',
      latencyProfile: 'Virtual Content Resolution Pipeline',
    },
  ],
};

export function calculateStorageTelemetry(usedBytes: number, baselineQuotaBytes = 50 * 1024 * 1024 * 1024) {
  const percentUsed = Math.min(100, Math.max(0.05, (usedBytes / baselineQuotaBytes) * 100));
  return {
    realUsedBytes: usedBytes,
    realQuotaBytes: baselineQuotaBytes,
    percentUsed: Number(percentUsed.toFixed(2)),
    visionaryCapacity: VIRTUAL_STORAGE_ARCHITECTURE.visionaryCapacityTitle,
    visionaryBytesFormatted: '1 YB (1,000,000,000 TB)',
    truthStatement: VIRTUAL_STORAGE_ARCHITECTURE.transparencyNotice,
    tiers: VIRTUAL_STORAGE_ARCHITECTURE.tiers,
  };
}
